import {
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  Claim_Firestore,
  LootboxID,
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
  getUntrustedClaimsForUser,
  getUnverifiedClaimsForUser,
} from "../api/firestore";
import { IIdpUser } from "../api/identityProvider/interface";

// WARNING - this message is stupidly parsed in the frontend for internationalization.
//           if you change it, make sure you update @lootbox/widgets file OnboardingSignUp.tsx if needed
// Also this is duplicated in @firebase/functions
const HACKY_MESSAGE =
  "You have already accepted a referral for this tournament";

const MAX_UNVERIFIED_CLAIMS = 3;

interface ValidateClaimForCompletionResult {
  targetLootbox: Lootbox_Firestore;
  claim: Claim_Firestore;
}

/**
 * Claim is pending with no lootbox (or user) association & will transition to complete
 * This will throw if the claim is not valid for this operation
 */
export const validatePendingClaimForCompletion = async (
  claim: Claim_Firestore,
  claimer: IIdpUser,
  targetLootboxID: LootboxID
): Promise<ValidateClaimForCompletionResult> => {
  // ########################## BIG WARNING ##########################
  // ##                                                             ##
  // ##   Some validation logic is DUPLICATED in                    ##
  // ##   @cloudfns/firebase/functions                              ##
  // ##                                                             ##
  // ##                                                             ##
  // #################################################################

  if (claim.status !== ClaimStatus_Firestore.pending) {
    throw new Error(`Claim is invalid state ${claim.status}`);
  }
  // These claims should not have a lootbox ID
  if (claim.lootboxID) {
    throw new Error("Claim should not have a Lootbox association");
  }

  if (claim.claimerUserId) {
    throw new Error("Claim already has a claimer");
  }

  // User should have phone
  if (!claimer.phoneNumber) {
    throw new Error(
      "You need to verify your phone number to claim this ticket."
    );
  }

  const { lootbox: targetLootbox } = await _validateBaseClaimForCompletionStep(
    claimer,
    claim,
    targetLootboxID
  );

  // Valid, resolve the promise
  return {
    targetLootbox: targetLootbox,
    claim,
  };
};

interface ValidateUntrustedClaimResult {
  associatedLootbox: Lootbox_Firestore;
  claim: Claim_Firestore;
}

/**
 * Claim is untrusted state, but it should have a lootbox association etc
 * These untrusted claims have a claimerUserID that we also need to verify
 * This will throw if the claim is not valid for this operation
 */
export const validateUntrustedClaimForCompletion = async (
  claim: Claim_Firestore,
  claimer: IIdpUser
): Promise<ValidateUntrustedClaimResult> => {
  if (!claimer) {
    throw new Error("You need to login to claim a ticket.");
  }
  if (!claimer.phoneNumber) {
    throw new Error(
      "You need to verify your phone number to claim this ticket."
    );
  }
  if (claim.status !== ClaimStatus_Firestore.untrusted) {
    throw new Error(`Claim is invalid state ${claim.status}`);
  }
  // These claims should have a lootbox ID
  if (!claim.lootboxID) {
    throw new Error("Claim is not associated to Lootbox");
  }

  if ((claimer.id as unknown as UserID) !== claim.claimerUserId) {
    throw new Error("You are not the owner of this claim");
  }

  const { lootbox: associatedLootbox } =
    await _validateBaseClaimForCompletionStep(claimer, claim, claim.lootboxID);

  // Valid, resolve the promise
  return {
    associatedLootbox,
    claim,
  };
};

/**
 * Claim is pending with no lootbox associations
 * This will throw if the claim is not valid for this operation & should be no claimerUserId
 */
export const validatePendingClaimForUntrusted = async (
  claim: Claim_Firestore,
  claimer: IIdpUser,
  targetLootboxID: LootboxID
) => {
  if (claim.status !== ClaimStatus_Firestore.pending) {
    throw new Error(`Claim is invalid state ${claim.status}`);
  }
  // These claims should not have a lootbox ID
  if (claim.lootboxID) {
    throw new Error("Claim should not have a Lootbox association");
  }

  if (claim.claimerUserId) {
    throw new Error("Claim should not have a claimerUserId");
  }

  // If the user is not verified, we have the restraint of only allowing them to claim 3 referrals
  const untrusted = await getUntrustedClaimsForUser(
    claimer.id as unknown as UserID
  );
  if (untrusted.length > MAX_UNVERIFIED_CLAIMS) {
    // NOTE: Be weary of making this bigger / removing it.
    throw new Error(
      "You already have 3 untrusted claims. Please verify your phone number to claim more."
    );
  }

  const { lootbox: targetLootbox } = await _validateBaseClaimForCompletionStep(
    claimer,
    claim,
    targetLootboxID
  );

  // Valid, resolve the promise
  return {
    targetLootbox: targetLootbox,
    claim,
  };
};

interface ValidatePendingClaimToUnVerifiedResult {
  targetLootbox: Lootbox_Firestore;
  claim: Claim_Firestore;
}

/**
 * No associated lootbox and it should be pending & should be no claimerUserId
 */
export const validatePendingClaimForPendingVerification = async (
  claim: Claim_Firestore,
  claimer: IIdpUser,
  targetLootboxID: LootboxID
): Promise<ValidatePendingClaimToUnVerifiedResult> => {
  if (claim.status !== ClaimStatus_Firestore.pending) {
    throw new Error(`Claim is invalid state ${claim.status}`);
  }
  // These claims should not have a lootbox ID
  if (claim.lootboxID) {
    throw new Error("Claim should not have a Lootbox association");
  }

  if (claim.claimerUserId) {
    throw new Error("Claim should not have a claimerUserId");
  }

  // If the user is not verified, we have the restraint of only allowing them to claim 3 referrals
  const unverifiedClaims = await getUnverifiedClaimsForUser(
    claimer.id as unknown as UserID
  );
  if (unverifiedClaims.length > MAX_UNVERIFIED_CLAIMS) {
    // NOTE: Be weary of making this bigger / removing it.
    throw new Error(
      "You already have 3 unverified referrals. Please verify your phone number to claim more."
    );
  }

  const { lootbox: targetLootbox } = await _validateBaseClaimForCompletionStep(
    claimer,
    claim,
    targetLootboxID
  );

  return {
    targetLootbox,
    claim,
  };
};

const _validateBaseClaimForCompletionStep = async (
  claimer: IIdpUser,
  claim: Claim_Firestore,
  targetLootboxID: LootboxID
): Promise<{
  lootbox: Lootbox_Firestore;
}> => {
  // ########################## BIG WARNING ##########################
  // ##                                                             ##
  // ##   Some validation logic is DUPLICATED in                    ##
  // ##   @cloudfns/firebase/functions                              ##
  // ##                                                             ##
  // ##                                                             ##
  // #################################################################

  if (claim?.timestamps?.deletedAt) {
    throw new Error("Claim not found");
  }

  if (claim.type === ClaimType_Firestore.reward) {
    throw new Error("Cannot complete a Reward type claim");
  }

  if ((claimer.id as unknown as UserID) === claim.referrerId) {
    throw new Error("You cannot redeem your own referral link!");
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
      claimer.id as unknown as UserIdpID,
      claim.tournamentId as TournamentID,
      1
    ),
    getTournamentById(claim.tournamentId),
    getReferralById(claim.referralId),
    getLootbox(targetLootboxID),
    getLootboxTournamentSnapshotByLootboxID(
      claim.tournamentId,
      targetLootboxID
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

  if (referral.referrerId === (claimer.id as unknown as UserID)) {
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

  return {
    lootbox,
  };
};
