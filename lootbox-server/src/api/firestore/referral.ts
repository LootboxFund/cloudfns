import {
  ClaimStatus,
  ClaimType,
  ClaimEdge,
  ClaimPageInfo,
  User,
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
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  ReferralType_Firestore,
  Referral_Firestore,
  Claim_Firestore,
  LootboxMintWhitelistID,
  AffiliateID,
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
import { Address, Collection, WhitelistSignatureID } from "@wormgraph/helpers";
import { manifest } from "../../manifest";
import { getUser } from "./user";
import { getUserWallets } from "./wallet";
import {
  convertClaimDBToGQL,
  convertClaimStatusDBToGQL,
  convertClaimTypeDBToGQL,
} from "../../lib/referral";

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
  /** @deprecated */
  seedPartyBasketId?: PartyBasketID;
  isPostCosmic: boolean;
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

  if (!!req.seedPartyBasketId) {
    newReferral.seedPartyBasketId = req.seedPartyBasketId;
  }

  console.log(`

  Creating newReferral: 
  
  `);
  console.log(newReferral);

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

  /** @deprecated use lootbox */
  originPartyBasketId?: PartyBasketID;
  /** @deprecated use lootbox */
  chosenPartyBasketId?: PartyBasketID;
  /** @deprecated use lootbox */
  chosenPartyBasketAddress?: Address;
  /** @deprecated use lootbox */
  chosenPartyBasketName?: string;
  /** @deprecated use lootbox */
  chosenPartyBasketNFTBountyValue?: string;
}
const _createClaim = async (req: CreateClaimCall): Promise<Claim_Firestore> => {
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
    isPostCosmic: req.isPostCosmic,
    timestamps: {
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      completedAt: !!req.completed ? timestamp : null,
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
  /** @deprecated */
  originPartyBasketId?: PartyBasketID;
  isPostCosmic: boolean;
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
    originPartyBasketId: req.originPartyBasketId,
    isPostCosmic: req.isPostCosmic,
  });
};

interface CreateRewardClaimReq {
  referralId: ReferralID;
  claimerId: UserID;
  promoterId?: AffiliateID;
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
  lootboxAddress: Address;
  rewardFromFriendReferred: UserID;
  isPostCosmic: boolean;
}
/** @deprecated duplicated in @cloudfns/firebase/functions */
export const createRewardClaim = async (
  req: CreateRewardClaimReq
): Promise<Claim_Firestore> => {
  return await _createClaim({
    referralCampaignName: req.referralCampaignName,
    referralId: req.referralId,
    promoterId: req.promoterId,
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
    status: ClaimStatus_Firestore.complete,
    type: ClaimType_Firestore.reward,
    claimerUserId: req.claimerId,
    rewardFromFriendReferred: req.rewardFromFriendReferred,
    referralType: ReferralType_Firestore.viral,
    referrerId: null,
    completed: true,
    isPostCosmic: req.isPostCosmic,
  });
};

interface CompleteClaimReq {
  claimId: ClaimID;
  referralId: ReferralID;
  claimerUserId: UserID;
  lootboxID: LootboxID;
  lootboxAddress: Address;
  lootboxName: string;
  lootboxNFTBountyValue?: string;
  lootboxMaxTickets?: number;
  /** @deprecated */
  chosenPartyBasketId?: PartyBasketID;
  /** @deprecated */
  chosenPartyBasketAddress?: Address;
  /** @deprecated */
  chosenPartyBasketName?: string;
  /** @deprecated */
  chosenPartyBasketNFTBountyValue?: string;
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
    lootboxAddress: req.lootboxAddress,
    lootboxName: req.lootboxName,
  };

  if (req.lootboxNFTBountyValue) {
    updateClaimRequest.lootboxNFTBountyValue = req.lootboxNFTBountyValue;
  }

  if (req.lootboxMaxTickets) {
    updateClaimRequest.lootboxMaxTickets = req.lootboxMaxTickets;
  }

  if (req.chosenPartyBasketId) {
    updateClaimRequest.chosenPartyBasketId = req.chosenPartyBasketId;
  }

  if (req.chosenPartyBasketNFTBountyValue) {
    updateClaimRequest.chosenPartyBasketNFTBountyValue =
      req.chosenPartyBasketNFTBountyValue;
  }

  if (req.chosenPartyBasketAddress) {
    updateClaimRequest.chosenPartyBasketAddress = req.chosenPartyBasketAddress;
  }
  if (req.chosenPartyBasketName) {
    updateClaimRequest.chosenPartyBasketName = req.chosenPartyBasketName;
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
      ? `${manifest.microfrontends.webflow.lootboxUrl}?lootbox=${claim.lootboxAddress}`
      : "",
    originPartyBasketId: claim.originPartyBasketId || "",
    partyBasketNFTBountyValue: claim.chosenPartyBasketNFTBountyValue || "",
    partyBasketAddress: claim.chosenPartyBasketAddress || "",
    partyBasketId: claim.chosenPartyBasketId || "",
    partyBasketName: claim.chosenPartyBasketName || "",
    partyBasketManageLink: claim.chosenPartyBasketAddress
      ? `${manifest.microfrontends.webflow.basketManagePage}?basket=${claim.chosenPartyBasketAddress}`
      : "",
    partyBasketRedeemLink: claim.chosenPartyBasketAddress
      ? `${manifest.microfrontends.webflow.basketRedeemPage}?basket=${claim.chosenPartyBasketAddress}`
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

/** @deprecated - uses deprecated party basket */
export const getUnassignedClaims = async (
  partyBasketId: PartyBasketID
): Promise<Claim_Firestore[]> => {
  const collectionGroupRef = db
    .collectionGroup(Collection.Claim)
    .where("chosenPartyBasketId", "==", partyBasketId)
    .where("status", "==", ClaimStatus.Complete)
    .where("whitelistId", "==", null) as CollectionGroup<Claim_Firestore>;

  const snapshot = await collectionGroupRef.get();

  if (!snapshot || snapshot.empty) {
    return [];
  } else {
    return snapshot.docs.map((doc) => doc.data());
  }
};

/** @deprecated - this is duped in functions */
export const attachWhitelistIdToClaim = async (
  referralId: ReferralID,
  claimId: ClaimID,
  whitelistId: LootboxMintWhitelistID
) => {
  const ref = db
    .collection(Collection.Referral)
    .doc(referralId)
    .collection(Collection.Claim)
    .doc(claimId);

  const updateRequest: Partial<Claim_Firestore> = {
    whitelistId: whitelistId,
    // @ts-ignore
    "timestamps.updatedAt": Timestamp.now().toMillis(),
  };

  await ref.update(updateRequest);
};
