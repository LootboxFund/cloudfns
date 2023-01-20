import { AffiliateID, Affiliate_Firestore, Collection, UserIdpID } from "@wormgraph/helpers";
import { DocumentReference, Query } from "firebase-admin/firestore";
import { db } from "../firebase";

export const getAffiliate = async (affiliateID: AffiliateID) => {
    const affiliateRef = db.collection(Collection.Affiliate).doc(affiliateID) as DocumentReference<Affiliate_Firestore>;

    const affiliateSnapshot = await affiliateRef.get();

    if (!affiliateSnapshot.exists) {
        return undefined;
    }
    return affiliateSnapshot.data();
};

export const getAffiliateByUserIdpID = async (userIdpID: UserIdpID | null) => {
    if (userIdpID === null) {
        throw new Error("No userIdpID provided");
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
