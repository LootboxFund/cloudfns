import {
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  Claim_Firestore,
  ReferralType_Firestore,
  Referral_Firestore,
} from "@wormgraph/helpers";
import { getPartyBasketById } from "../api/firestore";
import {
  Claim,
  ClaimStatus,
  ClaimType,
  Referral,
  ReferralType,
} from "../graphql/generated/types";

export const convertReferralTypeDBToGQL = (
  type: ReferralType_Firestore
): ReferralType => {
  switch (type) {
    case ReferralType_Firestore.one_time:
      return ReferralType.OneTime;
    case ReferralType_Firestore.viral:
      return ReferralType.Viral;
    case ReferralType_Firestore.genesis:
    default:
      return ReferralType.Genesis;
  }
};

export const convertReferralTypeGQLToDB = (
  type: ReferralType
): ReferralType_Firestore => {
  switch (type) {
    case ReferralType.OneTime:
      return ReferralType_Firestore.one_time;
    case ReferralType.Viral:
      return ReferralType_Firestore.viral;
    case ReferralType.Genesis:
    default:
      return ReferralType_Firestore.genesis;
  }
};

export const convertReferralDBToGQL = (
  referral: Referral_Firestore
): Referral => {
  return {
    id: referral.id,
    referrerId: referral.referrerId,
    creatorId: referral.creatorId,
    promoterId: referral.promoterId,
    slug: referral.slug,
    tournamentId: referral.tournamentId,
    campaignName: referral.campaignName,
    nConversions: referral.nConversions,
    isPostCosmic: !!referral.isPostCosmic,
    timestamps: {
      createdAt: referral.timestamps.createdAt,
      updatedAt: referral.timestamps.updatedAt,
      deletedAt: referral.timestamps.deletedAt,
    },
    type: convertReferralTypeDBToGQL(referral.type),
    seedLootboxID: referral.seedLootboxID,
  };
};

export const convertClaimStatusDBToGQL = (
  status: ClaimStatus_Firestore
): ClaimStatus => {
  switch (status) {
    case ClaimStatus_Firestore.pending:
      return ClaimStatus.Pending;
    case ClaimStatus_Firestore.pending_verification:
      return ClaimStatus.PendingVerification;
    case ClaimStatus_Firestore.expired:
      return ClaimStatus.Expired;
    case ClaimStatus_Firestore.complete:
      return ClaimStatus.Complete;
    default:
      throw new Error(`Unknown claim status: ${status}`);
  }
};

export const convertClaimTypeDBToGQL = (
  type: ClaimType_Firestore
): ClaimType => {
  switch (type) {
    case ClaimType_Firestore.one_time:
      return ClaimType.OneTime;
    case ClaimType_Firestore.referral:
      return ClaimType.Referral;
    case ClaimType_Firestore.reward:
      return ClaimType.Reward;
    default:
      throw new Error(`Unknown claim type: ${type}`);
  }
};

export const convertClaimDBToGQL = (claim: Claim_Firestore): Claim => {
  return {
    id: claim.id,
    referrerId: claim.referrerId,
    referralCampaignName: claim.referralCampaignName,
    referralId: claim.referralId,
    referralSlug: claim.referralSlug,
    referralType: convertReferralTypeDBToGQL(claim.referralType),
    tournamentId: claim.tournamentId,
    tournamentName: claim.tournamentName,
    whitelistId: claim.whitelistId,
    originLootboxId: claim.originLootboxId,
    lootboxID: claim.lootboxID,
    lootboxAddress: claim.lootboxAddress,
    isPostCosmic: !!claim.isPostCosmic,
    lootboxName: claim.lootboxName,
    lootboxNFTBountyValue: claim.lootboxNFTBountyValue,
    lootboxMaxTickets: claim.lootboxMaxTickets,
    rewardFromClaim: claim.rewardFromClaim,
    rewardFromFriendReferred: claim.rewardFromFriendReferred,
    claimerUserId: claim.claimerUserId,
    status: convertClaimStatusDBToGQL(claim.status),
    type: convertClaimTypeDBToGQL(claim.type),
    timestamps: {
      createdAt: claim.timestamps.createdAt,
      completedAt: claim.timestamps.completedAt,
      updatedAt: claim.timestamps.updatedAt,
      deletedAt: claim.timestamps.deletedAt,
    },

    /** @deprecated */
    originPartyBasketId: claim.originPartyBasketId,
    /** @deprecated */
    chosenPartyBasketId: claim.chosenPartyBasketId,
    /** @deprecated */
    chosenPartyBasketAddress: claim.chosenPartyBasketAddress,
    /** @deprecated */
    chosenPartyBasketName: claim.chosenPartyBasketName,
    /** @deprecated */
    chosenPartyBasketNFTBountyValue: claim.chosenPartyBasketNFTBountyValue,
  };
};
