import {
  ClaimStatus,
  ClaimType,
  ClaimEdge,
  ClaimPageInfo,
  User,
  LootboxTournamentSnapshot,
  ClaimRedemptionStatus,
} from "../../graphql/generated/types";
import {
  ClaimID,
  LootboxID,
  ReferralID,
  ReferralSlug,
  TournamentID,
  UserID,
  UserIdpID,
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  ReferralType_Firestore,
  Referral_Firestore,
  Claim_Firestore,
  LootboxMintWhitelistID,
  AffiliateID,
  ClaimTimestamps_Firestore,
  OfferID,
  QuestionAnswerID,
  LootboxTournamentSnapshot_Firestore,
  LootboxTournamentStatus_Firestore,
  LootboxType,
  TournamentPrivacyScope,
  LootboxTimestamps,
} from "@wormgraph/helpers";
import { ClaimsCsvRow } from "../../lib/types";
import { db } from "../firebase";
import {
  CollectionGroup,
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { Address, Collection, Tournament_Firestore } from "@wormgraph/helpers";
import { manifest } from "../../manifest";
import { getUser } from "./user";
import { getUserWallets } from "./wallet";
import {
  convertClaimDBToGQL,
  convertClaimPrivacyScopeGQLToDB,
  convertClaimStatusDBToGQL,
  convertClaimTypeDBToGQL,
} from "../../lib/referral";
import { parseLootboxTournamentSnapshotDB } from "../../lib/tournament";
import { LootboxStatus } from "../../graphql/generated/types";

export const getReferralBySlug = async (
  slug: ReferralSlug
): Promise<Referral_Firestore | undefined> => {
  const collectionRef = db
    .collection(Collection.Referral)
    .where("slug", "==", slug)
    .limit(1) as Query<Referral_Firestore>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return undefined;
  } else {
    return collectionSnapshot.docs[0].data();
  }
};

export const getReferralById = async (
  id: ReferralID
): Promise<Referral_Firestore | undefined> => {
  const collectionRef = (await db
    .collection(Collection.Referral)
    .doc(id)
    .get()) as DocumentSnapshot<Referral_Firestore>;

  if (collectionRef.exists) {
    return collectionRef.data();
  } else {
    return undefined;
  }
};

interface CreateReferralCall {
  slug: ReferralSlug;
  referrerId: UserID;
  promoterId?: AffiliateID;
  creatorId: UserID;
  campaignName: string;
  tournamentId: TournamentID;
  type: ReferralType_Firestore;
  seedLootboxID?: LootboxID;
  isPostCosmic: boolean;
  inviteGraphic?: string;
}
export const createReferral = async (
  req: CreateReferralCall
): Promise<Referral_Firestore> => {
  const ref = db.collection(Collection.Referral).doc();
  const newReferral: Referral_Firestore = {
    id: ref.id as ReferralID,
    slug: req.slug,
    creatorId: req.creatorId,
    referrerId: req.referrerId,
    campaignName: req.campaignName,
    tournamentId: req.tournamentId,
    type: req.type,
    isPostCosmic: req.isPostCosmic,
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
    },
    nConversions: 0,
  };

  if (!!req.promoterId) {
    newReferral.promoterId = req.promoterId;
  }

  if (!!req.seedLootboxID) {
    newReferral.seedLootboxID = req.seedLootboxID;
  }

  if (!!req.inviteGraphic) {
    newReferral.inviteGraphic = req.inviteGraphic;
  }

  await ref.set(newReferral);

  return newReferral;
};

interface CreateClaimCall {
  referralId: ReferralID;
  tournamentId: TournamentID;
  tournamentName: string;
  referrerId: UserID | null;
  promoterId?: AffiliateID | null;
  referralCampaignName: string;
  referralSlug: ReferralSlug;
  rewardFromClaim?: ClaimID;
  status: ClaimStatus_Firestore;
  type: ClaimType_Firestore;
  completed?: boolean;
  claimerUserId?: UserID;
  rewardFromFriendReferred?: UserID;
  referralType: ReferralType_Firestore;

  originLootboxId?: LootboxID;
  lootboxID?: LootboxID;
  lootboxAddress?: Address;
  lootboxName?: string;
  lootboxNFTBountyValue?: string;

  isPostCosmic: boolean;

  privacyScope: TournamentPrivacyScope[];
}
export const _createClaim = async (
  req: CreateClaimCall
): Promise<Claim_Firestore> => {
  const ref = db
    .collection(Collection.Referral)
    .doc(req.referralId)
    .collection(Collection.Claim)
    .doc() as DocumentReference<Claim_Firestore>;

  const timestamp = Timestamp.now().toMillis();
  const newClaim: Claim_Firestore = {
    id: ref.id as ClaimID,
    referralId: req.referralId,
    referrerId: req.referrerId,
    tournamentId: req.tournamentId,
    tournamentName: req.tournamentName,
    referralSlug: req.referralSlug,
    referralCampaignName: req.referralCampaignName,
    status: req.status,
    type: req.type,
    referralType: req.referralType,
    whitelistId: null,
    whitelistedAddress: null,
    isPostCosmic: req.isPostCosmic,
    ticketID: null,
    ticketWeb3ID: null,
    privacyScope: req.privacyScope,
    exemptFromEventLimit: null,
    timestamps: {
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      completedAt: !!req.completed ? timestamp : null,
      whitelistedAt: null,
      mintedAt: null,
    },
  };

  if (!!req.claimerUserId) {
    newClaim.claimerUserId = req.claimerUserId;
  }

  if (!!req.promoterId) {
    newClaim.promoterId = req.promoterId;
  }

  if (!!req.lootboxName) {
    newClaim.lootboxName = req.lootboxName;
  }

  if (!!req.lootboxID) {
    newClaim.lootboxID = req.lootboxID;
  }

  if (!!req.lootboxNFTBountyValue) {
    newClaim.lootboxNFTBountyValue = req.lootboxNFTBountyValue;
  }

  if (!!req.originLootboxId) {
    newClaim.originLootboxId = req.originLootboxId;
  }

  if (!!req.lootboxAddress) {
    newClaim.lootboxAddress = req.lootboxAddress;
  }

  if (!!req.rewardFromClaim) {
    newClaim.rewardFromClaim = req.rewardFromClaim;
  }

  if (!!req.rewardFromFriendReferred) {
    newClaim.rewardFromFriendReferred = req.rewardFromFriendReferred;
  }

  await ref.set(newClaim);
  return newClaim;
};

interface CreateAirdropClaimCall extends CreateClaimCall {
  airdropMetadata: {
    lootboxID: LootboxID;
    lootboxAddress?: Address;
    offerID: OfferID;
    batchAlias: string;
    answers: QuestionAnswerID[];
  };
}
export const _createAirdropClaim = async (
  req: CreateAirdropClaimCall
): Promise<Claim_Firestore> => {
  const ref = db
    .collection(Collection.Referral)
    .doc(req.referralId)
    .collection(Collection.Claim)
    .doc() as DocumentReference<Claim_Firestore>;

  const timestamp = Timestamp.now().toMillis();
  const newClaim: Claim_Firestore = {
    id: ref.id as ClaimID,
    referralId: req.referralId,
    referrerId: req.referrerId,
    tournamentId: req.tournamentId,
    tournamentName: req.tournamentName,
    referralSlug: req.referralSlug,
    referralCampaignName: req.referralCampaignName,
    status: req.status,
    redemptionStatus: ClaimRedemptionStatus.Awaiting,
    type: req.type,
    referralType: req.referralType,
    whitelistId: null,
    whitelistedAddress: null,
    isPostCosmic: req.isPostCosmic,
    ticketID: null,
    ticketWeb3ID: null,
    claimerUserId: req.claimerUserId,
    privacyScope: req.privacyScope || {},
    exemptFromEventLimit: null,
    timestamps: {
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      completedAt: !!req.completed ? timestamp : null,
      whitelistedAt: null,
      mintedAt: null,
    },
    airdropMetadata: req.airdropMetadata,
  };

  if (!!req.promoterId) {
    newClaim.promoterId = req.promoterId;
  }

  if (!!req.lootboxName) {
    newClaim.lootboxName = req.lootboxName;
  }

  if (!!req.lootboxID) {
    newClaim.lootboxID = req.lootboxID;
  }

  if (!!req.lootboxNFTBountyValue) {
    newClaim.lootboxNFTBountyValue = req.lootboxNFTBountyValue;
  }

  if (!!req.originLootboxId) {
    newClaim.originLootboxId = req.originLootboxId;
  }

  if (!!req.lootboxAddress) {
    newClaim.lootboxAddress = req.lootboxAddress;
  }

  if (!!req.rewardFromClaim) {
    newClaim.rewardFromClaim = req.rewardFromClaim;
  }

  if (!!req.rewardFromFriendReferred) {
    newClaim.rewardFromFriendReferred = req.rewardFromFriendReferred;
  }

  await ref.set(newClaim);
  return newClaim;
};

interface CreateCreateClaimReq {
  referralId: ReferralID;
  tournamentId: TournamentID;
  tournamentName: string;
  referralCampaignName: string;
  referrerId: UserIdpID;
  promoterId?: AffiliateID;
  referralSlug: ReferralSlug;
  referralType: ReferralType_Firestore;
  claimType: ClaimType_Firestore;
  originLootboxID?: LootboxID;
  isPostCosmic: boolean;
  privacyScope: TournamentPrivacyScope[];
}
export const createStartingClaim = async (
  req: CreateCreateClaimReq
): Promise<Claim_Firestore> => {
  return await _createClaim({
    referralId: req.referralId,
    tournamentId: req.tournamentId,
    referrerId: req.referrerId as unknown as UserID,
    promoterId: req.promoterId,
    referralSlug: req.referralSlug,
    referralCampaignName: req.referralCampaignName,
    tournamentName: req.tournamentName,
    status: ClaimStatus_Firestore.pending,
    type: req.claimType,
    referralType: req.referralType,
    completed: false,
    originLootboxId: req.originLootboxID,
    isPostCosmic: req.isPostCosmic,
    privacyScope: req.privacyScope,
  });
};

interface CompleteClaimReq {
  claimId: ClaimID;
  referralId: ReferralID;
  claimerUserId: UserID;
  lootboxID: LootboxID;
  lootboxAddress: Address | null;
  lootboxName: string;
  lootboxNFTBountyValue?: string;
  lootboxMaxTickets?: number;
  isExemptFromEventLimit?: boolean;
}
export const completeClaim = async (
  req: CompleteClaimReq
): Promise<Claim_Firestore> => {
  const referralRef = db.collection(Collection.Referral).doc(req.referralId);
  const claimRef = referralRef
    .collection(Collection.Claim)
    .doc(req.claimId) as DocumentReference<Claim_Firestore>;

  const updateClaimRequest: Partial<Claim_Firestore> = {
    status: ClaimStatus_Firestore.complete,
    claimerUserId: req.claimerUserId,
    lootboxID: req.lootboxID,
    lootboxName: req.lootboxName,
    exemptFromEventLimit: req.isExemptFromEventLimit || false,
  };

  if (req.lootboxAddress) {
    updateClaimRequest.lootboxAddress = req.lootboxAddress;
  }

  if (req.lootboxNFTBountyValue) {
    updateClaimRequest.lootboxNFTBountyValue = req.lootboxNFTBountyValue;
  }

  if (req.lootboxMaxTickets) {
    updateClaimRequest.lootboxMaxTickets = req.lootboxMaxTickets;
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

  return claim as Claim_Firestore;
};

interface CompleteAnonClaimReq {
  claimId: ClaimID;
  referralId: ReferralID;
  claimerUserId: UserID;
  lootboxID: LootboxID;
  lootboxAddress: Address | null;
  lootboxName: string;
  lootboxNFTBountyValue?: string;
  lootboxMaxTickets?: number;
  isClaimExemptFromEventLimit?: boolean;
}
export const completeAnonClaim = async (
  req: CompleteAnonClaimReq
): Promise<Claim_Firestore> => {
  const referralRef = db.collection(Collection.Referral).doc(req.referralId);
  const claimRef = referralRef
    .collection(Collection.Claim)
    .doc(req.claimId) as DocumentReference<Claim_Firestore>;

  const updateClaimRequest: Partial<Claim_Firestore> = {
    status: ClaimStatus_Firestore.unverified,
    claimerUserId: req.claimerUserId,
    lootboxID: req.lootboxID,
    lootboxName: req.lootboxName,
    exemptFromEventLimit: req.isClaimExemptFromEventLimit || false,
  };

  if (req.lootboxAddress) {
    updateClaimRequest.lootboxAddress = req.lootboxAddress;
  }

  if (req.lootboxNFTBountyValue) {
    updateClaimRequest.lootboxNFTBountyValue = req.lootboxNFTBountyValue;
  }

  if (req.lootboxMaxTickets) {
    updateClaimRequest.lootboxMaxTickets = req.lootboxMaxTickets;
  }

  // This is to update nested object in non-destructive way
  const nowMillis = Timestamp.now().toMillis();
  updateClaimRequest["timestamps.updatedAt"] = nowMillis;
  // TODO: update this in the backend?
  // updateClaimRequest["timestamps.completedAt"] = nowMillis;

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

  return claim as Claim_Firestore;
};

export const getClaimById = async (
  claimId: ClaimID
): Promise<Claim_Firestore | undefined> => {
  const collectionRef = db
    .collectionGroup(Collection.Claim)
    .where("id", "==", claimId)
    .limit(1) as Query<Claim_Firestore>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return undefined;
  } else {
    return collectionSnapshot.docs[0].data();
  }
};

// Duplicated in firebase functions
export const getCompletedUserReferralClaimsForTournament = async (
  userId: UserIdpID,
  tournamentId: TournamentID,
  limit?: number
): Promise<Claim_Firestore[]> => {
  let collectionRef = db
    .collectionGroup(Collection.Claim)
    .where("tournamentId", "==", tournamentId)
    .where("claimerUserId", "==", userId)
    .where("type", "==", ClaimType.Referral)
    .where("status", "==", ClaimStatus.Complete)
    .where("exemptFromEventLimit", "==", false) as Query<Claim_Firestore>;

  if (limit !== undefined) {
    collectionRef = collectionRef.limit(limit);
  }

  const collectionSnapshot = await collectionRef.get();
  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => doc.data());
  }
};

// Duplicated in firebase functions
export const getCompletedClaimsForReferral = async (
  referralId: ReferralID,
  limit?: number
): Promise<Claim_Firestore[]> => {
  let collectionRef = db
    .collectionGroup(Collection.Claim)
    .where("referralId", "==", referralId)
    .where("status", "==", ClaimStatus.Complete) as Query<Claim_Firestore>;

  if (limit !== undefined) {
    collectionRef = collectionRef.limit(limit);
  }

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
): Promise<Claim_Firestore[]> => {
  const collectionRef = db
    .collectionGroup(Collection.Claim)
    .where("referralId", "==", referralId)
    .where("status", "==", ClaimStatus.Complete)
    .where("claimerUserId", "==", userId) as Query<Claim_Firestore>;

  const collectionSnapshot = await collectionRef.get();
  if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => doc.data());
  }
};

export const getAllClaimsForReferral = async (
  referralId: ReferralID
): Promise<Claim_Firestore[]> => {
  const collectionRef = db
    .collection(Collection.Referral)
    .doc(referralId)
    .collection(Collection.Claim)
    .orderBy("timestamps.createdAt", "desc") as Query<Claim_Firestore>;

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
    .orderBy("timestamps.createdAt", "desc") as Query<Claim_Firestore>;

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
          node: convertClaimDBToGQL(data),
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

export const getAllClaimsForTournament = async (
  tournamentId: TournamentID
): Promise<Claim_Firestore[]> => {
  let claimQuery = db
    .collectionGroup(Collection.Claim)
    .where("tournamentId", "==", tournamentId)
    .orderBy("timestamps.createdAt", "desc") as Query<Claim_Firestore>;

  const claimsSnapshot = await claimQuery.get();

  if (claimsSnapshot.empty) {
    return [];
  } else {
    return claimsSnapshot.docs.map((doc) => doc.data());
  }
};

export const getAllClaimsForLootbox = async (
  lootboxID: LootboxID
): Promise<Claim_Firestore[]> => {
  let claimQuery = db
    .collectionGroup(Collection.Claim)
    .where("lootboxID", "==", lootboxID) as Query<Claim_Firestore>;

  const claimsSnapshot = await claimQuery.get();

  if (claimsSnapshot.empty) {
    return [];
  } else {
    return claimsSnapshot.docs.map((doc) => doc.data());
  }
};

export const getClaimsCsvData = async (
  tournamentId: TournamentID
): Promise<ClaimsCsvRow[]> => {
  const claimerUserMapping: Record<UserID, User> = {};
  const referrerUserMapping: Record<UserID, User> = {};

  const allClaims = await getAllClaimsForTournament(tournamentId);

  const result: ClaimsCsvRow[] = [];
  for (const claim of allClaims) {
    let claimer: User | undefined = undefined;
    let referrer: User | undefined = undefined;

    if (claim.claimerUserId) {
      if (!claimerUserMapping[claim.claimerUserId]) {
        claimer = await getUser(claim.claimerUserId);
        if (claimer) {
          claimer.wallets = await getUserWallets(claimer.id as UserID);
          claimerUserMapping[claim.claimerUserId] = claimer;
        }
      } else {
        claimer = claimerUserMapping[claim.claimerUserId];
      }
    }

    if (claim.referrerId) {
      if (!referrerUserMapping[claim.referrerId]) {
        referrer = await getUser(claim.referrerId);
        if (referrer) {
          referrer.wallets = await getUserWallets(referrer.id as UserID);
          referrerUserMapping[claim.referrerId] = referrer;
        }
      } else {
        referrer = referrerUserMapping[claim.referrerId];
      }
    }

    result.push(convertClaimToCsvRow(claim, claimer, referrer));
  }

  return result;
};

const convertClaimToCsvRow = (
  claim: Claim_Firestore,
  claimer?: User,
  referrer?: User
): ClaimsCsvRow => {
  return {
    tournamentId: claim.tournamentId,
    tournamentName: claim.tournamentName || "",
    referralType: claim.referralType || "",
    referralId: claim.referralId,
    referralCampaignName: claim.referralCampaignName || "",
    referralSlug: claim.referralSlug || "",
    referralLink: `${manifest.microfrontends.webflow.referral}/r?r=${claim.referralSlug}`,
    claimId: claim.id,
    claimStatus: convertClaimStatusDBToGQL(claim.status),
    claimType: convertClaimTypeDBToGQL(claim.type),
    rewardFromClaim: claim.rewardFromClaim || "",
    rewardFromFriendReferred: claim.rewardFromFriendReferred || "",
    claimerId: claimer?.id || "",
    claimerUsername: claimer?.username || "",
    claimerSocial_Facebook: claimer?.socials?.facebook || "",
    claimerSocial_Twitter: claimer?.socials?.twitter || "",
    claimerSocial_Instagram: claimer?.socials?.instagram || "",
    claimerSocial_TikTok: claimer?.socials?.tiktok || "",
    claimerSocial_Discord: claimer?.socials?.discord || "",
    claimerSocial_Snapchat: claimer?.socials?.snapchat || "",
    claimerSocial_Twitch: claimer?.socials?.twitch || "",
    claimerSocial_Web: claimer?.socials?.web || "",
    claimerProfileLink: claim.claimerUserId
      ? `${manifest.microfrontends.webflow.publicProfile}?uid=${claim.claimerUserId}`
      : "",
    referrerId: referrer?.id || "",
    referrerUsername: referrer?.username || "",
    referrerSocial_Facebook: referrer?.socials?.facebook || "",
    referrerSocial_Twitter: referrer?.socials?.twitter || "",
    referrerSocial_Instagram: referrer?.socials?.instagram || "",
    referrerSocial_TikTok: referrer?.socials?.tiktok || "",
    referrerSocial_Discord: referrer?.socials?.discord || "",
    referrerSocial_Snapchat: referrer?.socials?.snapchat || "",
    referrerSocial_Twitch: referrer?.socials?.twitch || "",
    referrerSocial_Web: referrer?.socials?.web || "",
    referrerProfileLink: claim.referrerId
      ? `${manifest.microfrontends.webflow.publicProfile}?uid=${claim.referrerId}`
      : "",
    lootboxAddress: claim.lootboxAddress || "",
    lootboxName: claim.lootboxName || "",
    lootboxLink: claim.lootboxAddress
      ? `${manifest.microfrontends.webflow.cosmicLootboxPage}?lid=${claim.lootboxID}`
      : "",
    claimCreatedAt: claim.timestamps.createdAt,
    claimUpdatedAt: claim.timestamps.updatedAt,

    claimerAddress_0: claimer?.wallets
      ? claimer?.wallets[0]?.address || ""
      : "",
    claimerAddress_1: claimer?.wallets
      ? claimer?.wallets[1]?.address || ""
      : "",
    claimerAddress_2: claimer?.wallets
      ? claimer?.wallets[2]?.address || ""
      : "",
    claimerAddress_3: claimer?.wallets
      ? claimer?.wallets[3]?.address || ""
      : "",
    claimerAddress_4: claimer?.wallets
      ? claimer?.wallets[4]?.address || ""
      : "",
    claimerAddress_5: claimer?.wallets
      ? claimer?.wallets[5]?.address || ""
      : "",
    claimerAddress_6: claimer?.wallets
      ? claimer?.wallets[6]?.address || ""
      : "",
    claimerAddress_7: claimer?.wallets
      ? claimer?.wallets[7]?.address || ""
      : "",
    claimerAddress_8: claimer?.wallets
      ? claimer?.wallets[8]?.address || ""
      : "",
    claimerAddress_9: claimer?.wallets
      ? claimer?.wallets[9]?.address || ""
      : "",
    claimerAddress_10: claimer?.wallets
      ? claimer?.wallets[10]?.address || ""
      : "",

    referrerAddress_0: referrer?.wallets
      ? referrer?.wallets[0]?.address || ""
      : "",
    referrerAddress_1: referrer?.wallets
      ? referrer?.wallets[1]?.address || ""
      : "",
    referrerAddress_2: referrer?.wallets
      ? referrer?.wallets[2]?.address || ""
      : "",
    referrerAddress_3: referrer?.wallets
      ? referrer?.wallets[3]?.address || ""
      : "",
    referrerAddress_4: referrer?.wallets
      ? referrer?.wallets[4]?.address || ""
      : "",
    referrerAddress_5: referrer?.wallets
      ? referrer?.wallets[5]?.address || ""
      : "",
    referrerAddress_6: referrer?.wallets
      ? referrer?.wallets[6]?.address || ""
      : "",
    referrerAddress_7: referrer?.wallets
      ? referrer?.wallets[7]?.address || ""
      : "",
    referrerAddress_8: referrer?.wallets
      ? referrer?.wallets[8]?.address || ""
      : "",
    referrerAddress_9: referrer?.wallets
      ? referrer?.wallets[9]?.address || ""
      : "",
    referrerAddress_10: referrer?.wallets
      ? referrer?.wallets[10]?.address || ""
      : "",
  };
};

const buildBaseLootboxUserClaimQuery = (
  lootboxID: LootboxID,
  userID: UserID
) => {
  const claimerUserIDField: keyof Claim_Firestore = "claimerUserId";
  const statusField: keyof Claim_Firestore = "status";
  const lootboxIDField: keyof Claim_Firestore = "lootboxID";
  const timestampsField: keyof Claim_Firestore = "timestamps";
  const createdAtField: keyof LootboxTimestamps = "createdAt";
  return db
    .collectionGroup(Collection.Claim)
    .where(statusField, "==", ClaimStatus_Firestore.complete)
    .where(claimerUserIDField, "==", userID)
    .where(lootboxIDField, "==", lootboxID)
    .orderBy(
      `${timestampsField}.${createdAtField}`,
      "desc"
    ) as Query<Claim_Firestore>;
};

export const getUserClaimCountForLootbox = async (
  lootboxID: LootboxID,
  userID: UserID
): Promise<number> => {
  const snapshot = buildBaseLootboxUserClaimQuery(lootboxID, userID);
  const res = await snapshot.get();
  return res.size;
};

export const paginateLootboxUserClaims = async (
  lootboxID: LootboxID,
  userID: UserID,
  limit: number,
  cursor?: {
    endBefore?: number | null; // timestamps.createdAt
    startAfter?: number | null; // timestamps.createdAt
  }
): Promise<{
  totalCount: null;
  edges: ClaimEdge[];
  pageInfo: ClaimPageInfo;
}> => {
  let lootboxClaimQuery = buildBaseLootboxUserClaimQuery(lootboxID, userID);

  if (cursor?.startAfter) {
    // Going forward 1 page
    lootboxClaimQuery = lootboxClaimQuery
      .startAfter(Number(cursor.startAfter))
      .limit(limit);
  } else if (cursor?.endBefore) {
    // Going back 1 page
    lootboxClaimQuery = lootboxClaimQuery
      .endBefore(Number(cursor.endBefore))
      .limitToLast(limit);
  }
  const claimsSnapshot = await lootboxClaimQuery.get();

  const edges: ClaimEdge[] = [];
  for (const claimEdge of claimsSnapshot.docs) {
    const data = claimEdge.data();
    if (data) {
      edges.push({
        cursor: data.timestamps.createdAt,
        node: convertClaimDBToGQL(data),
      });
    }
  }
  const pageInfo: ClaimPageInfo = {
    hasNextPage: true,
    endCursor: edges[edges.length - 1]?.cursor || null,
  };

  return {
    totalCount: null,
    edges,
    pageInfo,
  };
};

export const getUnverifiedClaimsForUser = async (
  claimerUserID: UserID
): Promise<Claim_Firestore[]> => {
  const claimStatusField: keyof Claim_Firestore = "status";
  const claimerIDField: keyof Claim_Firestore = "claimerUserId";

  const collectionGroupRef = db
    .collectionGroup(Collection.Claim)
    .where(claimerIDField, "==", claimerUserID)
    // .where(lootboxIDField, "==", lootboxID)
    .where(
      claimStatusField,
      "==",
      ClaimStatus_Firestore.unverified
    ) as CollectionGroup<Claim_Firestore>;

  const snapshot = await collectionGroupRef.get();

  if (!snapshot || snapshot.empty) {
    return [];
  } else {
    return snapshot.docs.map((doc) => doc.data());
  }
};

export const updateClaimRedemptionStatus = async (
  claimID: ClaimID,
  status: ClaimRedemptionStatus,
  userIdpID: UserIdpID
) => {
  const claimsRef = db
    .collectionGroup(Collection.Claim)
    .where("id", "==", claimID) as Query<Claim_Firestore>;

  const claimsCollectionItems = await claimsRef.get();

  if (claimsCollectionItems.empty) {
    if (claimID === "no-claim-id") {
      throw Error(`You do not have a Claim. Did you verify your account yet?`);
    }
    throw Error(`This claim ${claimID} has no matching database entries`);
  }
  const claim = claimsCollectionItems.docs.map((doc) => doc.data())[0];
  if (!claim) {
    throw Error(`This claim ${claimID} does not exist`);
  }
  if (!claim.referralId) {
    throw Error(`This claim ${claimID} does not have a referralId`);
  }

  // check if user is allowed to run this operation
  const userMatchesIdpID =
    claim.claimerUserId &&
    claim.claimerUserId === (userIdpID as unknown as UserID);
  if (!userMatchesIdpID) {
    throw Error(
      `Unauthorized. User do not have permissions to modify this claim`
    );
  }
  // update the claim
  const claimRef = db
    .collection(Collection.Referral)
    .doc(claim.referralId)
    .collection(Collection.Claim)
    .doc(claim.id) as DocumentReference<Claim_Firestore>;

  if (checkIfClaimRedemptionStatusIsSenior(status, claim.redemptionStatus)) {
    const updatePayload: Partial<Claim_Firestore> = {};
    updatePayload.redemptionStatus = status;
    // until done
    await claimRef.update(updatePayload);
  }
  return claim.id;
};

/** @deprecated - use the lootbox snapshot resolver on the tournament */
export const getLootboxOptionsForTournament = async (
  tournamentID: TournamentID
) => {
  const impressionPriorityFieldName: keyof LootboxTournamentSnapshot_Firestore =
    "impressionPriority";
  const statusFieldName: keyof LootboxTournamentSnapshot_Firestore = "status";

  let query: Query<LootboxTournamentSnapshot_Firestore> = db
    .collection(Collection.Tournament)
    .doc(tournamentID)
    .collection(Collection.LootboxTournamentSnapshot)
    .where(statusFieldName, "==", LootboxTournamentStatus_Firestore.active)
    .orderBy(impressionPriorityFieldName, "desc")
    .orderBy(
      "timestamps.createdAt",
      "desc"
    ) as Query<LootboxTournamentSnapshot_Firestore>;

  // query for tournament
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID) as DocumentReference<Tournament_Firestore>;

  const [collectionSnapshot, tournamentSnapshot] = await Promise.all([
    query.get(),
    tournamentRef.get(),
  ]);

  if (!tournamentSnapshot.exists) {
    throw Error(`Tournament ${tournamentID} does not exist`);
  }
  const tournament = tournamentSnapshot.data();

  if (collectionSnapshot.empty) {
    return {
      termsOfService: tournament?.privacyScope || [],
      lootboxOptions: [] as LootboxTournamentSnapshot[],
    };
  } else {
    const lootboxOptions = collectionSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return parseLootboxTournamentSnapshotDB(data);
      })
      .filter((d) => {
        return (
          d.status === LootboxTournamentStatus_Firestore.active &&
          d.type !== LootboxType.Airdrop
        );
      }) as unknown[] as LootboxTournamentSnapshot[];
    return {
      termsOfService: tournament?.privacyScope || [],
      lootboxOptions,
    };
  }
};

export const checkIfClaimRedemptionStatusIsSenior = (
  newStatus: ClaimRedemptionStatus,
  currentStatus?: ClaimRedemptionStatus
) => {
  const ranking = {
    None: 0,
    [ClaimRedemptionStatus.Awaiting]: 1,
    [ClaimRedemptionStatus.Started]: 2,
    [ClaimRedemptionStatus.InProgress]: 3,
    [ClaimRedemptionStatus.Answered]: 4,
    [ClaimRedemptionStatus.Rewarded]: 5,
    [ClaimRedemptionStatus.Revoked]: 6,
  };
  if (ranking[newStatus] > ranking[currentStatus || "None"]) {
    return true;
  }
};

export const getUserClaimCountForTournament = async (
  tournamentID: TournamentID,
  userID: UserID
): Promise<number> => {
  const claimerUserIDField: keyof Claim_Firestore = "claimerUserId";
  const statusField: keyof Claim_Firestore = "status";
  const tournamentIDField: keyof Claim_Firestore = "tournamentId";
  const exemptFromEventLimitField: keyof Claim_Firestore =
    "exemptFromEventLimit";
  const query = await db
    .collectionGroup(Collection.Claim)
    .where(tournamentIDField, "==", tournamentID)
    .where(claimerUserIDField, "==", userID)
    .where(statusField, "==", ClaimStatus_Firestore.complete)
    .where(exemptFromEventLimitField, "==", false)
    .get();

  return query.docs.length;
};
