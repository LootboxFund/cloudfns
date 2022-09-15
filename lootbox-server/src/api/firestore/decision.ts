import { DocumentReference, Query } from "firebase-admin/firestore";
import {
  DecisionAdApiBetaV2Payload,
  AdServed,
  OfferInTournamentStatus,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import { Tournament_Firestore } from "./tournament.types";
import {
  AdFlight_Firestore,
  AdID,
  AdSetID,
  AdvertiserID,
  AffiliateID,
  CampaignID,
  ClaimID,
  Collection,
  FlightID,
  OfferID,
  Placement,
  SessionID,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
import { Offer_Firestore } from "./offer.type";
import { AdSet_Firestore, Ad_Firestore } from "./ad.types";
import { Advertiser_Firestore } from "./advertiser.type";

const env = process.env.NODE_ENV || "development";

export const decideAdToServe = async ({
  placement,
  tournamentID,
  userID,
  sessionID,
  promoterID,
  claimID,
}: DecisionAdApiBetaV2Payload): Promise<AdServed> => {
  // decide which ad to serve base on factors
  // get the tournament info so we can see the offers & ads
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID) as DocumentReference<Tournament_Firestore>;
  const tournamentSnapshot = await tournamentRef.get();
  if (!tournamentSnapshot.exists) {
    throw Error(
      `Tournament with id ${tournamentID} does not exist in the database`
    );
  }
  const tournament = tournamentSnapshot.data();
  if (tournament === undefined) {
    throw Error(`Tournament with id ${tournamentID} could not be compiled`);
  }

  // filter out to get only the ads that fit this placement
  const adSetIDs = Object.entries(tournament?.offers || []).reduce<AdSetID[]>(
    (acc, curr) => {
      const adSets = curr[1].adSets;
      const activeAdSetIds = Object.keys(adSets).filter((key) => {
        return adSets[key] === OfferInTournamentStatus.Active;
      }) as AdSetID[];
      return [...acc, ...activeAdSetIds];
    },
    []
  );
  const matchingAdSetsForPlacement = await getMatchingAdSetsForPlacement({
    placement,
    adSetIDs,
  });

  // filter out to only get the relevant offers
  const offerIDs = Object.keys(tournament?.offers || {}) as OfferID[];
  const matchingOfferIDs = await matchTournamentOffersToUser({
    userID: userID as UserID,
    offerIDs,
  });
  // grab the first dual match in order (adSet placement --> offer)
  // if no relevant offers, then return an irrelevant ad instead of nothing
  // or return an ad to gain social media followers
  const { offerID: matchingOfferID, adSet: matchingAdSet } =
    await matchUserToOfferAndAdSetBasedOnTargetingParams({
      userID: userID as UserID,
      offerIDs: matchingOfferIDs,
      adSets: matchingAdSetsForPlacement,
    });

  // retrieve the right ad from this AdSet based on how we want to serve it
  // this is where we might look at frequency capping, etc.
  const { ad, advertiser } = await decideAdFromAdSetForUser({
    userID: userID as UserID,
    offerID: matchingOfferID,
    adSetID: matchingAdSet.id,
    adIDs: matchingAdSet.adIDs,
    advertiserID: matchingAdSet.advertiserID,
  });

  // create a flight to track this unique serving of this ad to this person at this time & place in the universe
  const flight = await createFlight({
    userID: userID as UserID,
    adID: ad.id,
    adSetID: matchingAdSet.id,
    offerID: matchingOfferID,
    placement: matchingAdSet.placement,
    tournamentID: tournament.id,
    organizerID: tournament.organizer,
    promoterID: promoterID as AffiliateID,
    claimID: claimID as ClaimID,
    sessionId: sessionID as SessionID,
  });

  // return the ad to serve
  return {
    adID: ad.id,
    adSetID: matchingAdSet.id,
    advertiserID: ad.advertiserID,
    advertiserName: advertiser.name,
    offerID: matchingOfferID,
    flightID: flight.id,
    placement: matchingAdSet.placement,
    pixelUrl: flight.pixelUrl,
    clickDestination: flight.pixelUrl,
    creative: {
      adID: ad.creative.adID,
      advertiserID: ad.creative.advertiserID,
      creativeType: ad.creative.creativeType,
      creativeLinks: ad.creative.creativeLinks,
      callToActionText: ad.creative.callToActionText,
      thumbnail: ad.creative.thumbnail,
      infographicLink: ad.creative.infographicLink,
      creativeAspectRatio: ad.creative.creativeAspectRatio,
      themeColor: ad.creative.themeColor,
    },
  };
};

export interface CreateFlightArgs {
  userID: UserID;
  adID: AdID;
  adSetID: AdSetID;
  offerID: OfferID;
  placement: Placement;
  claimID?: ClaimID;
  campaignID?: CampaignID;
  tournamentID?: TournamentID;
  organizerID?: AffiliateID;
  promoterID?: AffiliateID;
  sessionId: SessionID;
}
export const createFlight = async (
  payload: CreateFlightArgs
): Promise<AdFlight_Firestore> => {
  const flightRef = db
    .collection(Collection.Flight)
    .doc() as DocumentReference<AdFlight_Firestore>;
  // retreive the offer to get the affiliateBaseLink
  const offerRef = db
    .collection(Collection.Offer)
    .doc(payload.offerID) as DocumentReference<Offer_Firestore>;
  const offerSnapshot = await offerRef.get();

  if (!offerSnapshot.exists) {
    throw Error(`No offer=${payload.offerID} found for this flight`);
  }
  const offer = offerSnapshot.data();
  if (offer === undefined) {
    throw Error(`Offer=${payload.offerID} was undefined from firestore`);
  }

  // create the flight
  const flightSchema: AdFlight_Firestore = {
    id: flightRef.id as FlightID,
    userID: payload.userID,
    adID: payload.adID,
    adSetID: payload.adSetID,
    offerID: payload.offerID,
    placement: payload.placement,
    campaignID: payload.campaignID,
    tournamentID: payload.tournamentID,
    sessionID: payload.sessionId,
    claimID: payload.claimID,
    organizerID: payload.organizerID,
    promoterID: payload.promoterID,
    timestamp: new Date().getTime() / 1000,
    pixelUrl: generatePixelUrl(flightRef.id as FlightID),
    clickUrl: generateClickUrl({
      flightID: flightRef.id as FlightID,
      affiliateBaseLink: offer.affiliateBaseLink,
    }),
    destinationUrl: offer.affiliateBaseLink,
  };
  await flightRef.set(flightSchema);
  return flightSchema;
};

export const generatePixelUrl = (flightID: FlightID): string => {
  const clickUrl = `https://${env}.track.lootbox.fund/pixel.png?flightID=${flightID}`;
  return clickUrl;
};

export const generateClickUrl = ({
  flightID,
  affiliateBaseLink,
}: {
  flightID: FlightID;
  affiliateBaseLink: string;
}): string => {
  return `https://${env}.redirect.lootbox.fund/redirect.html?flightID=${flightID}&destination=${encodeURIComponent(
    affiliateBaseLink
  )}`;
};

/**
 * Based on the offerIDs in a tournament, we identify which ones are relevant to the user
 * Matching based on ad targeting tags on user+offer
 */
export const matchTournamentOffersToUser = async ({
  userID,
  offerIDs,
}: {
  userID: UserID;
  offerIDs: OfferID[];
}): Promise<OfferID[]> => {
  // get the tournament so that we can find its related offers
  // const offersRef = db
  //   .collection(Collection.Offer)
  //   .where("id", "in", offerIDs)
  //   .orderBy("timestamps.createdAt", "desc") as Query<Offer_Firestore>;

  // const offersCollectionItems = await offersRef.get();

  // if (offersCollectionItems.empty) {
  //   return [];
  // } else {
  //   return offersCollectionItems.docs
  //     .map((doc) => {
  //       const data = doc.data();
  //       return data;
  //     })
  //     .map((offer) => offer.id);
  // }

  return offerIDs;
};

/**
 * Simply retrieve the adSets from firestore based on the adSetIDs related to an offer
 * Then filter by placement
 * We do this because the tournament object only has the adSetID and not its placement info
 */
export const getMatchingAdSetsForPlacement = async ({
  placement,
  adSetIDs,
}: {
  placement: Placement;
  adSetIDs: AdSetID[];
}) => {
  const adSetsRef = db
    .collection(Collection.AdSet)
    .where("id", "in", adSetIDs)
    .orderBy("timestamps.createdAt", "desc") as Query<AdSet_Firestore>;

  const adSetsCollectionItems = await adSetsRef.get();

  if (adSetsCollectionItems.empty) {
    return [];
  } else {
    return adSetsCollectionItems.docs
      .map((doc) => {
        const data = doc.data();
        return data;
      })
      .filter((adSet) => adSet.placement === placement);
  }
};

/**
 * Here we can decide which adSets from which offers to serve the user
 * Input is a list of offers in the tournament + list of adSets in the tournament
 * Use the targeting tags on the user+offer+adSet to decide which adSet to serve
 */
export const matchUserToOfferAndAdSetBasedOnTargetingParams = async ({
  userID,
  offerIDs,
  adSets,
}: {
  userID: UserID;
  offerIDs: OfferID[];
  adSets: AdSet_Firestore[];
}): Promise<{ offerID: OfferID; adSet: AdSet_Firestore }> => {
  let matchingOfferID: OfferID | undefined;
  const matchingAdSet =
    adSets.find((adSet) => {
      return adSet.offerIDs.some((offerID) => {
        return offerIDs.find((oid) => {
          if (oid === offerID) {
            matchingOfferID = oid;
            return true;
          }
          return false;
        });
      });
    }) || adSets[0];
  if (!matchingOfferID) {
    throw Error("No matching offer found for ad set");
  }
  return {
    offerID: matchingOfferID,
    adSet: matchingAdSet,
  };
};

/**
 * Here we can determine things like frequency capping, etc.
 * If a user has already seen an ad for this same adset & offer, we can show them more diversity
 * Query the flights to get this info
 */
export const decideAdFromAdSetForUser = async ({
  userID,
  offerID,
  adSetID,
  adIDs,
  advertiserID,
}: {
  userID: UserID;
  offerID: OfferID;
  adSetID: AdSetID;
  adIDs: AdID[];
  advertiserID: AdvertiserID;
}): Promise<{
  ad: Ad_Firestore;
  advertiser: Advertiser_Firestore;
}> => {
  const adRef = db
    .collection(Collection.Ad)
    .where("id", "in", adIDs)
    .orderBy("timestamps.createdAt", "desc") as Query<Ad_Firestore>;
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;

  const [adCollectionItems, advertiserSnapshot] = await Promise.all([
    adRef.get(),
    advertiserRef.get(),
  ]);

  if (adCollectionItems.empty) {
    throw Error(`No ads found for adSet=${adSetID}`);
  }
  if (!advertiserSnapshot.exists) {
    throw Error(`No advertiser=${advertiserID} found`);
  }
  const advertiser = advertiserSnapshot.data() as Advertiser_Firestore;

  const ad = adCollectionItems.docs[0].data();
  return { ad, advertiser };
};
