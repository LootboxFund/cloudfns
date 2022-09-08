import { db } from "../firebase";
import { AdID, Collection, CampaignID, FlightID, SessionID, AdEventNonce } from "../../lib/types";
import { Ad, AdEvent, AdEventAction } from "../graphql/generated/types";
import { DocumentReference, Query, Timestamp } from "firebase-admin/firestore";

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

interface CreateAdEventRequest {
    action: AdEventAction;
    adId: AdID;
    campaignId: CampaignID;
    flightId: FlightID;
    sessionId: SessionID;
    nonce: AdEventNonce;
}
export const createAdEvent = async (request: CreateAdEventRequest): Promise<AdEvent> => {
    const documentWithoutId: Omit<AdEvent, "id"> = {
        action: request.action,
        adId: request.adId,
        campaignId: request.campaignId,
        flightId: request.flightId,
        sessionId: request.sessionId,
        timestamp: Timestamp.now().toMillis(),
        nonce: request.nonce,
        // metadata:
    };

    const docRef = db
        .collection(Collection.Ad)
        .doc(request.adId)
        .collection(Collection.AdEvent)
        .doc() as DocumentReference<AdEvent>;

    const documentWithId: AdEvent = { ...documentWithoutId, id: docRef.id };

    await docRef.set(documentWithId);

    return documentWithId;
};

export const getAdEventsBySessionId = async (adId: AdID, sessionId: SessionID, limit?: number): Promise<AdEvent[]> => {
    let collectionRef = db
        .collection(Collection.Ad)
        .doc(adId)
        .collection(Collection.AdEvent)
        .where("sessionId", "==", sessionId) as Query<AdEvent>;

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

interface UpdateAdCountsRequest {
    clicks?: number;
    uniqueClicks?: number;
    impressions?: number;
}
export const updateAdCounts = async (adId: AdID, request: UpdateAdCountsRequest): Promise<void> => {
    const adRef = db.collection(Collection.Ad).doc(adId) as DocumentReference<Ad>;

    await adRef.update(request);
};

export const getAdEventsByNonce = async (adId: AdID, nonce: AdEventNonce, limit?: number): Promise<AdEvent[]> => {
    let collectionRef = db
        .collection(Collection.Ad)
        .doc(adId)
        .collection(Collection.AdEvent)
        .where("monce", "==", nonce) as Query<AdEvent>;

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
