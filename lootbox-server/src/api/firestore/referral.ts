import {
  Claim,
  PartyBasket,
  Referral,
  ClaimStatus,
  Tournament,
  ClaimType,
  PageInfo,
  ClaimEdge,
  ClaimPageInfo,
} from "../../graphql/generated/types";
import {
  ClaimID,
  LootboxID,
  PartyBasketID,
  ReferralID,
  ReferralSlug,
  TournamentID,
  UserID,
  UserIdpID,
} from "../../lib/types";
import { Collection } from "./collection.types";
import { db } from "../firebase";
import {
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { Address } from "@wormgraph/helpers";

export const getReferralBySlug = async (
  slug: ReferralSlug
): Promise<Referral | undefined> => {
  const collectionRef = db
    .collection(Collection.Referral)
    .where("slug", "==", slug)
    .limit(1) as Query<Referral>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return undefined;
  } else {
    return collectionSnapshot.docs[0].data();
  }
};

export const getReferralById = async (
  id: ReferralID
): Promise<Referral | undefined> => {
  const collectionRef = (await db
    .collection(Collection.Referral)
    .doc(id)
    .get()) as DocumentSnapshot<Referral>;

  if (collectionRef.exists) {
    return collectionRef.data();
  } else {
    return undefined;
  }
};

interface CreateReferralCall {
  slug: ReferralSlug;
  referrerId: UserIdpID;
  creatorId: UserIdpID;
  campaignName: string;
  tournamentId: TournamentID;
  seedPartyBasketId?: PartyBasketID;
}
export const createReferral = async (
  req: CreateReferralCall
): Promise<Referral> => {
  const ref = db.collection(Collection.Referral).doc();
  const newReferral: Referral = {
    id: ref.id,
    slug: req.slug,
    creatorId: req.creatorId,
    referrerId: req.referrerId,
    campaignName: req.campaignName,
    tournamentId: req.tournamentId,
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
    },
    nConversions: 0,
  };

  if (!!req.seedPartyBasketId) {
    newReferral.seedPartyBasketId = req.seedPartyBasketId;
  }

  await ref.set(newReferral);

  return newReferral;
};

interface CreateClaimCall {
  referralId: ReferralID;
  tournamentId: TournamentID;
  tournamentName: string;
  referrerId?: UserIdpID;
  referralCampaignName: string;
  referralSlug: ReferralSlug;
  chosenPartyBasketId?: PartyBasketID;
  originPartyBasketId?: PartyBasketID;
  rewardFromClaim?: ClaimID;
  status: ClaimStatus;
  type: ClaimType;
  chosenPartyBasketAddress?: Address;
  chosenPartyBasketName?: string;
  chosenPartyBasketNFTBountyValue?: string;
  lootboxName?: string;
  lootboxAddress?: string;
  isAlreadyCompleted?: boolean;
  claimerUserId?: UserID;
}
const _createClaim = async (req: CreateClaimCall): Promise<Claim> => {
  const ref = db
    .collection(Collection.Referral)
    .doc(req.referralId)
    .collection(Collection.Claim)
    .doc();

  const timestamp = Timestamp.now().toMillis();
  const newClaim: Claim = {
    id: ref.id,
    referralId: req.referralId,
    tournamentId: req.tournamentId,
    tournamentName: req.tournamentName,
    referralSlug: req.referralSlug,
    referralCampaignName: req.referralCampaignName,
    status: req.status,
    type: req.type,
    timestamps: {
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      completedAt: !!req.isAlreadyCompleted ? timestamp : null,
    },
  };

  if (!!req.claimerUserId) {
    newClaim.claimerUserId = req.claimerUserId;
  }

  if (!!req.lootboxAddress) {
    newClaim.lootboxAddress = req.lootboxAddress;
  }

  if (!!req.lootboxName) {
    newClaim.lootboxName = req.lootboxName;
  }

  if (!!req.referrerId) {
    newClaim.referrerId = req.referrerId;
  }

  if (!!req.chosenPartyBasketId) {
    newClaim.chosenPartyBasketId = req.chosenPartyBasketId;
  }

  if (!!req.chosenPartyBasketName) {
    newClaim.chosenPartyBasketName = req.chosenPartyBasketName;
  }

  if (!!req.chosenPartyBasketNFTBountyValue) {
    newClaim.chosenPartyBasketNFTBountyValue =
      req.chosenPartyBasketNFTBountyValue;
  }

  if (!!req.chosenPartyBasketId) {
    newClaim.chosenPartyBasketId = req.chosenPartyBasketId;
  }

  if (!!req.originPartyBasketId) {
    newClaim.originPartyBasketId = req.originPartyBasketId;
  }

  if (!!req.rewardFromClaim) {
    newClaim.rewardFromClaim = req.rewardFromClaim;
  }

  if (!!req.chosenPartyBasketAddress) {
    newClaim.chosenPartyBasketAddress = req.chosenPartyBasketAddress;
  }

  await ref.set(newClaim);

  return newClaim;
};

interface CreateCreateClaimReq {
  referralId: ReferralID;
  tournamentId: TournamentID;
  tournamentName: string;
  referralCampaignName: string;
  referrerId?: UserIdpID;
  referralSlug: ReferralSlug;
  originPartyBasketId?: PartyBasketID;
}
export const createStartingClaim = async (req: CreateCreateClaimReq) => {
  return await _createClaim({
    referralId: req.referralId,
    tournamentId: req.tournamentId,
    referrerId: req.referrerId,
    referralSlug: req.referralSlug,
    referralCampaignName: req.referralCampaignName,
    tournamentName: req.tournamentName,
    originPartyBasketId: req.originPartyBasketId,
    status: ClaimStatus.Pending,
    type: ClaimType.Referral,
    isAlreadyCompleted: false,
  });
};

interface CreateRewardClaimReq {
  referralId: ReferralID;
  claimerId: UserID;
  referralCampaignName: string;
  tournamentId: TournamentID;
  tournamentName: string;
  referralSlug: ReferralSlug;
  rewardFromClaim: ClaimID;
  chosenPartyBasketId: PartyBasketID;
  chosenPartyBasketAddress: Address;
  chosenPartyBasketName: string;
  chosenPartyBasketNFTBountyValue?: string;
  lootboxName: string;
  lootboxAddress: string;
}
export const createRewardClaim = async (req: CreateRewardClaimReq) => {
  return await _createClaim({
    referralCampaignName: req.referralCampaignName,
    referralId: req.referralId,
    tournamentId: req.tournamentId,
    referralSlug: req.referralSlug,
    rewardFromClaim: req.rewardFromClaim,
    tournamentName: req.tournamentName,
    chosenPartyBasketId: req.chosenPartyBasketId,
    chosenPartyBasketAddress: req.chosenPartyBasketAddress,
    chosenPartyBasketName: req.chosenPartyBasketName,
    chosenPartyBasketNFTBountyValue: req.chosenPartyBasketNFTBountyValue,
    lootboxName: req.lootboxName,
    lootboxAddress: req.lootboxAddress,
    status: ClaimStatus.Complete,
    type: ClaimType.Reward,
    isAlreadyCompleted: true,
    claimerUserId: req.claimerId,
  });
};

interface CompleteClaimReq {
  claimId: ClaimID;
  referralId: ReferralID;
  chosenPartyBasketId: PartyBasketID;
  claimerUserId: UserIdpID;
  chosenPartyBasketAddress: Address;
  chosenPartyBasketName: string;
  chosenPartyBasketNFTBountyValue?: string;
  lootboxAddress: Address;
  lootboxName: string;
}
export const completeClaim = async (req: CompleteClaimReq): Promise<Claim> => {
  const referralRef = db.collection(Collection.Referral).doc(req.referralId);
  const claimRef = referralRef
    .collection(Collection.Claim)
    .doc(req.claimId) as DocumentReference<Claim>;

  const updateClaimRequest: Partial<Claim> = {
    status: ClaimStatus.Complete,
    chosenPartyBasketId: req.chosenPartyBasketId,
    claimerUserId: req.claimerUserId,
    chosenPartyBasketAddress: req.chosenPartyBasketAddress,
    chosenPartyBasketName: req.chosenPartyBasketName,
    lootboxAddress: req.lootboxAddress,
    lootboxName: req.lootboxName,
  };

  if (req.chosenPartyBasketNFTBountyValue) {
    updateClaimRequest.chosenPartyBasketNFTBountyValue =
      req.chosenPartyBasketNFTBountyValue;
  }

  // This is to update nested object in non-destructive way
  const nowMillis = Timestamp.now().toMillis();
  updateClaimRequest["timestamps.updatedAt"] = nowMillis;
  updateClaimRequest["timestamps.completedAt"] = nowMillis;

  // This updates the claim & increments the parent referral's nConversion
  // Get a new write batch
  var batch = db.batch();

  // Update the population of 'SF'
  // var sfRef = db.collection("cities").doc("SF");
  batch.update(claimRef, updateClaimRequest);
  batch.update(referralRef, {
    nConversions: FieldValue.increment(1),
  });

  // Commit the batch
  await batch.commit();

  // await documentRef.update(updateRequest);

  const snapshot = await claimRef.get();

  const claim = snapshot.data();

  return claim as Claim;
};

export const getClaimById = async (
  claimId: ClaimID
): Promise<Claim | undefined> => {
  const collectionRef = db
    .collectionGroup(Collection.Claim)
    .where("id", "==", claimId)
    .limit(1) as Query<Claim>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return undefined;
  } else {
    return collectionSnapshot.docs[0].data();
  }
};

export const getCompletedUserReferralClaimsForTournament = async (
  userId: UserIdpID,
  tournamentId: TournamentID
): Promise<Claim[]> => {
  const collectionRef = db
    .collectionGroup(Collection.Claim)
    .where("tournamentId", "==", tournamentId)
    .where("claimerUserId", "==", userId)
    .where("type", "==", ClaimType.Referral)
    .where("status", "==", ClaimStatus.Complete) as Query<Claim>;

  const collectionSnapshot = await collectionRef.get();
  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => doc.data());
  }
};

/**
 * @deprecated use getCompletedUserClaimsForTournament
 */
export const getCompletedClaimsForUserReferral = async (
  userId: UserIdpID,
  referralId: ReferralID
): Promise<Claim[]> => {
  const collectionRef = db
    .collectionGroup(Collection.Claim)
    .where("referralId", "==", referralId)
    .where("status", "==", ClaimStatus.Complete)
    .where("claimerUserId", "==", userId) as Query<Claim>;

  const collectionSnapshot = await collectionRef.get();
  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => doc.data());
  }
};

export const getAllClaimsForReferral = async (
  referralId: ReferralID
): Promise<Claim[]> => {
  const collectionRef = db
    .collection(Collection.Referral)
    .doc(referralId)
    .collection(Collection.Claim)
    .orderBy("timestamps.createdAt", "desc") as Query<Claim>;

  const collectionSnapshot = await collectionRef.get();
  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => doc.data());
  }
};

export const paginateUserClaims = async (
  userId: UserIdpID,
  limit: number,
  cursor?: number | null // timestamps.createdAt
): Promise<{
  totalCount: number;
  edges: ClaimEdge[];
  pageInfo: ClaimPageInfo;
}> => {
  let claimQuery = db
    .collectionGroup(Collection.Claim)
    .where("claimerUserId", "==", userId)
    .orderBy("timestamps.createdAt", "desc") as Query<Claim>;

  if (cursor) {
    claimQuery = claimQuery.startAfter(Number(cursor));
  }

  claimQuery = claimQuery.limit(limit + 1);

  const claimsSnapshot = await claimQuery.get();

  if (claimsSnapshot.empty) {
    return {
      edges: [],
      totalCount: -1,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    };
  } else {
    const docs = claimsSnapshot.docs.slice(0, limit);
    return {
      edges: docs.map((doc) => {
        const data = doc.data();
        return {
          node: data,
          cursor: data.timestamps.createdAt,
        };
      }),
      totalCount: -1,
      pageInfo: {
        endCursor: docs[docs.length - 1].data().timestamps.createdAt,
        hasNextPage: claimsSnapshot.docs.length === limit + 1,
      },
    };
  }
};
