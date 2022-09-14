import {
  AffiliateID,
  OfferID,
  OfferStatus,
  UserID,
  TournamentID,
  RateQuoteID,
  AffiliateType,
  ActivationID,
  OrganizerRank,
  OrganizerOfferWhitelistID,
  AdvertiserID,
} from "@wormgraph/helpers";
import { DocumentReference, Query } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import {
  User,
  AddOfferAdSetToTournamentPayload,
  AdSet,
  RemoveOfferAdSetFromTournamentPayload,
  UpdatePromoterRateQuoteToTournamentPayload,
  RateQuoteInput,
  RemovePromoterFromTournamentPayload,
  WhitelistAffiliateToOfferPayload,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import {
  Affiliate_Firestore,
  OrganizerOfferWhitelist_Firestore,
  RateQuoteStatus,
  RateQuote_Firestore,
} from "./affiliate.type";
import { Collection } from "./collection.types";
import {
  OfferInTournamentStatus,
  Tournament_Firestore,
} from "./tournament.types";
import { Offer_Firestore } from "./offer.type";
import { AdSetStatus, AdSet_Firestore } from "./ad.types";
import { TournamentOffers } from "../../graphql/generated/types";

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
    organizerRank: OrganizerRank.ClayRank1,
  };
  await affiliateRef.set(affiliate);
  return affiliate;
};

export const whitelistAffiliateToOffer = async (
  payload: WhitelistAffiliateToOfferPayload
): Promise<OrganizerOfferWhitelist_Firestore> => {
  const whitelistAffiliateToOfferRef = db
    .collection(Collection.WhitelistOfferAffiliate)
    .doc() as DocumentReference<OrganizerOfferWhitelist_Firestore>;
  const organizerOfferWhitelist: OrganizerOfferWhitelist_Firestore = {
    id: whitelistAffiliateToOfferRef.id as OrganizerOfferWhitelistID,
    organizerID: payload.affiliateID as AffiliateID,
    offerID: payload.offerID as OfferID,
    advertiserID: payload.advertiserID as AdvertiserID,
    active: true,
  };
  await whitelistAffiliateToOfferRef.set(organizerOfferWhitelist);
  return organizerOfferWhitelist;
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
        rateQuotes: [
          // todo: add rate cards dynamically
        ],
        adSets: {
          [payload.adSetID]: OfferInTournamentStatus.Active,
        },
      },
    };
  } else {
    if (existingTournament.offers[payload.offerID]) {
      updatePayload.offers = {
        ...existingTournament.offers,
        [payload.offerID]: {
          ...existingTournament.offers[payload.offerID],
          status: OfferInTournamentStatus.Active,
          rateQuotes: [
            // todo: add rate cards dynamically
          ],
          adSets: {
            ...existingTournament.offers[payload.offerID].adSets,
            [payload.adSetID]: OfferInTournamentStatus.Active,
          },
        },
      };
    } else {
      updatePayload.offers = {
        ...existingTournament.offers,
        [payload.offerID]: {
          id: payload.offerID,
          status: OfferInTournamentStatus.Active,
          rateQuotes: [
            // this should be dynamically rendered
          ],
          adSets: {
            [payload.adSetID]: OfferInTournamentStatus.Active,
          },
        },
      };
    }
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

export const removeOfferAdSetFromTournament = async (
  payload: RemoveOfferAdSetFromTournamentPayload
): Promise<Tournament_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(payload.tournamentID) as DocumentReference<Tournament_Firestore>;
  const tournamentSnapshot = await tournamentRef.get();
  if (!tournamentSnapshot.exists) {
    return undefined;
  }
  const existingTournament = tournamentSnapshot.data() as Tournament_Firestore;
  const updatePayload: Partial<Tournament_Firestore> = {};
  // repeat
  if (
    payload.adSetID &&
    payload.offerID &&
    payload.tournamentID &&
    existingTournament.offers
  ) {
    const updatedAdSets = {
      ...existingTournament.offers[payload.offerID].adSets,
      [payload.adSetID]: OfferInTournamentStatus.Inactive,
    };
    let isActive = OfferInTournamentStatus.Inactive;
    for (const adSetID in updatedAdSets) {
      if (updatedAdSets[adSetID] === OfferInTournamentStatus.Active) {
        isActive = OfferInTournamentStatus.Active;
      }
    }
    updatePayload.offers = {
      ...existingTournament.offers,
      [payload.offerID]: {
        ...existingTournament.offers[payload.offerID],
        adSets: updatedAdSets,
        status: isActive,
      },
    };
  }
  // until done
  await tournamentRef.update(updatePayload);
  return (await tournamentRef.get()).data() as Tournament_Firestore;
};

export const transformOffersToArray = async (
  tournamentID: TournamentID
): Promise<TournamentOffers[]> => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID) as DocumentReference<Tournament_Firestore>;

  const tournamentSnapshot = await tournamentRef.get();

  if (!tournamentSnapshot.exists) {
    return [];
  }
  const tournament = tournamentSnapshot.data();
  if (!tournament || !tournament.offers) return [];

  const tournamentOffers: TournamentOffers[] = [];
  for (const offerID in tournament.offers) {
    const offerRef = db
      .collection(Collection.Offer)
      .doc(offerID) as DocumentReference<Offer_Firestore>;
    const offerSnapshot = await offerRef.get();
    if (!offerSnapshot.exists) continue;
    const offerData = offerSnapshot.data();
    if (!offerData) continue;
    const activeAdSets: string[] = [];
    const inactiveAdSets: string[] = [];
    for (const adSetID in tournament.offers[offerID].adSets) {
      if (
        tournament.offers[offerID].adSets[adSetID] ===
        OfferInTournamentStatus.Active
      ) {
        activeAdSets.push(adSetID);
      }
      if (
        tournament.offers[offerID].adSets[adSetID] ===
        OfferInTournamentStatus.Inactive
      ) {
        inactiveAdSets.push(adSetID);
      }
    }
    tournamentOffers.push({
      id: offerData.id,
      rateQuotes: [] as RateQuoteID[],
      status: offerData.status as unknown as OfferInTournamentStatus,
      activeAdSets: activeAdSets,
      inactiveAdSets: inactiveAdSets,
    });
  }

  return tournamentOffers;
};

export const updatePromoterRateQuoteInTournament = async (
  payload: UpdatePromoterRateQuoteToTournamentPayload
): Promise<Tournament_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  // get existing tournament
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(payload.tournamentID) as DocumentReference<Tournament_Firestore>;
  // get existing rate quotes
  const rateQuotesRef = db
    .collection(Collection.RateQuote)
    .where(
      "tournamentID",
      "==",
      payload.tournamentID
    ) as Query<RateQuote_Firestore>;
  // retrieve from firestore
  const [tournamentSnapshot, rateQuoteItems] = await Promise.all([
    tournamentRef.get(),
    rateQuotesRef.get(),
  ]);
  if (!tournamentSnapshot.exists) {
    return undefined;
  }
  // compile existing rate quotes
  let historicalRateQuotes: RateQuote_Firestore[] = [];
  if (!rateQuoteItems.empty) {
    historicalRateQuotes = rateQuoteItems.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id as RateQuoteID,
        tournamentID: data.tournamentID,
        affiliateID: data.affiliateID,
        affiliateType: data.affiliateType,
        offerID: data.offerID,
        activationID: data.activationID,
        pricing: data.pricing,
        timestamp: data.timestamp,
        status: data.status,
      };
    });
  }
  const existingTournament = tournamentSnapshot.data() as Tournament_Firestore;
  // start updating tournament
  const updatePayload: Partial<Tournament_Firestore> = {};
  // add promoter to tournament and remove duplicates
  if (!existingTournament.promoters) {
    updatePayload.promoters = [payload.promoterID as AffiliateID];
  } else {
    updatePayload.promoters = [
      ...existingTournament.promoters,
      payload.promoterID as AffiliateID,
    ].filter((x, i, a) => a.indexOf(x) == i);
  }
  // add rate quotes to tournament
  // or replace existing rate quotes
  if (payload.rateQuotes && existingTournament.offers) {
    const historicalRateQuoteIDs = historicalRateQuotes.map((rq) => rq.id);
    const currentRateQuoteIDs: RateQuoteID[] =
      existingTournament.offers[payload.offerID].rateQuotes || [];
    const rateQuotesToAdd: RateQuoteInput[] = [];
    const historicalRateQuotesToExclude: RateQuoteID[] = [];
    for (let i = 0; i < payload.rateQuotes.length; i++) {
      const prehistoricalRateQuotes = historicalRateQuotes.filter(
        (rq) =>
          rq.tournamentID === payload.tournamentID &&
          rq.affiliateID === payload.promoterID &&
          rq.offerID === payload.offerID &&
          rq.activationID === payload.rateQuotes[i].activationID
      );
      prehistoricalRateQuotes.forEach((erq) =>
        historicalRateQuotesToExclude.push(erq.id)
      );
      rateQuotesToAdd.push(payload.rateQuotes[i]);
    }
    const currentRateQuotesToRemoveIDs = currentRateQuoteIDs.filter((rqID) =>
      historicalRateQuotesToExclude.includes(rqID)
    );
    const addedRateQuotes = await Promise.all([
      ...rateQuotesToAdd.map((rq) => {
        return createRateQuote(rq);
      }),
    ]);
    await Promise.all([
      ...currentRateQuotesToRemoveIDs.map((rqID) => {
        return deactivateRateQuote(rqID);
      }),
    ]);

    const updatedListOfRateQuotes = currentRateQuoteIDs
      .filter((x) => !historicalRateQuotesToExclude.includes(x))
      .concat(addedRateQuotes.map((rq) => rq.id));

    const offer = {
      ...existingTournament.offers[payload.offerID],
      rateQuotes: updatedListOfRateQuotes,
    };
    updatePayload.offers = {
      ...existingTournament.offers,
      [payload.offerID]: offer,
    };
  }
  // until done
  await tournamentRef.update(updatePayload);
  return (await tournamentRef.get()).data() as Tournament_Firestore;
};

export const removePromoterFromTournament = async (
  payload: RemovePromoterFromTournamentPayload
): Promise<Tournament_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  // get existing tournament
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(payload.tournamentID) as DocumentReference<Tournament_Firestore>;
  // get existing rate quotes
  const rateQuotesRef = db
    .collection(Collection.RateQuote)
    .where(
      "tournamentID",
      "==",
      payload.tournamentID
    ) as Query<RateQuote_Firestore>;
  const [tournamentSnapshot, rateQuoteItems] = await Promise.all([
    tournamentRef.get(),
    rateQuotesRef.get(),
  ]);
  if (!tournamentSnapshot.exists) {
    return undefined;
  }
  // compile existing rate quotes
  let historicalRateQuoteIDsForPromoter: RateQuoteID[] = [];
  if (!rateQuoteItems.empty) {
    historicalRateQuoteIDsForPromoter = rateQuoteItems.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id as RateQuoteID,
          tournamentID: data.tournamentID,
          affiliateID: data.affiliateID,
          affiliateType: data.affiliateType,
          offerID: data.offerID,
          activationID: data.activationID,
          pricing: data.pricing,
          timestamp: data.timestamp,
          status: data.status,
        };
      })
      .filter((rq) => {
        return rq.affiliateID === payload.promoterID;
      })
      .map((rq) => rq.id);
  }
  const existingTournament = tournamentSnapshot.data() as Tournament_Firestore;
  const updatePayload: Partial<Tournament_Firestore> = {};
  // repeat
  if (
    payload.promoterID &&
    payload.tournamentID &&
    existingTournament.promoters
  ) {
    // remove the promoterID from the list of promoters
    updatePayload.promoters = existingTournament.promoters.filter(
      (pid) => pid !== payload.promoterID
    );
    // deactive the other rate quotes and remove them from the list
    let updatedOffers = {
      ...existingTournament.offers,
    };
    if (existingTournament.offers) {
      for (const offerID of Object.keys(existingTournament.offers)) {
        const offer = existingTournament.offers[offerID];
        if (offer.rateQuotes) {
          const rateQuotesToRemove = offer.rateQuotes.filter((rqID) => {
            return historicalRateQuoteIDsForPromoter.includes(rqID);
          });
          await Promise.all(
            rateQuotesToRemove.map(async (rqID) => {
              await deactivateRateQuote(rqID);
            })
          );
          const updatedOffer = {
            ...offer,
            rateQuotes: offer.rateQuotes.filter((rq) => {
              return !rateQuotesToRemove.includes(rq);
            }),
          };
          updatedOffers = {
            ...updatedOffers,
            [offerID]: updatedOffer,
          };
        }
      }
    }
    updatePayload.offers = updatedOffers;
  }
  // until done
  await tournamentRef.update(updatePayload);
  return (await tournamentRef.get()).data() as Tournament_Firestore;
};

export const createRateQuote = async (
  payload: RateQuoteInput
): Promise<RateQuote_Firestore> => {
  const rateQuoteRef = db
    .collection(Collection.RateQuote)
    .doc() as DocumentReference<RateQuote_Firestore>;
  const newRateQuote: RateQuote_Firestore = {
    id: rateQuoteRef.id as RateQuoteID,
    tournamentID: payload.tournamentID as TournamentID,
    affiliateID: payload.affiliateID as AffiliateID,
    affiliateType: payload.affiliateType as AffiliateType,
    offerID: payload.offerID as OfferID,
    activationID: payload.activationID as ActivationID,
    pricing: payload.pricing,
    timestamp: new Date().getTime() / 1000,
    status: RateQuoteStatus.Active,
  };
  await rateQuoteRef.set(newRateQuote);
  return newRateQuote;
};

export const deactivateRateQuote = async (
  id: RateQuoteID
): Promise<RateQuote_Firestore | undefined> => {
  const rateQuoteRef = db
    .collection(Collection.RateQuote)
    .doc(id) as DocumentReference<RateQuote_Firestore>;
  const updatePayload: Partial<RateQuote_Firestore> = {};
  updatePayload.status = RateQuoteStatus.Inactive;
  await rateQuoteRef.update(updatePayload);
  return (await rateQuoteRef.get()).data() as RateQuote_Firestore;
};
