import { PartyBasketID, Collection } from "@wormgraph/helpers";
import { PartyBasket } from "../graphql/generated/types";
import { db } from "../firebase";
import { DocumentReference } from "firebase-admin/firestore";

export const getPartyBasketById = async (id: PartyBasketID): Promise<PartyBasket | undefined> => {
    const partyBasketRef = db.collection(Collection.PartyBasket).doc(id) as DocumentReference<PartyBasket>;

    const partyBasketSnapshot = await partyBasketRef.get();
    if (!partyBasketSnapshot.exists) {
        return undefined;
    } else {
        return partyBasketSnapshot.data();
    }
};
