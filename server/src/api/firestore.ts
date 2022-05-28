import {
  CollectionGroup,
  CollectionReference,
  DocumentData,
  DocumentReference,
} from "firebase-admin/firestore";
import { db } from "./firebase";
import { Lootbox, User, Wallet } from "../graphql/generated/types";
import { LootboxDatabaseSchema } from "@wormgraph/helpers";

enum Collection {
  "Lootbox" = "lootbox",
  "User" = "user",
  "Wallet" = "wallet",
}

export const getLootboxByAddress = async (
  address: string
): Promise<Lootbox> => {
  const lootboxRef = db
    .collection(Collection.Lootbox)
    .where(
      "address",
      "==",
      address
    ) as CollectionReference<LootboxDatabaseSchema>;

  const lootboxSnapshot = await lootboxRef.get();

  if (lootboxSnapshot.empty) {
    return undefined;
  } else {
    const doc = lootboxSnapshot.docs[0];
    const lootbox = doc.data();
    return {
      id: doc.id,
      address: lootbox.address,
    };
  }
};

export const getUser = async (id: string): Promise<Omit<User, "wallets">> => {
  const userRef = db
    .collection(Collection.User)
    .doc(id) as DocumentReference<User>;

  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    return undefined;
  } else {
    const user = userSnapshot.data();
    return {
      id: userSnapshot.id,
      ...user,
    };
  }
};

export const getUserWallets = async (id: string): Promise<Wallet[]> => {
  const wallets = db
    .collectionGroup(Collection.Wallet)
    .where("userId", "==", id) as CollectionGroup<Wallet>;

  const walletSnapshot = await wallets.get();
  if (walletSnapshot.empty) {
    return [];
  } else {
    return walletSnapshot.docs.map((doc) => {
      const wallet = doc.data();
      return {
        id: doc.id,
        ...wallet,
      };
    });
  }
};
