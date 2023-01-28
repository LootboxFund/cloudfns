import {
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  Claim_Firestore,
  isLootboxClaimsExcludedFromEventLimits,
  LootboxID,
  LootboxStatus_Firestore,
  LootboxTournamentStatus_Firestore,
  LootboxType,
  Lootbox_Firestore,
  ReferralID,
  ReferralSlug,
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
  getReferralBySlug,
  getTournamentById,
  getUnverifiedClaimsForUser,
  getUserClaimCountForLootbox,
  getUserClaimCountForTournament,
  createStartingClaim,
} from "../../api/firestore";
import { IIdpUser } from "../../api/identityProvider/interface";
import { ReferralType } from "../../graphql/generated/types";
import { convertClaimPrivacyScopeGQLToDB } from "../../lib/referral";

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

interface ValidatePendingClaimToUnVerifiedResult {
  targetLootbox: Lootbox_Firestore;
  claim: Claim_Firestore;
}

/**
 * No associated lootbox and it should be pending & should be no claimerUserId
 */
export const validatePendingClaimForUnverified = async (
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

  if (unverifiedClaims.find((c) => c.referralId === claim.referralId)) {
    throw new Error(
      "You have already claimed this referral. Check your email to finish the process."
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

  // Validate tournament / Lootbox safety features
  const { safetyFeatures: lootboxSafety } = lootbox;
  const { safetyFeatures: tournamentSafety } = tournament;
  const isOwnerMadeReferral =
    referral.creatorId === tournament.creatorId ||
    referral.creatorId === lootbox.creatorID;
  if (
    // Only allow exclusive lootbox redemptions if the referral creator is tournament host or lootbox creator
    lootboxSafety?.isExclusiveLootbox &&
    (!isOwnerMadeReferral || referral.seedLootboxID !== lootbox.id)
  ) {
    throw new Error(
      "Sharing is disabled for this Lootbox. Please ask the event host for a different referral link."
    );
  }
  const isExcludedFromEventLimits =
    isLootboxClaimsExcludedFromEventLimits(lootbox);
  // get user tickets for this lootbox & tournamet
  const [userTournamentTicketCount, userLootboxTicketCount] = await Promise.all(
    [
      // Promoter lootboxes are excluded from event limits
      isExcludedFromEventLimits
        ? 0
        : getUserClaimCountForTournament(
            tournament.id,
            claimer.id as unknown as UserID
          ),
      getUserClaimCountForLootbox(lootbox.id, claimer.id as unknown as UserID),
    ]
  );

  const maxLootboxTicketsAllowed = lootboxSafety?.maxTicketsPerUser ?? 5;
  if (userLootboxTicketCount >= maxLootboxTicketsAllowed) {
    throw new Error(
      `You already have the maximum number of tickets for this Lootbox (${maxLootboxTicketsAllowed}).`
    );
  }
  const maxEventTicketsAllowed = tournamentSafety?.maxTicketsPerUser ?? 100;
  if (
    !isExcludedFromEventLimits &&
    userTournamentTicketCount >= maxEventTicketsAllowed
  ) {
    throw new Error(
      `You already have the maximum number of tickets for this Event (${maxEventTicketsAllowed}).`
    );
  }

  return {
    lootbox,
  };
};

interface StartClaimProcessPayload {
  referralSlug: ReferralSlug;
}

/** Starts claiming process - this does not do user caller checks because the endpoint is un authenticated */
export const startClaimProcess = async (
  payload: StartClaimProcessPayload
): Promise<Claim_Firestore> => {
  const referral = await getReferralBySlug(payload.referralSlug);

  if (!referral || !!referral.timestamps.deletedAt) {
    throw new Error("Referral not found");
  }

  const tournament = await getTournamentById(referral.tournamentId);

  if (!tournament || !!tournament.timestamps.deletedAt) {
    throw new Error("Tournament not found");
  }

  let claimType: ClaimType_Firestore.one_time | ClaimType_Firestore.referral;
  if (referral.type === ReferralType_Firestore.one_time) {
    claimType = ClaimType_Firestore.one_time;
  } else if (
    referral.type === ReferralType_Firestore.viral ||
    referral.type === ReferralType_Firestore.genesis
  ) {
    claimType = ClaimType_Firestore.referral;
  } else {
    throw new Error("Invalid referral type");
  }

  const claim = await createStartingClaim({
    claimType,
    referralCampaignName: referral.campaignName,
    referralId: referral.id as ReferralID,
    promoterId: referral.promoterId,
    tournamentId: referral.tournamentId as TournamentID,
    referrerId: referral.referrerId as unknown as UserIdpID,
    referralSlug: payload.referralSlug as ReferralSlug,
    tournamentName: tournament.title,
    referralType: referral.type || ReferralType.Viral, // default to viral
    originLootboxID: referral.seedLootboxID,
    isPostCosmic: true,
    privacyScope: tournament?.privacyScope
      ? convertClaimPrivacyScopeGQLToDB(tournament.privacyScope)
      : [],
  });

  return claim;
};
