import {
  Claim,
  PartyBasket,
  Referral,
  ClaimStatus,
  Tournament,
  ClaimType,
} from "../../graphql/generated/types";
import {
  ClaimID,
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
  referrerId?: UserIdpID;
  referralSlug: ReferralSlug;
  chosenPartyBasketId?: PartyBasketID;
  rewardFromClaim?: ClaimID;
  status: ClaimStatus;
  type: ClaimType;
}
const _createClaim = async (req: CreateClaimCall): Promise<Claim> => {
  const ref = db
    .collection(Collection.Referral)
    .doc(req.referralId)
    .collection(Collection.Claim)
    .doc();
  const newClaim: Claim = {
    id: ref.id,
    referralId: req.referralId,
    tournamentId: req.tournamentId,
    referralSlug: req.referralSlug,
    status: req.status,
    type: req.type,
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
    },
  };

  if (!!req.referrerId) {
    newClaim.referrerId = req.referrerId;
  }

  if (!!req.chosenPartyBasketId) {
    newClaim.chosenPartyBasketId = req.chosenPartyBasketId;
  }

  if (!!req.rewardFromClaim) {
    newClaim.rewardFromClaim = req.rewardFromClaim;
  }

  await ref.set(newClaim);

  return newClaim;
};

interface CreateStartClaimReq {
  referralId: ReferralID;
  tournamentId: TournamentID;
  referrerId?: UserIdpID;
  referralSlug: ReferralSlug;
}
export const createStartingClaim = async (req: CreateStartClaimReq) => {
  return await _createClaim({
    ...req,
    status: ClaimStatus.Pending,
    type: ClaimType.Referral,
  });
};

interface CompleteClaimReq {
  claimId: ClaimID;
  referralId: ReferralID;
  chosenPartyBasketId: PartyBasketID;
  claimerUserId: UserIdpID;
  isNewUser: boolean;
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
    claimerIsNewUeser: req.isNewUser,
  };

  // This is to update nested object in non-destructive way
  updateClaimRequest["timestamps.updatedAt"] = Timestamp.now().toMillis();

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
