import {
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  Claim_Firestore,
  LootboxStatus_Firestore,
  LootboxTournamentStatus_Firestore,
  Lootbox_Firestore,
  ReferralID,
  ReferralType_Firestore,
  TournamentID,
  UserID,
  UserIdpID,
} from "@wormgraph/helpers";
import {
  getCompletedClaimsForReferral,
  getCompletedUserReferralClaimsForTournament,
  getLootbox,
  getLootboxTournamentSnapshotByLootboxID,
  getReferralById,
  getTournamentById,
} from "../api/firestore";
import { IIdpUser } from "../api/identityProvider/interface";

// WARNING - this message is stupidly parsed in the frontend for internationalization.
//           if you change it, make sure you update @lootbox/widgets file OnboardingSignUp.tsx if needed
// Also this is duplicated in @firebase/functions
const HACKY_MESSAGE =
  "You have already accepted a referral for this tournament";

interface ValidateClaimForCompletionResult {
  lootbox: Lootbox_Firestore;
  claim: Claim_Firestore;
}

// Throws if the claim is not valid
export const validateClaimForCompletion = async (
  claim: Claim_Firestore,
  user: IIdpUser
): Promise<ValidateClaimForCompletionResult> => {
  // ########################## BIG WARNING ##########################
  // ##                                                             ##
  // ##   Some validation logic is DUPLICATED in                    ##
  // ##   @cloudfns/firebase/functions                              ##
  // ##                                                             ##
  // ##                                                             ##
  // #################################################################

  if (!user) {
    throw new Error("You need to login to claim a ticket.");
  }
  if (!claim || !!claim?.timestamps?.deletedAt) {
    throw new Error("Claim not found");
  }
  if ((user.id as unknown as UserID) === claim.referrerId) {
    throw new Error("You cannot redeem your own referral link!");
  }
  if (claim.status === ClaimStatus_Firestore.complete) {
    throw new Error("Claim already completed");
  }
  if (claim.type === ClaimType_Firestore.reward) {
    throw new Error("Cannot complete a Reward type claim");
  }

  if (!claim.lootboxID) {
    throw new Error("No Lootbox chosen");
  }

  // Make sure the user has not accepted a claim for a tournament before
  const [
    previousClaims,
    tournament,
    referral,
    lootbox,
    lootboxTournamentSnapshot,
  ] = await Promise.all([
    getCompletedUserReferralClaimsForTournament(
      user.id as unknown as UserIdpID,
      claim.tournamentId as TournamentID,
      1
    ),
    getTournamentById(claim.tournamentId),
    getReferralById(claim.referralId),
    getLootbox(claim.lootboxID),
    getLootboxTournamentSnapshotByLootboxID(
      claim.tournamentId,
      claim.lootboxID
    ),
  ]);

  if (!lootbox || !!lootbox?.timestamps?.deletedAt) {
    throw new Error("Lootbox not found");
  }
  if (
    lootbox.status === LootboxStatus_Firestore.disabled ||
    lootbox.status === LootboxStatus_Firestore.soldOut
  ) {
    throw new Error("Out of stock! Please select a different team.");
  }

  if (
    !lootboxTournamentSnapshot ||
    !!lootboxTournamentSnapshot.timestamps.deletedAt
  ) {
    throw new Error("Lootbox Tournament Snapshot not found");
  }

  if (
    lootboxTournamentSnapshot.status ===
    LootboxTournamentStatus_Firestore.disabled
  ) {
    throw new Error("Out of stock! Please select a different team.");
  }

  if (!referral || !!referral.timestamps.deletedAt) {
    throw new Error("Referral not found");
  }

  if (referral.referrerId === (user.id as unknown as UserID)) {
    throw new Error("You cannot redeem your own referral link!");
  }
  if (!tournament || !!tournament.timestamps.deletedAt) {
    throw new Error("Tournament not found");
  }

  if (
    referral.type === ReferralType_Firestore.viral ||
    referral.type === ReferralType_Firestore.genesis ||
    claim.type === ClaimType_Firestore.referral
  ) {
    if (previousClaims.length > 0) {
      throw new Error(
        // WARNING - this message is stupidly parsed in the frontend for internationalization.
        HACKY_MESSAGE
      );
    }
  }

  if (referral.type === ReferralType_Firestore.one_time) {
    const previousClaimsForReferral = await getCompletedClaimsForReferral(
      referral.id as ReferralID,
      1
    );
    if (previousClaimsForReferral.length > 0) {
      throw new Error("This referral link has already been used");
    }
  }

  // Valid, resolve the promise
  return {
    lootbox,
    claim,
  };
};
