import { Referral, Tournament } from "../../graphql/generated/types";
import {
  PartyBasketID,
  ReferralSlug,
  TournamentID,
  UserID,
  UserIdpID,
} from "../../lib/types";
import { Collection } from "./collection.types";
import { db } from "../firebase";
import { Query, Timestamp } from "firebase-admin/firestore";
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
    metadata: {
      tournamentId: req.tournamentId,
      ...(req.seedPartyBasketId && {
        seedPartyBasketId: req.seedPartyBasketId,
      }),
    },
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
    },
    nConversions: 0,
  } as Referral;

  await ref.set(newReferral);

  return newReferral;
};
