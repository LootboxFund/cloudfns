import { AffiliateID, OfferID, OfferStatus, UserID } from "@wormgraph/helpers";
import { DocumentReference } from "firebase-admin/firestore";
import {
  User,
  AddOfferAdSetToTournamentPayload,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import { Affiliate_Firestore } from "./affiliate.type";
import { Collection } from "./collection.types";
import {
  OfferInTournamentStatus,
  Tournament_Firestore,
} from "./tournament.types";
import { Offer_Firestore } from "./offer.type";
import { AdSetStatus, AdSet_Firestore } from "./ad.types";

export const upgradeToAffiliate = async (
  userID: UserID
): Promise<Affiliate_Firestore> => {
  const userRef = db
    .collection(Collection.User)
    .doc(userID) as DocumentReference<User>;
  const userSnapshot = await userRef.get();
  const user = userSnapshot.data() as User;
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .doc() as DocumentReference<Affiliate_Firestore>;
  const affiliate: Affiliate_Firestore = {
    id: affiliateRef.id as AffiliateID,
    userID: userID,
    name: user.username || `New Affiliate ${affiliateRef.id}`,
  };
  await affiliateRef.set(affiliate);
  return affiliate;
};

export const affiliateAdminView = async (
  affiliateID: AffiliateID
): Promise<Affiliate_Firestore | undefined> => {
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .doc(affiliateID) as DocumentReference<Affiliate_Firestore>;

  const affiliateSnapshot = await affiliateRef.get();

  if (!affiliateSnapshot.exists) {
    return undefined;
  } else {
    return affiliateSnapshot.data();
  }
};

export const affiliatePublicView = async (
  affiliateID: AffiliateID
): Promise<Affiliate_Firestore | undefined> => {
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .doc(affiliateID) as DocumentReference<Affiliate_Firestore>;

  const affiliateSnapshot = await affiliateRef.get();

  if (!affiliateSnapshot.exists) {
    return undefined;
  } else {
    return affiliateSnapshot.data();
  }
};

export const addOfferAdSetToTournament = async (
  payload: AddOfferAdSetToTournamentPayload
): Promise<Tournament_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(payload.tournamentID) as DocumentReference<Tournament_Firestore>;
  const offerRef = db
    .collection(Collection.Offer)
    .doc(payload.offerID) as DocumentReference<Offer_Firestore>;
  const adSetRef = db
    .collection(Collection.AdSet)
    .doc(payload.adSetID) as DocumentReference<AdSet_Firestore>;
  const [tournamentSnapshot, offerSnapshot, adSetSnapshot] = await Promise.all([
    await tournamentRef.get(),
    await offerRef.get(),
    await adSetRef.get(),
  ]);
  if (
    !tournamentSnapshot.exists ||
    !offerSnapshot.exists ||
    !adSetSnapshot.exists
  ) {
    return undefined;
  }
  const existingTournament = tournamentSnapshot.data() as Tournament_Firestore;
  const existingOffer = offerSnapshot.data() as Offer_Firestore;
  const existingAdSet = adSetSnapshot.data() as AdSet_Firestore;

  if (existingOffer.status !== OfferStatus.Active) {
    throw new Error("Offer is not active, cannot add to tournament");
  }
  if (existingAdSet.status !== AdSetStatus.Active) {
    throw new Error("Ad Set is not active, cannot add to tournament");
  }

  const updatePayload: Partial<Tournament_Firestore> = {};
  // repeat
  if (!existingTournament.offers) {
    updatePayload.offers = {
      [payload.offerID]: {
        id: payload.offerID as OfferID,
        status: OfferInTournamentStatus.Active,
        rateCards: {
          // todo: add rate cards dynamically
        },
        adSets: {
          [payload.adSetID]: OfferInTournamentStatus.Active,
        },
      },
    };
  } else {
    updatePayload.offers = {
      ...existingTournament.offers,
      [payload.offerID]: {
        ...existingTournament.offers[payload.offerID],
        id: payload.offerID as OfferID,
        status: OfferInTournamentStatus.Active,
        rateCards: {
          // todo: add rate cards dynamically
        },
        adSets: {
          ...existingTournament.offers[payload.offerID].adSets,
          [payload.adSetID]: OfferInTournamentStatus.Active,
        },
      },
    };
  }
  if (
    !existingTournament.advertisers ||
    !existingTournament.advertisers.includes(existingAdSet.advertiserID)
  ) {
    updatePayload.advertisers = [
      ...(existingTournament.advertisers || []),
      existingAdSet.advertiserID,
    ];
  }
  // until done
  await tournamentRef.update(updatePayload);
  return (await tournamentRef.get()).data() as Tournament_Firestore;
};
