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
  rankInfoTable,
  Collection,
  RateQuote_Firestore,
  Offer_Firestore,
  RateQuoteStatus,
  Tournament_Firestore,
  OfferInTournamentStatus,
  AdSetID,
  UserIdpID,
  AdSetInTournamentStatus,
  AdID,
  Memo_Firestore,
  OfferStrategy,
  Activation_Firestore,
  AffiliateVisibility_Firestore,
  Affiliate_Firestore,
} from "@wormgraph/helpers";
import { DocumentReference, Query } from "firebase-admin/firestore";
import {
  User,
  AddOfferAdSetToTournamentPayload,
  AdSet,
  RemoveOfferAdSetFromTournamentPayload,
  AddUpdatePromoterRateQuoteToTournamentPayload,
  RateQuoteInput,
  RemovePromoterFromTournamentPayload,
  WhitelistAffiliateToOfferPayload,
  OrganizerOfferWhitelistWithProfile,
  EditWhitelistAffiliateToOfferPayload,
  OfferAffiliateView,
  AdSetPreview,
  RateQuoteDealConfig,
  DealConfigTournament,
  AdSetPreviewInDealConfig,
  Tournament,
  UpdateAffiliateDetailsPayload,
  OfferStrategyType,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import { OrganizerOfferWhitelist_Firestore } from "./affiliate.type";
import { AdSetStatus, AdSet_Firestore, Ad_Firestore } from "./ad.types";
// import { TournamentOffers, OfferStrategyType } from '../../graphql/generated/types';
import { Advertiser_Firestore } from "./advertiser.type";
import { getOffer, listActiveActivationsForOffer } from "./offer";
import * as _ from "lodash";
import { getTournamentById } from "./tournament";
import { getAd, getAdSet } from "./ad";
import { getAdvertiser } from "./advertiser";
import {
  checkIfUserIdpMatchesAdvertiser,
  checkIfUserIdpMatchesAffiliate,
} from "../identityProvider/firebase";
import {
  getRandomPortraitFromLexicaHardcoded,
  getRandomUserName,
} from "../lexica-images";
import { retrieveRandomColor } from "../storage";
import { convertAffiliateVisibilityGQLToDB } from "../../lib/affiliate";

export const upgradeToAffiliate = async (
  userIdpID: UserIdpID
): Promise<Affiliate_Firestore> => {
  const existingAffiliateRef = db
    .collection(Collection.Affiliate)
    .where("userID", "==", userIdpID);
  const existingAffiliates = await existingAffiliateRef.get();
  if (!existingAffiliates.empty) {
    const exad = existingAffiliates.docs.map((doc) => doc.data())[0];
    throw Error(`User is already an affiliate ${exad.id}`);
  }
  const userRef = db
    .collection(Collection.User)
    .doc(userIdpID) as DocumentReference<User>;
  const userSnapshot = await userRef.get();
  const user = userSnapshot.data() as User;
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .doc() as DocumentReference<Affiliate_Firestore>;
  const initialAvatar = await getRandomPortraitFromLexicaHardcoded();
  const initialUsername = await getRandomUserName({
    type: "organizer",
    seedEmail: user.email || undefined,
  });
  const affiliate: Affiliate_Firestore = {
    id: affiliateRef.id as AffiliateID,
    userID: userIdpID as unknown as UserID,
    userIdpID: userIdpID,
    name:
      initialUsername || user.username || `New Affiliate ${affiliateRef.id}`,
    description: "",
    publicContactEmail: "",
    organizerRank: OrganizerRank.ClayRank1,
    avatar: initialAvatar,
    website: "",
    audienceSize: 0,
    visibility: AffiliateVisibility_Firestore.Private,
  };
  await affiliateRef.set(affiliate);
  return affiliate;
};

export const updateAffiliateDetails = async (
  affiliateID: AffiliateID,
  payload: UpdateAffiliateDetailsPayload,
  userIdpID
): Promise<Affiliate_Firestore> => {
  // check if user is allowed to run this operation
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userIdpID,
    affiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions for this affiliate`
    );
  }
  //
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .doc(affiliateID) as DocumentReference<Affiliate_Firestore>;
  const updatePayload: Partial<Affiliate_Firestore> = {};
  // repeat
  if (payload.name != undefined) {
    updatePayload.name = payload.name;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }
  if (payload.avatar != undefined) {
    updatePayload.avatar = payload.avatar;
  }
  if (payload.publicContactEmail != undefined) {
    updatePayload.publicContactEmail = payload.publicContactEmail;
  }
  if (payload.website != undefined) {
    updatePayload.website = payload.website;
  }
  if (payload.audienceSize != undefined) {
    updatePayload.audienceSize = payload.audienceSize;
  }

  if (payload.visibility != undefined) {
    updatePayload.visibility = convertAffiliateVisibilityGQLToDB(
      payload.visibility
    );
  }

  // until done
  await affiliateRef.update(updatePayload);
  return (await affiliateRef.get()).data() as Affiliate_Firestore;
};

export const whitelistAffiliateToOffer = async (
  payload: WhitelistAffiliateToOfferPayload,
  userIdpID
): Promise<OrganizerOfferWhitelist_Firestore> => {
  const offer = await getOffer(payload.offerID as OfferID);
  if (!offer) {
    throw Error(`Offer not found`);
  }
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    offer.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }
  // check if it already exists
  const existingWhitelistRef = db
    .collection(Collection.WhitelistOfferAffiliate)
    .where("organizerID", "==", payload.affiliateID)
    .where(
      "offerID",
      "==",
      payload.offerID
    ) as Query<OrganizerOfferWhitelist_Firestore>;
  const existingWhitelistCollectionItems = await existingWhitelistRef.get();
  if (
    !existingWhitelistCollectionItems.empty ||
    existingWhitelistCollectionItems.docs.length > 0
  ) {
    return existingWhitelistCollectionItems.docs.map((x) => x.data())[0];
  }

  // add it if it doesn't exist
  const whitelistAffiliateToOfferRef = db
    .collection(Collection.WhitelistOfferAffiliate)
    .doc() as DocumentReference<OrganizerOfferWhitelist_Firestore>;
  const organizerOfferWhitelist: OrganizerOfferWhitelist_Firestore = {
    id: whitelistAffiliateToOfferRef.id as OrganizerOfferWhitelistID,
    organizerID: payload.affiliateID as AffiliateID,
    offerID: payload.offerID as OfferID,
    advertiserID: payload.advertiserID as AdvertiserID,
    status: payload.status,
    timestamp: new Date().getTime() / 1000,
  };
  await whitelistAffiliateToOfferRef.set(organizerOfferWhitelist);

  // update the advertisers list
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(payload.advertiserID) as DocumentReference<Advertiser_Firestore>;
  const advertiserSnapshot = await advertiserRef.get();
  if (!advertiserSnapshot.exists) {
    return organizerOfferWhitelist;
  }
  const advertiser = advertiserSnapshot.data();
  if (!advertiser) {
    return organizerOfferWhitelist;
  }
  const allExistingKnownAffiliates = advertiser.affiliatePartners;
  const updatedUniqueSetOfKnownTournaments = _.union(
    allExistingKnownAffiliates,
    [payload.affiliateID]
  );
  const updatePayload: Partial<Advertiser_Firestore> = {};
  updatePayload.affiliatePartners = updatedUniqueSetOfKnownTournaments;
  await advertiserRef.update(updatePayload);

  return organizerOfferWhitelist;
};

export const editWhitelistAffiliateToOffer = async (
  payload: EditWhitelistAffiliateToOfferPayload,
  userIdpID
): Promise<OrganizerOfferWhitelist_Firestore | undefined> => {
  const offer = await getOffer(payload.offerID as OfferID);
  if (!offer) {
    throw Error(`Offer not found`);
  }
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    offer.advertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }
  const whitelistAffiliateToOfferRef = db
    .collection(Collection.WhitelistOfferAffiliate)
    .doc(payload.id) as DocumentReference<OrganizerOfferWhitelist_Firestore>;
  const whitelistAffiliateToOfferSnapshot =
    await whitelistAffiliateToOfferRef.get();
  if (!whitelistAffiliateToOfferSnapshot.exists) {
    return undefined;
  }
  const existingObj = whitelistAffiliateToOfferSnapshot.data();

  const updatePayload: Partial<OrganizerOfferWhitelist_Firestore> = {};
  // repeat
  if (payload.status != undefined) {
    updatePayload.status = payload.status;
  }
  // until done
  await whitelistAffiliateToOfferRef.update(updatePayload);
  return (
    await whitelistAffiliateToOfferRef.get()
  ).data() as OrganizerOfferWhitelist_Firestore;
};

export const affiliateAdminView = async (
  userIdpID: UserIdpID
): Promise<Affiliate_Firestore | undefined> => {
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .where("userIdpID", "==", userIdpID) as Query<Affiliate_Firestore>;

  const affiliateCollectionItems = await affiliateRef.get();

  if (affiliateCollectionItems.empty) {
    throw Error(`Affiliate with userIdpID ${userIdpID} does not exist`);
  }
  const affiliates = affiliateCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return data;
  });
  if (affiliates && affiliates[0]) {
    return affiliates[0];
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
  payload: AddOfferAdSetToTournamentPayload,
  userIdpID
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
  const affiliateSetRef = db
    .collection(Collection.Affiliate)
    .doc(payload.organizerID) as DocumentReference<Affiliate_Firestore>;
  const rateQuoteRef = db
    .collection(Collection.RateQuote)
    .where(
      "tournamentID",
      "==",
      payload.tournamentID
    ) as Query<RateQuote_Firestore>;

  const [
    tournamentSnapshot,
    offerSnapshot,
    adSetSnapshot,
    affiliateSnapshot,
    rateQuoteSnapshots,
    activeActivationsForOffer,
  ] = await Promise.all([
    await tournamentRef.get(),
    await offerRef.get(),
    await adSetRef.get(),
    await affiliateSetRef.get(),
    await rateQuoteRef.get(),
    await listActiveActivationsForOffer(payload.offerID as OfferID),
  ]);
  if (
    !tournamentSnapshot.exists ||
    !offerSnapshot.exists ||
    !adSetSnapshot.exists ||
    !affiliateSnapshot.exists
  ) {
    return undefined;
  }
  const existingTournament = tournamentSnapshot.data() as Tournament_Firestore;
  const existingOffer = offerSnapshot.data() as Offer_Firestore;
  const existingAdSet = adSetSnapshot.data() as AdSet_Firestore;
  const existingAffiliate = affiliateSnapshot.data() as Affiliate_Firestore;

  // check if user is allowed to run this operation
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userIdpID,
    existingTournament.organizer as AffiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions for this affiliate`
    );
  }
  //

  if (existingOffer.status !== OfferStatus.Active) {
    throw new Error("Offer is not active, cannot add to tournament");
  }
  if (existingAdSet.status !== AdSetStatus.Active) {
    throw new Error("Ad Set is not active, cannot add to tournament");
  }
  // check tournament for existing historical rate quotes
  let historicalRateQuotes: RateQuote_Firestore[] = [];
  if (!rateQuoteSnapshots.empty) {
    historicalRateQuotes = rateQuoteSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
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
  // const historicalRateQuotesToKeep: RateQuoteID[] = [];
  // create the organizer rate quotes
  const rateQuoteRank =
    rankInfoTable[existingAffiliate.organizerRank || OrganizerRank.ClayRank1];
  const rateQuotes: RateQuoteInput[] = [];
  for (let i = 0; i < activeActivationsForOffer.length; i++) {
    const activation = activeActivationsForOffer[i];
    const rateQuote: RateQuoteInput = {
      tournamentID: payload.tournamentID as TournamentID,
      affiliateID: payload.organizerID as AffiliateID,
      affiliateType: AffiliateType.Organizer,
      offerID: payload.offerID as OfferID,
      activationID: activation.id as ActivationID,
      pricing: activation.pricing * rateQuoteRank.revenueShare,
    };
    // add this rate quote for activation if it doesn't exist aleady
    const existingRateQuote = historicalRateQuotes.find((rq) => {
      return (
        rq.tournamentID === rateQuote.tournamentID &&
        rq.activationID === rateQuote.activationID &&
        rq.offerID === rateQuote.offerID &&
        rq.status === RateQuoteStatus.Active
      );
    });

    if (!existingRateQuote) {
      rateQuotes.push(rateQuote);
    }
  }
  // historicalRateQuotes.forEach((rq) => {
  //   if (
  //     rq.offerID === payload.offerID &&
  //     rq.tournamentID === payload.tournamentID
  //   ) {
  //     historicalRateQuotesToRemove.push(rq.id);
  //   }
  // });
  // add the new rate quotes to the database
  const addedRateQuotes = await Promise.all([
    ...rateQuotes.map((rq) => {
      return createRateQuote(rq);
    }),
  ]);

  // deactivate the old rate quotes from the database
  // await Promise.all([
  //   ...historicalRateQuotesToRemove.map((rqID) => {
  //     return deactivateRateQuote(rqID);
  //   }),
  // ]);

  const updatePayload: Partial<Tournament_Firestore> = {};
  let updatedRateQuotes: RateQuoteID[] = [];
  // remove the old rate quotes from the tournament
  // add the new rate quotes to the tournament
  if (existingTournament.offers && existingTournament.offers[payload.offerID]) {
    updatedRateQuotes = existingTournament.offers[
      payload.offerID
    ].rateQuotes.concat(addedRateQuotes.map((rq) => rq.id));
    // .filter((rq) => !historicalRateQuotesToRemove.includes(rq))
  } else {
    updatedRateQuotes = addedRateQuotes.map((rq) => rq.id);
  }
  // repeat
  if (!existingTournament.offers) {
    updatePayload.offers = {
      [payload.offerID]: {
        id: payload.offerID as OfferID,
        status: OfferInTournamentStatus.Active,
        rateQuotes: updatedRateQuotes,
        strategy: existingOffer.strategy || OfferStrategy.None,
        adSets: {
          [payload.adSetID]: AdSetInTournamentStatus.Active,
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
          rateQuotes: updatedRateQuotes,
          strategy: existingOffer.strategy || OfferStrategy.None,
          adSets: {
            ...existingTournament.offers[payload.offerID].adSets,
            [payload.adSetID]: AdSetInTournamentStatus.Active,
          },
        },
      };
    } else {
      updatePayload.offers = {
        ...existingTournament.offers,
        [payload.offerID]: {
          id: payload.offerID as OfferID,
          status: OfferInTournamentStatus.Active,
          rateQuotes: updatedRateQuotes,
          strategy: existingOffer.strategy || OfferStrategy.None,
          adSets: {
            [payload.adSetID]: AdSetInTournamentStatus.Active,
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
  payload: RemoveOfferAdSetFromTournamentPayload,
  userIdpID
): Promise<Tournament_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(payload.tournamentID) as DocumentReference<Tournament_Firestore>;
  const rateQuoteRef = db
    .collection(Collection.RateQuote)
    .where(
      "tournamentID",
      "==",
      payload.tournamentID
    ) as Query<RateQuote_Firestore>;
  const [tournamentSnapshot, rateQuoteSnapshots] = await Promise.all([
    tournamentRef.get(),
    rateQuoteRef.get(),
  ]);
  if (!tournamentSnapshot.exists) {
    return undefined;
  }
  const existingTournament = tournamentSnapshot.data() as Tournament_Firestore;

  // check if user is allowed to run this operation
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userIdpID,
    existingTournament.organizer as AffiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions for this affiliate`
    );
  }
  //
  // check tournament for existing historical rate quotes
  let historicalRateQuotes: RateQuote_Firestore[] = [];
  if (!rateQuoteSnapshots.empty) {
    historicalRateQuotes = rateQuoteSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
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
  // identify the old rate quotes to deactivate
  let historicalRateQuotesToRemove: RateQuoteID[] = [];
  // update the tournament
  const updatePayload: Partial<Tournament_Firestore> = {};
  if (
    payload.adSetID &&
    payload.offerID &&
    payload.tournamentID &&
    existingTournament.offers
  ) {
    // update all the adSets status
    const updatedAdSets = {
      ...existingTournament.offers[payload.offerID].adSets,
      [payload.adSetID]: AdSetInTournamentStatus.Inactive,
    };
    // check if at least 1 adSet is active still
    let offerActiveStatus = OfferInTournamentStatus.Inactive;
    for (const adSetID in updatedAdSets) {
      if (updatedAdSets[adSetID] === AdSetInTournamentStatus.Active) {
        offerActiveStatus = OfferInTournamentStatus.Active;
      }
    }
    // if no adSets are active anymore, we should remove old rate quotes for all affiliates
    if (offerActiveStatus === OfferInTournamentStatus.Inactive) {
      historicalRateQuotes.forEach((rq) => {
        if (
          rq.offerID === payload.offerID &&
          rq.tournamentID === payload.tournamentID
        ) {
          historicalRateQuotesToRemove.push(rq.id);
        }
      });
    }
    // and calculate the final set of rate quotes to keep
    const updatedRateQuotesForOffer: RateQuoteID[] = existingTournament.offers[
      payload.offerID
    ].rateQuotes.filter((rq) => !historicalRateQuotesToRemove.includes(rq));

    // form the final offers object to save
    updatePayload.offers = {
      ...existingTournament.offers,
      [payload.offerID]: {
        ...existingTournament.offers[payload.offerID],
        adSets: updatedAdSets,
        status: offerActiveStatus, // set active or not based on if theres still old active cards
        rateQuotes: updatedRateQuotesForOffer,
      },
    };
  }
  // deactivate the old rate quotes from the database
  await Promise.all([
    ...historicalRateQuotesToRemove.map((rqID) => {
      return deactivateRateQuote(rqID);
    }),
  ]);
  // until done
  await tournamentRef.update(updatePayload);
  return (await tournamentRef.get()).data() as Tournament_Firestore;
};

export const renderDealConfigsOfTournament = async (
  tournamentID: TournamentID
): Promise<DealConfigTournament[]> => {
  const tournament = await getTournamentById(tournamentID);

  if (!tournament) return [];

  const offersConfigs = tournament.offers;
  if (!offersConfigs) return [];

  const offers = Object.values(offersConfigs);
  const adSetIDs: AdSetID[] = [];
  const adIDs: AdID[] = [];
  const rateQuoteIDs: RateQuoteID[] = [];
  const affiliateIDs: AffiliateID[] = [];

  offers.forEach((offer) => {
    const aids = Object.keys(offer.adSets) as AdSetID[];
    aids.forEach((aid) => {
      adSetIDs.push(aid);
    });
    offer.rateQuotes.map((rq) => {
      rateQuoteIDs.push(rq);
    });
  });

  const [adSetsFirestore, rateQuotesFirestore, offersFirestore]: [
    adSets: AdSet_Firestore[],
    rateQuotes: RateQuote_Firestore[],
    offers: Offer_Firestore[]
  ] = await Promise.all([
    Promise.all(
      _.uniq(adSetIDs).map((aids) => {
        return getAdSet(aids);
      })
    ),
    Promise.all(
      _.uniq(rateQuoteIDs).map((rqid) => {
        return getRateQuote(rqid);
      })
    ),
    Promise.all(
      _.uniq(offers.map((o) => o.id)).map((oid) => {
        return getOffer(oid);
      })
    ),
  ]);
  rateQuotesFirestore.forEach((rq) => {
    affiliateIDs.push(rq.affiliateID);
  });
  _.flatten(adSetsFirestore.map((ads) => ads.adIDs)).forEach((adi) =>
    adIDs.push(adi)
  );

  const [
    advertisersFirestore,
    activationsFirestore,
    affiliatesFirestore,
    adsFirestore,
  ]: [
    Advertiser_Firestore[],
    Activation_Firestore[],
    Affiliate_Firestore[],
    Ad_Firestore[]
  ] = await Promise.all([
    Promise.all(
      _.uniq(adSetsFirestore.map((adset) => getAdvertiser(adset.advertiserID)))
    ),
    Promise.all(
      _.uniq(rateQuotesFirestore.map((rq) => getActivation(rq.activationID)))
    ),
    Promise.all(
      _.uniq(affiliateIDs).map((aid) => {
        return getAffiliate(aid);
      })
    ),
    Promise.all(
      _.uniq(adIDs).map((aid) => {
        return getAd(aid);
      })
    ),
  ]);
  const dealConfigSets = offers.map((offer) => {
    const offerName = offersFirestore.find((o) => o.id === offer.id)?.title;
    const offerFS = offersFirestore.find((o) => o.id === offer.id);

    const advertiser = advertisersFirestore.find(
      (a) => a.id === offerFS?.advertiserID
    );
    const adSets = Object.keys(offer.adSets)
      .map((asid) => {
        const adSet = adSetsFirestore.find((a) => a.id === asid);
        const ad = adsFirestore.find((a) => a.id === adSet?.adIDs[0]);
        let adSetToReturn: any = {
          id: asid,
          name: adSet?.name || "",
          status: offer.adSets[asid],
          placement: adSet?.placement,
          thumbnail: adSet?.thumbnail || "",
        };
        if (ad) {
          adSetToReturn.ad = {
            adID: ad.id || "",
            creativeType: ad.creative.creativeType || "",
            creativeLinks: ad.creative.creativeLinks || [],
            callToAction: ad.creative.callToAction || "",
            aspectRatio: ad.creative.aspectRatio || "",
            themeColor: ad.creative.themeColor || retrieveRandomColor(),
          };
        }
        return adSetToReturn;
      })
      .filter((a) => a.placement) as AdSetPreviewInDealConfig[];
    const rateQuoteConfigs = offer.rateQuotes.map((rqid) => {
      const rateQuote = rateQuotesFirestore.find((r) => r.id === rqid);

      const affiliate = affiliatesFirestore.find(
        (a) => a.id === rateQuote?.affiliateID
      );
      const activation = activationsFirestore.find(
        (a) => a.id === rateQuote?.activationID
      );
      return {
        rateQuoteID: rqid,
        activationID: rateQuote?.activationID || "",
        activationName: activation?.name || "",
        activationOrder: activation?.order || 99,
        description: activation?.description || "",
        pricing: rateQuote?.pricing,
        affiliateID: rateQuote?.affiliateID || "",
        affiliateName: affiliate?.name || "",
        affiliateAvatar: affiliate?.avatar || "",
      };
    }) as RateQuoteDealConfig[];
    const dealConfig = {
      tournamentID: tournamentID,
      offerID: offer.id,
      offerName: offerName || "",
      advertiserID: offerFS?.advertiserID || "",
      advertiserName: advertiser?.name || "",
      advertiserAvatar: advertiser?.avatar || "",
      adSets: adSets,
      rateQuoteConfigs: rateQuoteConfigs,
      strategy: OfferStrategyType.None,
    };
    if (offerFS?.strategy) {
      // @ts-ignore
      dealConfig.strategy = offerFS?.strategy;
    }
    return dealConfig;
  });

  return dealConfigSets;
};

export const addUpdatePromoterRateQuoteInTournament = async (
  payload: AddUpdatePromoterRateQuoteToTournamentPayload,
  userIdpID
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
  // check if user is allowed to run this operation
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userIdpID,
    existingTournament.organizer as AffiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions for this affiliate`
    );
  }
  //
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
  payload: RemovePromoterFromTournamentPayload,
  userIdpID
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
  // check if user is allowed to run this operation
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userIdpID,
    existingTournament.organizer as AffiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions for this affiliate`
    );
  }
  //
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

export const viewMyTournamentsAsOrganizer = async (
  organizerID: AffiliateID,
  userIdpID
): Promise<Tournament[]> => {
  // check if user is allowed to run this operation
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userIdpID,
    organizerID as AffiliateID
  );
  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions for this affiliate`
    );
  }
  const timestampFieldName: keyof Tournament_Firestore = "timestamps";
  const createdAtFieldName = "createdAt";
  const tournamentRef = db
    .collection(Collection.Tournament)
    .where("organizer", "==", organizerID)
    .orderBy(
      `${timestampFieldName}.${createdAtFieldName}`,
      "desc"
    ) as Query<Tournament_Firestore>;

  const tournamentCollectionItems = await tournamentRef.get();

  if (tournamentCollectionItems.empty) {
    return [];
  }
  const tournaments = tournamentCollectionItems.docs.map((doc) => doc.data());
  return tournaments as unknown as Tournament[];
};

export const viewTournamentAsOrganizer = async (
  tournamentID: TournamentID,
  userIdpID
): Promise<Tournament_Firestore | undefined> => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID) as DocumentReference<Tournament_Firestore>;

  const tournamentSnapshot = await tournamentRef.get();

  if (!tournamentSnapshot.exists) {
    return undefined;
  }
  const tournament = tournamentSnapshot.data();

  if (!tournament?.organizer) {
    throw Error(`Unauthorized. User do not have permissions for this event`);
  }

  // check if user is allowed to run this operation
  const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
    userIdpID,
    tournament.organizer as AffiliateID
  );

  if (!isValidUserAffiliate) {
    throw Error(
      `Unauthorized. User do not have permissions for this affiliate`
    );
  }
  //
  return tournament;
};

export const viewWhitelistedAffiliatesToOffer = async (
  offerID: OfferID,
  userIdpID
): Promise<OrganizerOfferWhitelistWithProfile[]> => {
  const offer = await getOffer(offerID);
  // check if user is allowed to run this operation
  const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
    userIdpID,
    offer?.advertiserID as AdvertiserID
  );
  if (!isValidUserAdvertiser) {
    throw Error(
      `Unauthorized. User do not have permissions for this advertiser`
    );
  }
  //
  const organizerOfferWhitelistRef = db
    .collection(Collection.WhitelistOfferAffiliate)
    .where(
      "offerID",
      "==",
      offerID
    ) as Query<OrganizerOfferWhitelist_Firestore>;

  const whitelistCollectionItems = await organizerOfferWhitelistRef.get();

  if (whitelistCollectionItems.empty) {
    return [];
  }
  const whitelisted = whitelistCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return data;
  });
  const affiliateInfos = (
    await Promise.all(
      whitelisted.map((w) => {
        const affiliateRef = db
          .collection(Collection.Affiliate)
          .doc(w.organizerID) as DocumentReference<Affiliate_Firestore>;
        return affiliateRef.get();
      })
    )
  ).map((w) => w.data());
  const x = affiliateInfos
    .map((o, i) => {
      return {
        organizer: o,
        whitelist: whitelisted[i],
      };
    })
    .filter((x) => x.organizer !== undefined)
    .filter((x) => {
      return {
        ...x.whitelist,
        name: x.organizer?.name,
        avatar: x.organizer?.avatar,
      };
    }) as OrganizerOfferWhitelistWithProfile[];
  return x;
};

export const getRateQuoteForOfferAndAffiliate = async (
  offerID: OfferID,
  affiliateID: AffiliateID
): Promise<OrganizerOfferWhitelistWithProfile[]> => {
  const organizerOfferWhitelistRef = db
    .collection(Collection.WhitelistOfferAffiliate)
    .where(
      "offerID",
      "==",
      offerID
    ) as Query<OrganizerOfferWhitelist_Firestore>;

  const whitelistCollectionItems = await organizerOfferWhitelistRef.get();

  if (whitelistCollectionItems.empty) {
    return [];
  }
  const whitelisted = whitelistCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return data;
  });
  const affiliateInfos = (
    await Promise.all(
      whitelisted.map((w) => {
        const affiliateRef = db
          .collection(Collection.Affiliate)
          .doc(w.organizerID) as DocumentReference<Affiliate_Firestore>;
        return affiliateRef.get();
      })
    )
  ).map((w) => w.data());
  const x = affiliateInfos
    .map((o, i) => {
      return {
        organizer: o,
        whitelist: whitelisted[i],
      };
    })
    .filter((x) => x.organizer !== undefined)
    .filter((x) => {
      return {
        ...x.whitelist,
        name: x.organizer?.name,
        avatar: x.organizer?.avatar,
      };
    }) as OrganizerOfferWhitelistWithProfile[];
  return x;
};

export const getActivationsWithRateQuoteForAffiliate = async (
  affiliateID: AffiliateID,
  offerID: OfferID
) => {
  // get the activations for the offerID
  const activationRef = db
    .collection(Collection.Activation)
    .where("offerID", "==", offerID) as Query<Activation_Firestore>;
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .doc(affiliateID) as DocumentReference<Affiliate_Firestore>;

  const [activationCollectionItems, affiliateSnap] = await Promise.all([
    activationRef.get(),
    affiliateRef.get(),
  ]);
  if (activationCollectionItems.empty || !affiliateSnap.exists) {
    return [];
  }
  const existingAffiliate = affiliateSnap.data();
  const rateQuoteRank =
    rankInfoTable[existingAffiliate?.organizerRank || OrganizerRank.ClayRank1];
  const activations = activationCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return {
      activationID: data.id,
      activationName: data.name,
      description: data.description,
      pricing: data.pricing * rateQuoteRank.revenueShare,
      rank: rateQuoteRank.slug,
      affiliateID: affiliateID,
      order: data.order,
    };
  });
  return activations;
};

export const viewOfferDetailsAsAffiliate = async (offerID: OfferID) => {
  const offerRef = db
    .collection(Collection.Offer)
    .doc(offerID) as DocumentReference<Offer_Firestore>;
  // const affiliateRef = db
  //   .collection(Collection.Affiliate)
  //   .doc(affiliateID) as DocumentReference<Affiliate_Firestore>;
  // const activationRef = db
  //   .collection(Collection.Activation)
  //   .where("offerID", "==", offerID) as Query<Activation_Firestore>;
  // const [affiliateSnap, offerSnap, activationsSnaps] = await Promise.all([
  //   affiliateRef.get(),
  //   offerRef.get(),
  //   affiliateRef.get(),
  // ]);
  const offerSnap = await offerRef.get();
  if (!offerSnap.exists) {
    return undefined;
  }
  const offer = offerSnap.data();
  if (!offer) {
    return undefined;
  }
  const advertiser = await getAdvertiser(offer.advertiserID);
  if (!offer) {
    return undefined;
  }
  const offerAffiliateView = {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    image: offer.image,
    advertiserID: offer.advertiserID,
    advertiserName: advertiser?.name || "",
    advertiserAvatar: advertiser?.avatar || "",
    spentBudget: offer.spentBudget,
    maxBudget: offer.maxBudget,
    startDate: offer.startDate,
    endDate: offer.endDate,
    status: offer.status,
  } as unknown as OfferAffiliateView;
  return offerAffiliateView;
};

export const getRateQuote = async (rateQuoteID: RateQuoteID) => {
  const rateQuoteRef = db
    .collection(Collection.RateQuote)
    .doc(rateQuoteID) as DocumentReference<RateQuote_Firestore>;

  const rateQuoteSnapshot = await rateQuoteRef.get();

  if (!rateQuoteSnapshot.exists) {
    return undefined;
  }
  return rateQuoteSnapshot.data();
};

export const getAffiliate = async (affiliateID: AffiliateID) => {
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .doc(affiliateID) as DocumentReference<Affiliate_Firestore>;

  const affiliateSnapshot = await affiliateRef.get();

  if (!affiliateSnapshot.exists) {
    return undefined;
  }
  return affiliateSnapshot.data();
};

export const getActivation = async (activationID: ActivationID) => {
  const activationRef = db
    .collection(Collection.Activation)
    .doc(activationID) as DocumentReference<Activation_Firestore>;

  const activationSnapshot = await activationRef.get();

  if (!activationSnapshot.exists) {
    return undefined;
  }
  return activationSnapshot.data();
};

export const reportTotalEarningsForAffiliate = async (userIdpID: UserIdpID) => {
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .where("userIdpID", "==", userIdpID) as Query<Affiliate_Firestore>;

  const affiliateCollectionItems = await affiliateRef.get();

  if (affiliateCollectionItems.empty) {
    throw Error(`Affiliate with userIdpID ${userIdpID} does not exist`);
  }
  const affiliate = affiliateCollectionItems.docs[0].data();
  const memoRef = db
    .collection(Collection.Memo)
    .where("affiliateID", "==", affiliate.id) as Query<Memo_Firestore>;

  const memoCollectionItems = await memoRef.get();

  if (memoCollectionItems.empty) {
    return 0;
  } else {
    return memoCollectionItems.docs
      .map((doc) => {
        const data = doc.data();
        return data;
      })
      .reduce((acc, curr) => {
        return acc + curr.amount;
      }, 0);
  }
};

export const getAffiliateByUserIdpID = async (userIdpID: UserIdpID | null) => {
  if (userIdpID === null) {
    throw new Error(`No userIdpID provided`);
  }
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .where("userIdpID", "==", userIdpID) as Query<Affiliate_Firestore>;

  const affiliateSnapshot = await affiliateRef.get();

  if (affiliateSnapshot.empty) {
    throw new Error(`No affiliate found for userIdpID: ${userIdpID}`);
  }
  return affiliateSnapshot.docs[0].data();
};

// Does NOT throw if no affiliate found
export const getAffiliateByUserID = async (userID: UserID) => {
  const claimerUserIDField: keyof Affiliate_Firestore = "userID";
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .where(claimerUserIDField, "==", userID) as Query<Affiliate_Firestore>;

  const affiliateSnapshot = await affiliateRef.get();

  if (affiliateSnapshot.empty) {
    return undefined;
  }
  return affiliateSnapshot.docs[0].data();
};
