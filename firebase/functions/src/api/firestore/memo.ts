import {
    AdEvent_Firestore,
    Collection,
    Memo_Firestore,
    Activation_Firestore,
    FlightID,
    TournamentID,
    AffiliateID,
    ActivationID,
    Offer_Firestore,
    RateQuote_Firestore,
    RateQuoteStatus,
    AffiliateType,
    OfferID,
    AdvertiserID,
    AdEventID,
    MMPActivationAlias,
    MeasurementPartnerType,
    MemoID,
    Tournament_Firestore,
} from "@wormgraph/helpers";
import { DocumentReference, Query, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { AdFlight_Firestore } from "@wormgraph/helpers";

export const generateMemoBills = async (adEvent: AdEvent_Firestore): Promise<Memo_Firestore[]> => {
    if (adEvent.activationID) {
        const activationRef = db
            .collection(Collection.Activation)
            .doc(adEvent.activationID) as DocumentReference<Activation_Firestore>;
        const activationSnapshot = await activationRef.get();

        if (!activationSnapshot.exists) {
            return [];
        }
        const activation = activationSnapshot.data();
        if (!activation) {
            return [];
        }

        // if there is a flightID, we will be able to get the promoter
        // all 3 parties will get a memo (promoter, organizer, lootbox)
        if (adEvent.flightId) {
            try {
                const memos = await handleWithFlightId(adEvent.flightId, activation, adEvent.id);
                return memos;
            } catch (e) {
                console.log(e);
                console.log("Attempting next fallback...");
            }
        }

        // if there is no flightID, then we fall back to the tournamentID + affiliateID + activationID
        // in most cases, all 3 parties will get a memo (promoter, organizer, lootbox). but it requiires the affiliateID to be a promoter
        if (
            adEvent.affiliateAttribution?.tournamentID &&
            adEvent.affiliateAttribution.promoterID &&
            adEvent.activationID
        ) {
            try {
                const memos = await handleWithTournamentAffiliateActivation(
                    {
                        tournamentID: adEvent.affiliateAttribution.tournamentID,
                        promoterID: adEvent.affiliateAttribution.promoterID,
                        activation: activation,
                    },
                    adEvent.id
                );
                return memos;
            } catch (e) {
                console.log(e);
                console.log("Attempting next fallback...");
            }
        }

        // if there is only a tournamentID + activationID
        // then only 2 parties will get a memo (organizer, lootbox)
        if (adEvent.affiliateAttribution?.tournamentID && adEvent.activationID) {
            try {
                const memos = await handleWithTournamentActivation(
                    {
                        tournamentID: adEvent.affiliateAttribution.tournamentID,
                        activation: activation,
                    },
                    adEvent.id
                );
                return memos;
            } catch (e) {
                console.log(e);
                console.log("Attempting next fallback...");
            }
        }

        // but if there is only activationID
        // only lootbox will get a memo
        if (adEvent.activationID) {
            const memos = await handleWithOnlyActivationId(activation, adEvent.id);
            return memos;
        }
    }
    return [];
};

export const handleWithFlightId = async (
    flightID: FlightID,
    activation: Activation_Firestore,
    adEventID: AdEventID
): Promise<Memo_Firestore[]> => {
    // get the flight
    const flightRef = db.collection(Collection.Flight).doc(flightID) as DocumentReference<AdFlight_Firestore>;
    const flightSnapshot = await flightRef.get();
    if (!flightSnapshot.exists) {
        throw Error(`No flight found for flightID=${flightID}`);
    }
    const flight = flightSnapshot.data();
    if (!flight) {
        throw Error(`FlightID=${flightID} was undefined`);
    }
    // get the offer
    const offerRef = db.collection(Collection.Offer).doc(flight.offerID) as DocumentReference<Offer_Firestore>;
    const offerSnapshot = await offerRef.get();
    if (!offerSnapshot.exists) {
        throw Error(`No offer found for offerID=${flight.offerID}`);
    }
    const offer = offerSnapshot.data();
    if (!offer) {
        throw Error(`offerID=${flight.offerID} was undefined`);
    }
    // get the matching rate quotes
    const promoterRateQuotes: RateQuote_Firestore[] = [];
    const organizerRateQuotes: RateQuote_Firestore[] = [];
    // get the promoters rate quote
    if (flight.promoterID && flight.tournamentID) {
        const rateQuotes = await getMatchingRateQuotesWithFullAttribution({
            affiliateID: flight.promoterID,
            activationID: activation.id,
            tournamentID: flight.tournamentID,
        });
        rateQuotes.forEach((rq) => promoterRateQuotes.push(rq));
    }
    // get the organizers rate quote
    if (flight.organizerID && flight.tournamentID) {
        const rateQuotes = await getMatchingRateQuotesWithFullAttribution({
            affiliateID: flight.organizerID,
            activationID: activation.id,
            tournamentID: flight.tournamentID,
        });
        rateQuotes.forEach((rq) => organizerRateQuotes.push(rq));
    }
    const masterPricing = activation.pricing;
    const promoterPricing = promoterRateQuotes[0].pricing || 0;
    const organizerPricing = organizerRateQuotes[0].pricing || 0;
    if (promoterPricing > masterPricing) {
        throw Error("Promoter pricing cannot be greater than master pricing");
    }
    if (organizerPricing > masterPricing) {
        throw Error("Organizer pricing cannot be greater than master pricing");
    }
    if (promoterPricing > organizerPricing) {
        throw Error("Promoter pricing cannot be greater than organizer pricing");
    }
    const commonMemoFields = {
        offerID: flight.offerID,
        advertiserID: offer.advertiserID,
        adEventID: adEventID,
        activationID: activation.id,
        mmpAlias: activation.mmpAlias,
        mmp: offer.mmp,
        flightID: flight.id,
        tournamentID: flight.tournamentID,
        note: `${activation.name} in Offer "${offer.title}" in TournamentID=${flight.tournamentID}`,
    };
    // calculate each partys revenue share
    let promoterRevenue = 0;
    let organizerRevenue = 0;
    let lootboxRevenue = masterPricing;
    const memosToCreate: CreateMemoBillArgs[] = [];
    if (flight.promoterID) {
        // calculate promoter share
        promoterRevenue = promoterPricing;
        memosToCreate.push({
            ...commonMemoFields,
            affiliateID: flight.promoterID,
            affiliateType: AffiliateType.Promoter,
            amount: promoterRevenue,
        });
    }
    if (flight.organizerID) {
        // calculate organizer share
        organizerRevenue = organizerPricing - promoterRevenue;
        memosToCreate.push({
            ...commonMemoFields,
            affiliateID: flight.organizerID,
            affiliateType: AffiliateType.Organizer,
            amount: organizerRevenue,
        });
    }
    // calculate lootbox share
    lootboxRevenue = masterPricing - organizerRevenue - promoterRevenue;
    memosToCreate.push({
        ...commonMemoFields,
        affiliateID: "LOOTBOX" as AffiliateID,
        affiliateType: AffiliateType.Lootbox,
        amount: lootboxRevenue,
    });
    // create the actual memos
    const memos = await Promise.all(memosToCreate.map((m) => createMemoBill(m)));
    return memos;
};
export const handleWithTournamentAffiliateActivation = async (
    {
        tournamentID,
        promoterID,
        activation,
    }: {
        tournamentID: TournamentID;
        promoterID: AffiliateID;
        activation: Activation_Firestore;
    },
    adEventID: AdEventID
): Promise<Memo_Firestore[]> => {
    // get the touranment
    const tournamentRef = db
        .collection(Collection.Tournament)
        .doc(tournamentID) as DocumentReference<Tournament_Firestore>;
    const tournamentSnapshot = await tournamentRef.get();
    if (!tournamentSnapshot.exists) {
        throw Error(`No tournament found for tournamentID=${tournamentID}`);
    }
    const tournament = tournamentSnapshot.data() as Tournament_Firestore;
    if (!tournament) {
        throw Error(`tournamentID=${tournament} was undefined`);
    }
    // get the offer
    const offerRef = db.collection(Collection.Offer).doc(activation.offerID) as DocumentReference<Offer_Firestore>;
    const offerSnapshot = await offerRef.get();
    if (!offerSnapshot.exists) {
        throw Error(`No offer found for offerID=${activation.offerID}`);
    }
    const offer = offerSnapshot.data();
    if (!offer) {
        throw Error(`offerID=${activation.offerID} was undefined`);
    }
    // get the matching rate quotes
    const promoterRateQuotes: RateQuote_Firestore[] = [];
    const organizerRateQuotes: RateQuote_Firestore[] = [];
    // get the promoters rate quote
    if (promoterID && tournamentID) {
        const rateQuotes = await getMatchingRateQuotesWithFullAttribution({
            affiliateID: promoterID,
            activationID: activation.id,
            tournamentID: tournamentID,
        });
        rateQuotes.forEach((rq) => promoterRateQuotes.push(rq));
    }
    // get the organizers rate quote
    if (tournament.organizer && tournamentID) {
        const rateQuotes = await getMatchingRateQuotesWithFullAttribution({
            affiliateID: tournament.organizer,
            activationID: activation.id,
            tournamentID: tournamentID,
        });
        rateQuotes.forEach((rq) => organizerRateQuotes.push(rq));
    }
    const masterPricing = activation.pricing;
    const promoterPricing = promoterRateQuotes[0].pricing || 0;
    const organizerPricing = organizerRateQuotes[0].pricing || 0;
    if (promoterPricing > masterPricing) {
        throw Error("Promoter pricing cannot be greater than master pricing");
    }
    if (organizerPricing > masterPricing) {
        throw Error("Organizer pricing cannot be greater than master pricing");
    }
    if (promoterPricing > organizerPricing) {
        throw Error("Promoter pricing cannot be greater than organizer pricing");
    }
    const commonMemoFields = {
        offerID: activation.offerID,
        advertiserID: offer.advertiserID,
        adEventID: adEventID,
        activationID: activation.id,
        mmpAlias: activation.mmpAlias,
        mmp: offer.mmp,
        tournamentID: tournamentID,
        note: `${activation.name} in Offer "${offer.title}" in TournamentID=${tournamentID}`,
    };
    // calculate each partys revenue share
    let promoterRevenue = 0;
    let organizerRevenue = 0;
    let lootboxRevenue = masterPricing;
    const memosToCreate: CreateMemoBillArgs[] = [];
    if (promoterID) {
        // calculate promoter share
        promoterRevenue = promoterPricing;
        memosToCreate.push({
            ...commonMemoFields,
            affiliateID: promoterID,
            affiliateType: AffiliateType.Promoter,
            amount: promoterRevenue,
        });
    }
    if (tournament.organizer) {
        // calculate organizer share
        organizerRevenue = organizerPricing - promoterRevenue;
        memosToCreate.push({
            ...commonMemoFields,
            affiliateID: tournament.organizer,
            affiliateType: AffiliateType.Organizer,
            amount: organizerRevenue,
        });
    }
    // calculate lootbox share
    lootboxRevenue = masterPricing - organizerRevenue - promoterRevenue;
    memosToCreate.push({
        ...commonMemoFields,
        affiliateID: "LOOTBOX" as AffiliateID,
        affiliateType: AffiliateType.Lootbox,
        amount: lootboxRevenue,
    });
    // create the actual memos
    const memos = await Promise.all(memosToCreate.map((m) => createMemoBill(m)));
    return memos;
};
export const handleWithTournamentActivation = async (
    {
        tournamentID,
        activation,
    }: {
        tournamentID: TournamentID;
        activation: Activation_Firestore;
    },
    adEventID: AdEventID
): Promise<Memo_Firestore[]> => {
    // get the touranment
    const tournamentRef = db
        .collection(Collection.Tournament)
        .doc(tournamentID) as DocumentReference<Tournament_Firestore>;
    const tournamentSnapshot = await tournamentRef.get();
    if (!tournamentSnapshot.exists) {
        throw Error(`No tournament found for tournamentID=${tournamentID}`);
    }
    const tournament = tournamentSnapshot.data() as Tournament_Firestore;
    if (!tournament) {
        throw Error(`tournamentID=${tournament} was undefined`);
    }
    // get the offer
    const offerRef = db.collection(Collection.Offer).doc(activation.offerID) as DocumentReference<Offer_Firestore>;
    const offerSnapshot = await offerRef.get();
    if (!offerSnapshot.exists) {
        throw Error(`No offer found for offerID=${activation.offerID}`);
    }
    const offer = offerSnapshot.data();
    if (!offer) {
        throw Error(`offerID=${activation.offerID} was undefined`);
    }
    // get the matching rate quotes
    const organizerRateQuotes: RateQuote_Firestore[] = [];
    // get the organizers rate quote
    if (tournament.organizer && tournamentID) {
        const rateQuotes = await getMatchingRateQuotesWithFullAttribution({
            affiliateID: tournament.organizer,
            activationID: activation.id,
            tournamentID: tournamentID,
        });
        rateQuotes.forEach((rq) => organizerRateQuotes.push(rq));
    }
    const masterPricing = activation.pricing;
    const organizerPricing = organizerRateQuotes[0].pricing || 0;
    if (organizerPricing > masterPricing) {
        throw Error("Organizer pricing cannot be greater than master pricing");
    }
    const commonMemoFields = {
        offerID: activation.offerID,
        advertiserID: offer.advertiserID,
        adEventID: adEventID,
        activationID: activation.id,
        mmpAlias: activation.mmpAlias,
        mmp: offer.mmp,
        tournamentID: tournamentID,
        note: `${activation.name} in Offer "${offer.title}" in TournamentID=${tournamentID}`,
    };
    // calculate each partys revenue share
    let organizerRevenue = 0;
    let lootboxRevenue = masterPricing;
    const memosToCreate: CreateMemoBillArgs[] = [];
    if (tournament.organizer) {
        // calculate organizer share
        organizerRevenue = organizerPricing;
        memosToCreate.push({
            ...commonMemoFields,
            affiliateID: tournament.organizer,
            affiliateType: AffiliateType.Organizer,
            amount: organizerRevenue,
        });
    }
    // calculate lootbox share
    lootboxRevenue = masterPricing - organizerRevenue;
    memosToCreate.push({
        ...commonMemoFields,
        affiliateID: "LOOTBOX" as AffiliateID,
        affiliateType: AffiliateType.Lootbox,
        amount: lootboxRevenue,
    });
    // create the actual memos
    const memos = await Promise.all(memosToCreate.map((m) => createMemoBill(m)));
    return memos;
};
export const handleWithOnlyActivationId = async (
    activation: Activation_Firestore,
    adEventID: AdEventID
): Promise<Memo_Firestore[]> => {
    // get the offer
    const offerRef = db.collection(Collection.Offer).doc(activation.offerID) as DocumentReference<Offer_Firestore>;
    const offerSnapshot = await offerRef.get();
    if (!offerSnapshot.exists) {
        throw Error(`No offer found for offerID=${activation.offerID}`);
    }
    const offer = offerSnapshot.data();
    if (!offer) {
        throw Error(`offerID=${activation.offerID} was undefined`);
    }
    const masterPricing = activation.pricing;
    const commonMemoFields = {
        offerID: activation.offerID,
        advertiserID: offer.advertiserID,
        adEventID: adEventID,
        activationID: activation.id,
        mmpAlias: activation.mmpAlias,
        mmp: offer.mmp,
        note: `${activation.name} in Offer "${offer.title}" in no known tournament`,
    };
    const memo = await createMemoBill({
        ...commonMemoFields,
        affiliateID: "LOOTBOX" as AffiliateID,
        affiliateType: AffiliateType.Lootbox,
        amount: masterPricing,
    });
    return [memo];
};

export const getMatchingRateQuotesWithFullAttribution = async ({
    affiliateID,
    activationID,
    tournamentID,
}: {
    affiliateID: AffiliateID;
    activationID: ActivationID;
    tournamentID: TournamentID;
}): Promise<RateQuote_Firestore[]> => {
    const rateQuoteRef = db
        .collection(Collection.RateQuote)
        .where("tournamentID", "==", tournamentID)
        .where("affiliateID", "==", affiliateID)
        .where("activationID", "==", activationID)
        .where("status", "==", status) as Query<RateQuote_Firestore>;
    const rateQuoteCollectionItems = await rateQuoteRef.get();
    if (rateQuoteCollectionItems.empty) {
        return [];
    }
    const matchingRateQuotes = rateQuoteCollectionItems.docs.map((doc) => {
        return doc.data();
    });
    return matchingRateQuotes;
};

interface CreateMemoBillArgs {
    affiliateID: AffiliateID;
    affiliateType: AffiliateType;
    offerID: OfferID;
    advertiserID: AdvertiserID;
    adEventID: AdEventID;
    activationID: ActivationID;
    mmpAlias: MMPActivationAlias;
    mmp: MeasurementPartnerType;
    flightID?: FlightID;
    tournamentID?: TournamentID;
    amount: number;
    note: string;
}
export const createMemoBill = async (payload: CreateMemoBillArgs): Promise<Memo_Firestore> => {
    const memoRef = db.collection(Collection.Memo).doc() as DocumentReference<Memo_Firestore>;
    const memoObj: Memo_Firestore = {
        ...payload,
        id: memoRef.id as MemoID,
        timestamp: Timestamp.now().toMillis(),
    };
    await memoRef.set(memoObj);
    return memoObj;
};
