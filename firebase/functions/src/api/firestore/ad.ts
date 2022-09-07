import { db } from "../firebase";
import { AdID, Collection, CampaignID, FlightID, SessionID } from "../../lib/types";
import { Ad, AdEvent, AdEventAction } from "../graphql/generated/types";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";

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
}
export const createAdEvent = async (request: CreateAdEventRequest): Promise<AdEvent> => {
    const documentWithoutId: Omit<AdEvent, "id"> = {
        action: request.action,
        adId: request.adId,
        campaignId: request.campaignId,
        flightId: request.flightId,
        sessionId: request.sessionId,
        timestamp: Timestamp.now().toMillis(),
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
