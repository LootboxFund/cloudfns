import { db } from "../firebase";
import { AdID, Collection, CampaignID, SessionID, AdEventNonce, ClaimID } from "../../lib/types";
import { Ad, AdEventAction } from "../graphql/generated/types";
import { DocumentReference, Query, Timestamp } from "firebase-admin/firestore";
import { AdEventID, AdEvent_Firestore, AdSetID } from "@wormgraph/helpers";

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
    adSetId: AdSetID;
    sessionId: SessionID;
    nonce: AdEventNonce;
    claimId?: ClaimID;
}
export const createAdEvent = async (request: CreateAdEventRequest): Promise<AdEvent_Firestore> => {
    const documentWithoutId: Omit<AdEvent_Firestore, "id"> = {
        action: request.action,
        adId: request.adId,
        campaignId: request.campaignId,
        adSetId: request.adSetId,
        sessionId: request.sessionId,
        timestamp: Timestamp.now().toMillis(),
        nonce: request.nonce,
    };

    if (request.claimId) {
        documentWithoutId.claimId = request.claimId;
    }

    const docRef = db
        .collection(Collection.Ad)
        .doc(request.adId)
        .collection(Collection.AdEvent)
        .doc() as DocumentReference<AdEvent_Firestore>;

    const documentWithId: AdEvent_Firestore = { ...documentWithoutId, id: docRef.id as AdEventID };

    await docRef.set(documentWithId);

    return documentWithId;
};

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
        .collection(Collection.Ad)
        .doc(adId)
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
    let collectionRef = db
        .collection(Collection.Ad)
        .doc(adId)
        .collection(Collection.AdEvent)
        .where("monce", "==", nonce) as Query<AdEvent_Firestore>;

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
