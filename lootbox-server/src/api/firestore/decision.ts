import { DocumentReference, Query } from "firebase-admin/firestore";
import {
  DecisionAdApiBetaV2Payload,
  AdServed,
  OfferInTournamentStatus,
  DecisionAdAirdropV1Payload,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import {
  AdEventAction,
  AdID,
  AdSetID,
  AdSetInTournamentStatus,
  AdvertiserID,
  AffiliateID,
  CampaignID,
  ClaimID,
  Claim_Firestore,
  Collection,
  FlightID,
  LootboxID,
  MeasurementPartnerType,
  OfferID,
  Offer_Firestore,
  Placement,
  QuestionAnswer_Firestore,
  SessionID,
  TournamentID,
  Tournament_Firestore,
  UserID,
} from "@wormgraph/helpers";
import { AdSet_Firestore, Ad_Firestore } from "./ad.types";
import { Advertiser_Firestore } from "./advertiser.type";
import { craftAffiliateAttributionUrl } from "../mmp/mmp";
import { getOffer } from "./offer";
import { manifest } from "../../manifest";
import { AdFlight_Firestore, UserIdpID } from "@wormgraph/helpers";
import { AdOfferQuestion } from "../../graphql/generated/types";
import { getLootbox } from "./lootbox";
import { getTournamentById } from "./tournament";
import { getAd, getAdSet } from "./ad";
import { getClaimById } from "./referral";

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

  const [tournamentSnapshot, claim] = await Promise.all([
    tournamentRef.get(),
    getClaimById(claimID as ClaimID),
  ]);
  if (!tournamentSnapshot.exists) {
    throw Error(
      `Tournament with id ${tournamentID} does not exist in the database`
    );
  }
  const tournament = tournamentSnapshot.data();
  if (tournament === undefined) {
    throw Error(`Tournament with id ${tournamentID} could not be compiled`);
  }
  if (!claim) {
    throw Error(`Claim with id ${claimID} does not exist in the database`);
  }

  // filter out to get only the ads that fit this placement
  const adSetIDs = Object.entries(tournament?.offers || []).reduce<AdSetID[]>(
    (acc, curr) => {
      const adSets = curr[1].adSets;
      const activeAdSetIds = Object.keys(adSets).filter((key) => {
        return adSets[key] === AdSetInTournamentStatus.Active;
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

  if (!matchingAdSet.adIDs || matchingAdSet.adIDs.length === 0) {
    throw Error(
      `No ads found for adSet ${matchingAdSet.id} in tournament ${tournamentID}`
    );
  }

  // retrieve the right ad from this AdSet based on how we want to serve it
  // this is where we might look at frequency capping, etc.
  const { ad, advertiser } = await decideAdFromAdSetForUser({
    userID: userID as UserID,
    offerID: matchingOfferID,
    adSetID: matchingAdSet.id,
    adIDs: matchingAdSet.adIDs,
    advertiserID: matchingAdSet.advertiserID,
  });

  let flight: AdFlight_Firestore | undefined;
  const existingFlightsForSession = await getExistingFlightsForSession(
    sessionID as SessionID
  );
  if (existingFlightsForSession.length === 0) {
    // create a flight to track this unique serving of this ad to this person at this time & place in the universe
    flight = await createFlight({
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
      referrerID: claim.referrerId || undefined,
    });
  } else {
    flight = existingFlightsForSession[0];
  }

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
    clickDestination: flight.clickUrl,
    creative: {
      adID: ad.creative.adID,
      advertiserID: ad.creative.advertiserID,
      creativeType: ad.creative.creativeType,
      creativeLinks: ad.creative.creativeLinks,
      callToAction: ad.creative.callToAction,
      thumbnail: ad.creative.thumbnail,
      infographicLink: ad.creative.infographicLink,
      aspectRatio: ad.creative.aspectRatio,
      themeColor: ad.creative.themeColor,
    },
  };
};

export const decideAirdropAdToServe = async (
  { lootboxID, placement, sessionID }: DecisionAdAirdropV1Payload,
  userID: UserIdpID
): Promise<AdServed> => {
  console.log(`Milestone 1 ----- lootboxID ${lootboxID}`);
  const lootbox = await getLootbox(lootboxID as LootboxID);
  console.log(`Milestone 2 ----- lootbox ${lootbox?.id}`);
  if (!lootbox || !lootbox.airdropMetadata) {
    throw Error(
      `Lootbox with id ${lootboxID} and airdropMetadat does not exist in the database`
    );
  }
  const { tournamentID } = lootbox;
  console.log(`Milestone 3 ----- tournamentID ${tournamentID}`);
  const tournament = await getTournamentById(tournamentID as TournamentID);
  if (!tournament) {
    throw Error(
      `Tournament with id ${tournamentID} does not exist in the database`
    );
  }
  const { offerID } = lootbox.airdropMetadata || {};
  console.log(`Milestone 4 ----- offerID ${offerID}`);
  const adSets = (tournament.offers || {})[offerID]?.adSets || {};
  console.log(`Milestone 5 ----- adSets ${JSON.stringify(adSets)}`);
  const adSetIDs = Object.keys(adSets).reduce((acc, curr) => {
    console.log(`curr = ${curr}`);
    const relevantAdSets: AdSetID[] = [];
    if (adSets[curr] === AdSetInTournamentStatus.Active) {
      relevantAdSets.push(curr as AdSetID);
    }
    return [...acc, ...relevantAdSets];
  }, [] as AdSetID[]);
  console.log(`Milestone 6 ----- adSetIDs ${JSON.stringify(adSetIDs)}}`);
  const adSetsData = (
    await Promise.all(
      adSetIDs.map((asid) => {
        return getAdSet(asid);
      })
    )
  ).filter((ads) => ads) as AdSet_Firestore[];
  console.log(`Milestone 7 ----- ${adSetsData.length}`);
  const matchingAdSetsForPlacement = adSetsData
    .filter((adst) => {
      return adst.placement === placement;
    })
    .filter((adst) => adst.adIDs[0])
    .map((adset) => {
      const aid = adset.adIDs[0] || "";
      return {
        adID: aid as AdID,
        adSetID: adset.id,
      };
    });
  console.log(`Milestone 8 ----- ${matchingAdSetsForPlacement.length}`);
  const match = matchingAdSetsForPlacement[0];
  console.log(`Milestone 9 ----- ${match.adID} & ${match.adSetID}}`);
  const defaultAirdropAdSet = adSetsData.find((a) => a.id === match.adSetID);
  console.log(
    `Milestone 10 ----- defaultAirdropAdSet = ${defaultAirdropAdSet?.id}`
  );
  console.log(`

  !defaultAirdropAdSet = ${!defaultAirdropAdSet}
  || !match = ${!match}
  || !match.adID  = ${!match.adID}
  || !match.adSetID = ${!match.adSetID}
  
  `);
  if (!defaultAirdropAdSet || !match || !match.adID || !match.adSetID) {
    throw Error(
      `No default ad found for lootbox ${lootboxID} with offer ${lootbox.airdropMetadata.offerID} and placement ${placement}`
    );
  }
  console.log(`Milestone 11 -----`);
  const [ad, claims] = await Promise.all([
    getAd(match.adID),
    getClaimsOfUserInTournament(userID as unknown as UserID, tournament.id),
  ]);
  console.log(`Milestone 12 -----`);
  const earliestClaim = claims.sort((a, b) => {
    return a.timestamps.createdAt - b.timestamps.createdAt;
  })[0];
  console.log(`Milestone 13 -----`);
  if (!ad) {
    throw Error(
      `No ad found for adSet ${match.adSetID} in tournament ${tournamentID}`
    );
  }
  console.log(`Milestone 14 -----`);
  const flight = await createFlight({
    userID: userID as unknown as UserID,
    adID: match.adID,
    adSetID: defaultAirdropAdSet.id,
    offerID: offerID,
    placement: ad.placement,
    tournamentID: tournament.id,
    organizerID: tournament.organizer,
    promoterID: earliestClaim?.promoterId,
    claimID: earliestClaim?.id as ClaimID,
    sessionId: sessionID as SessionID,
    referrerID: earliestClaim?.referrerId || undefined,
  });
  console.log(`Milestone 15 -----`);
  const info = {
    adID: match.adID,
    adSetID: defaultAirdropAdSet.id,
    advertiserID: defaultAirdropAdSet.advertiserID,
    advertiserName: lootbox.airdropMetadata?.advertiserName || "",
    clickDestination: flight.clickUrl,
    creative: ad.creative,
    flightID: flight.id,
    offerID: offerID,
    pixelUrl: flight.pixelUrl,
    placement: ad.placement,
    inheritedClaim: {
      claimID: earliestClaim?.id,
      promoterID: earliestClaim?.promoterId,
      referrerID: earliestClaim?.referrerId,
      tournamentID: earliestClaim?.tournamentId,
    },
  };
  return info;
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
  referrerID?: UserID;
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
  let flightSchema: Omit<AdFlight_Firestore, "clickUrl" | "destinationUrl"> = {
    id: flightRef.id as FlightID,
    userID: payload.userID,
    adID: payload.adID,
    adSetID: payload.adSetID,
    offerID: payload.offerID,
    placement: payload.placement,
    // campaignID: payload.campaignID,
    advertiserID: offer.advertiserID,
    tournamentID: payload.tournamentID,
    sessionID: payload.sessionId,
    claimID: payload.claimID,
    organizerID: payload.organizerID,
    promoterID: payload.promoterID,
    referrerID: payload.referrerID,
    mmp: offer.mmp,
    affiliateBaseLink: offer.affiliateBaseLink,
    timestamp: new Date().getTime() / 1000,
    pixelUrl: generatePixelUrl(flightRef.id as FlightID),
  };
  const { clickUrl, destinationUrl } = generateClickUrl(flightSchema);
  const flightObj: AdFlight_Firestore = {
    ...flightSchema,
    clickUrl,
    destinationUrl,
  };
  await flightRef.set(flightObj);
  return flightObj;
};

export const generatePixelUrl = (flightID: FlightID): string => {
  const clickUrl = `${manifest.storage.buckets.pixel.accessUrl}/${manifest.storage.buckets.pixel.files.adTrackingPixel}?flightID=${flightID}`;
  return clickUrl;
};

export const generateClickUrl = (
  flight: Omit<AdFlight_Firestore, "clickUrl" | "destinationUrl">
): {
  clickUrl: string;
  destinationUrl: string;
} => {
  const destinationUrl = craftAffiliateAttributionUrl(flight);

  const clickUrl = `${manifest.storage.buckets.redirectPage.accessUrl}/${
    manifest.storage.buckets.redirectPage.files.page
  }?flightID=${flight.id}&destination=${encodeURIComponent(
    destinationUrl
  )}&eventAction=${AdEventAction.Click}`;

  return {
    clickUrl,
    destinationUrl,
  };
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
  if (adSetIDs.length === 0) return [];
  const adSetsRef = db
    .collection(Collection.AdSet)
    .where("id", "in", adSetIDs) as Query<AdSet_Firestore>;

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
}): Promise<{
  offerID: OfferID;
  adSet: AdSet_Firestore;
}> => {
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
    .where("id", "in", adIDs) as Query<Ad_Firestore>;
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

export const getExistingFlightsForSession = async (
  sessionID: SessionID
): Promise<AdFlight_Firestore[]> => {
  const flightRef = db
    .collection(Collection.Flight)
    .where("sessionID", "==", sessionID) as Query<AdFlight_Firestore>;

  const flightCollectionItems = await flightRef.get();

  if (flightCollectionItems.empty) {
    return [];
  } else {
    return flightCollectionItems.docs.map((doc) => {
      return doc.data();
    });
  }
};

export const getQuestionsForAd = async (
  ad: AdServed
): Promise<AdOfferQuestion[]> => {
  const questionRef = db
    .collection(Collection.QuestionAnswer)
    .where(
      "metadata.offerID",
      "==",
      ad.offerID
    ) as Query<QuestionAnswer_Firestore>;

  const questionCollectionItems = await questionRef.get();

  if (questionCollectionItems.empty) {
    return [];
  }
  const questions = questionCollectionItems.docs.map((doc) => {
    return doc.data();
  });
  return questions
    .filter((q) => !q.answer && q.isOriginal)
    .map((q) => ({
      id: q.id,
      batch: q.batch,
      order: q.order,
      question: q.question,
      type: q.type,
      mandatory: q.mandatory || false,
      options: q.options || "",
    }));
};

export const getClaimsOfUserInTournament = async (userID, tournamentID) => {
  const claimsRef = db
    .collection(Collection.Claim)
    .where("claimerUserId", "==", userID)
    .where("tournamentID", "==", tournamentID) as Query<Claim_Firestore>;

  const claimsCollectionItems = await claimsRef.get();

  if (claimsCollectionItems.empty) {
    return [];
  } else {
    return claimsCollectionItems.docs.map((doc) => {
      return doc.data();
    });
  }
};
