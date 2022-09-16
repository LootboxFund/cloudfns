import {
    AdEvent_Firestore,
    Collection,
    Memo_Firestore,
    Activation_Firestore,
    FlightID,
    TournamentID,
    AffiliateID,
    ActivationID,
} from "@wormgraph/helpers";
import { DocumentReference } from "firebase-admin/firestore";
import { Activation, Affiliate } from "../../../../../lootbox-server/src/graphql/generated/types";
import { db } from "../firebase";

// id: AdEventID;
// timestamp: number;
// adId?: AdID;
// adSetId?: AdSetID;
// sessionId?: SessionID;
// campaignId?: CampaignID;
// flightId?: FlightID;
// action: AdEventAction;
// claimId?: ClaimID;
// activationEventMmpAlias?: MMPActivationAlias;
// activationID?: ActivationID;
// metadata?: EventMetadata;
// extraData?: Record<string, any>;
// affiliateAttribution?: AdEventAffiliateAttribution;
// nonce?: AdEventNonce;
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
            const memos = await handleWithFlightId(adEvent.flightId);
            return memos;
        }

        // if there is no flightID, then we fall back to the tournamentID + affiliateID + activationID
        // in most cases, all 3 parties will get a memo (promoter, organizer, lootbox). but it requiires the affiliateID to be a promoter
        if (
            adEvent.affiliateAttribution?.tournamentID &&
            adEvent.affiliateAttribution.promoterID &&
            adEvent.activationID
        ) {
            const memos = await handleWithTournamentAffiliateActivation({
                tournamentID: adEvent.affiliateAttribution.tournamentID,
                promoterID: adEvent.affiliateAttribution.promoterID,
                activationID: adEvent.activationID,
            });
            return memos;
        }

        // if there is only a tournamentID + activationID
        // then only 2 parties will get a memo (organizer, lootbox)
        if (adEvent.affiliateAttribution?.tournamentID && adEvent.activationID) {
            const memos = await handleWithTournamentActivation({
                tournamentID: adEvent.affiliateAttribution.tournamentID,
                activationID: adEvent.activationID,
            });
            return memos;
        }

        // but if there is only activationID
        // only lootbox will get a memo
        if (adEvent.activationID) {
            const memos = await handleWithActivationId(adEvent.activationID);
            return memos;
        }
    }
    return [];
};

export const handleWithFlightId = async (flightID: FlightID): Promise<Memo_Firestore[]> => {
    return [];
};

export const handleWithTournamentAffiliateActivation = async ({
    tournamentID,
    promoterID,
    activationID,
}: {
    tournamentID: TournamentID;
    promoterID: AffiliateID;
    activationID: ActivationID;
}): Promise<Memo_Firestore[]> => {
    return [];
};
export const handleWithTournamentActivation = async ({
    tournamentID,
    activationID,
}: {
    tournamentID: TournamentID;
    activationID: ActivationID;
}): Promise<Memo_Firestore[]> => {
    return [];
};
export const handleWithActivationId = async (activationID: ActivationID): Promise<Memo_Firestore[]> => {
    return [];
};

// export const createMemoBill = async (): // userID: UserID
// Promise<Memo_Firestore> => {
//   const userRef = db
//     .collection(Collection.User)
//     .doc(userID) as DocumentReference<User>;
//   const userSnapshot = await userRef.get();
//   const user = userSnapshot.data() as User;
//   const ____Ref = db
//     .collection(Collection._____)
//     .doc()
//     .collection(Collection._____)
//     .doc() as DocumentReference<___Schema>;
// const ___createdObjectOfSchema: ___Schema = {
//     id:____Ref.id as ____ID,
//   };
//   await ____Ref.set(___createdObjectOfSchema);
//   return ___createdObjectOfSchema;
// };

// const ___Ref = db
//     .collection(Collection.___)
//     .doc(parentID)
//     .collection(Collection.___)
//     .where("creatorId", "==", userId)
//     .orderBy("timestamps.createdAt", "desc") as Query<___Schema>;

//     const __collectionItems = await ___Ref.get();

//     if (__collectionItems.empty) {
//       return [];
//     } else {
//       return __collectionItems.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           somevar: data.somevar,
//           timestamps: {
//             createdAt: data.timestamps.createdAt,
//             updatedAt: data.timestamps.updatedAt,
//             ...(data.timestamps.deletedAt && {
//               deletedAt: data.timestamps.deletedAt,
//             }),
//           },
//         };
//       });
//     }
