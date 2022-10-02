import {
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  Claim_Firestore,
  ReferralType_Firestore,
  Referral_Firestore,
} from "../api/firestore/referral.types";
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
    case ReferralType_Firestore.genesis:
      return ReferralType.Genesis;
    case ReferralType_Firestore.one_time:
      return ReferralType.OneTime;
    case ReferralType_Firestore.viral:
      return ReferralType.Viral;
    default:
      throw new Error(`Unknown referral type: ${type}`);
  }
};

export const convertReferralTypeGQLToDB = (
  type: ReferralType
): ReferralType_Firestore => {
  switch (type) {
    case ReferralType.Genesis:
      return ReferralType_Firestore.genesis;
    case ReferralType.OneTime:
      return ReferralType_Firestore.one_time;
    case ReferralType.Viral:
      return ReferralType_Firestore.viral;
    default:
      throw new Error(`Unknown referral type: ${type}`);
  }
};

export const convertReferralDBToGQL = (
  referral: Referral_Firestore
): Referral => {
  return {
    id: referral.id,
    referrerId: referral.referrerId,
    creatorId: referral.creatorId,
    slug: referral.slug,
    tournamentId: referral.tournamentId,
    campaignName: referral.campaignName,
    nConversions: referral.nConversions,
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
    case ClaimStatus_Firestore.verification_sent:
      return ClaimStatus.VerificationSent;
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
    referralId: claim.referralId,
    tournamentId: claim.tournamentId,
    status: convertClaimStatusDBToGQL(claim.status),
    type: convertClaimTypeDBToGQL(claim.type),
    referralSlug: claim.referralSlug,
    timestamps: {
      createdAt: claim.timestamps.createdAt,
      completedAt: claim.timestamps.completedAt,
      updatedAt: claim.timestamps.updatedAt,
      deletedAt: claim.timestamps.deletedAt,
    },
  };
};
