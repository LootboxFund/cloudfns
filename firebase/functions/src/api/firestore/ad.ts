import { db } from "../firebase";
import { Ad, AdEventAction } from "../graphql/generated/types";
import { DocumentReference, Query } from "firebase-admin/firestore";

import {
    AdEvent_Firestore,
    AdFlight_Firestore,
    FlightID,
    AdID,
    Collection,
    SessionID,
    AdEventNonce,
    OfferID,
    Activation_Firestore,
} from "@wormgraph/helpers";

export const getAdById = async (id: AdID): Promise<Ad | undefined> => {
    const docRef = db.collection(Collection.Ad).doc(id) as DocumentReference<Ad>;

    const doc = await docRef.get();

    if (!doc.exists || !doc) {
        return undefined;
    } else {
        const adData = doc.data();
        return adData ? { ...adData, id: doc.id } : undefined;
    }
};

export const getFlightById = async (id: FlightID): Promise<AdFlight_Firestore> => {
    const docRef = db.collection(Collection.Flight).doc(id) as DocumentReference<AdFlight_Firestore>;

    const doc = await docRef.get();

    if (!doc.exists || !doc) {
        throw Error(`Flight ${id} does not exist`);
    }
    const flight = doc.data();
    if (!flight) {
        throw Error(`Flight ${id} was undefined`);
    }
    return flight;
};

// We are deprecating this because it was only used for ad views, but now that will be handled automatically via the baseline activations per offer
//
// interface CreateAdEventRequest {
//     action: AdEventAction;
//     nonce: AdEventNonce;
//     flight: AdFlight_Firestore;
//     timeElapsed?: number | null;
// }
// export const createAdEvent = async ({
//     action,
//     flight,
//     nonce,
//     timeElapsed,
// }: CreateAdEventRequest): Promise<AdEvent_Firestore> => {
//     const documentWithoutId: Omit<AdEvent_Firestore, "id"> = {
//         timestamp: Timestamp.now().toMillis(),
//         adID: flight.adID,
//         adSetID: flight.adSetID,
//         sessionID: flight.sessionID,
//         campaignID: flight.campaignID,
//         flightID: flight.id,
//         action: action,
//         claimID: flight.claimID,
//         offerID: flight.offerID,
//         advertiserID: flight.advertiserID,
//         nonce,
//         metadata: {
//             clickRedirectUrl: flight.clickUrl,
//             pixelUrl: flight.pixelUrl,
//             timeElapsed: timeElapsed || undefined,
//         },
//         affiliateAttribution: {
//             organizerID: flight.organizerID,
//             promoterID: flight.promoterID,
//         },
//     };

//     const adEventRef = db.collection(Collection.AdEvent).doc() as DocumentReference<AdEvent_Firestore>;

//     const documentWithId: AdEvent_Firestore = { ...documentWithoutId, id: adEventRef.id as AdEventID };

//     logger.log("about to make ad event  ", documentWithId);

//     await adEventRef.set(documentWithId);

//     return documentWithId;
// };

interface GetAdEventsBySessionIdOptions {
    actionType?: AdEventAction;
    limit?: number;
}
export const getAdEventsBySessionId = async (
    adId: AdID,
    sessionId: SessionID,
    options: GetAdEventsBySessionIdOptions
): Promise<AdEvent_Firestore[]> => {
    let collectionRef = db
        .collection(Collection.AdEvent)
        .where("sessionId", "==", sessionId) as Query<AdEvent_Firestore>;

    if (options?.actionType !== undefined) {
        collectionRef = collectionRef.where("action", "==", options?.actionType);
    }

    if (options?.limit !== undefined) {
        collectionRef = collectionRef.limit(options?.limit);
    }

    const snapshot = await collectionRef.get();

    if (snapshot.empty || snapshot.docs.length === 0) {
        return [];
    } else {
        return snapshot.docs.map((doc) => doc.data());
    }
};

interface UpdateAdCountsRequest {
    clicks?: number;
    uniqueClicks?: number;
    impressions?: number;
}
export const updateAdCounts = async (adId: AdID, request: UpdateAdCountsRequest): Promise<void> => {
    const adRef = db.collection(Collection.Ad).doc(adId) as DocumentReference<Ad>;

    await adRef.update(request);
};

export const getAdEventsByNonce = async (
    adId: AdID,
    nonce: AdEventNonce,
    limit?: number
): Promise<AdEvent_Firestore[]> => {
    let collectionRef = db.collection(Collection.AdEvent).where("nonce", "==", nonce) as Query<AdEvent_Firestore>;

    if (limit !== undefined) {
        collectionRef = collectionRef.limit(limit);
    }

    const snapshot = await collectionRef.get();

    if (snapshot.empty || snapshot.docs.length === 0) {
        return [];
    } else {
        return snapshot.docs.map((doc) => doc.data());
    }
};

export const listActivationsForOffer = async (offerID: OfferID): Promise<Activation_Firestore[]> => {
    const activationsRef = db
        .collection(Collection.Activation)
        .where("offerID", "==", offerID) as Query<Activation_Firestore>;

    const activationItems = await activationsRef.get();

    if (activationItems.empty) {
        return [];
    }

    const activeActivations = activationItems.docs.map((doc) => {
        const data = doc.data();
        // if you plan to modify this to only show active activations, then be sure to still keep any activation.isDefault = true
        // users might deactivate the default activations (view, click, answer questions), but we still want to track them for ourselves
        return data;
    });
    return activeActivations;
};
