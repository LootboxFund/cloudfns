import { Collection, UserID, User_Firestore, Wallet_Firestore } from "@wormgraph/helpers";
import { DocumentReference, Query } from "firebase-admin/firestore";
import { db } from "../firebase";

export const getUser = async (userID: UserID): Promise<User_Firestore | undefined> => {
    const userRef = db.collection(Collection.User).doc(userID) as DocumentReference<User_Firestore>;

    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
        return undefined;
    } else {
        return userSnapshot.data() as User_Firestore | undefined;
    }
};

export const getUserWallets = async (id: UserID, limit?: number): Promise<Wallet_Firestore[]> => {
    let wallets = db
        .collection(Collection.User)
        .doc(id)
        .collection(Collection.Wallet)
        .orderBy("createdAt", "asc") as Query<Wallet_Firestore>;

    if (limit) {
        wallets = wallets.limit(limit);
    }

    const walletSnapshot = await wallets.get();
    if (walletSnapshot.empty) {
        return [];
    } else {
        return walletSnapshot.docs.map((doc) => {
            return doc.data();
        });
    }
};
