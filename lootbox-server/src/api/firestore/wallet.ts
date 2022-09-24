import {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import {
  Lootbox,
  LootboxSnapshot,
  Wallet,
} from "../../graphql/generated/types";
import { Address, Collection } from "@wormgraph/helpers";
import { UserID, UserIdpID, WalletID } from "../../lib/types";
import { convertLootboxToSnapshot } from "../../lib/lootbox";
import { Lootbox_Firestore } from "./lootbox.types";

type WalletWithoutLootboxSnapshot = Omit<Wallet, "lootboxSnapshots">;

export const getUserWallets = async (
  id: UserID,
  limit?: number
): Promise<WalletWithoutLootboxSnapshot[]> => {
  let wallets = db
    .collection(Collection.User)
    .doc(id)
    .collection(Collection.Wallet)
    .orderBy("createdAt", "asc") as Query<WalletWithoutLootboxSnapshot>;

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

export const getUserWalletById = async (
  userId: UserIdpID,
  walletId: WalletID
): Promise<Wallet | undefined> => {
  const walletRef = db
    .collection(Collection.User)
    .doc(userId)
    .collection(Collection.Wallet)
    .doc(walletId) as DocumentReference<Wallet>;

  const walletSnapshot = await walletRef.get();

  if (!walletSnapshot.exists) {
    return undefined;
  } else {
    return walletSnapshot.data();
  }
};

export const getWalletByAddress = async (
  address: Address
): Promise<Wallet | undefined> => {
  const walletRef = db
    .collectionGroup(Collection.Wallet)
    .where("address", "==", address) as CollectionReference<Wallet>;

  const walletSnapshot = await walletRef.get();

  if (walletSnapshot.empty) {
    return undefined;
  } else {
    const doc = walletSnapshot.docs[0];
    return doc.data();
  }
};

interface CreateUserWalletPayload {
  address: Address;
  userId: UserID | UserIdpID;
}
export const createUserWallet = async (
  payload: CreateUserWalletPayload
): Promise<Wallet> => {
  const walletRef = db
    .collection(Collection.User)
    .doc(payload.userId)
    .collection(Collection.Wallet)
    .doc() as DocumentReference<Wallet>;

  const wallet: Wallet = {
    id: walletRef.id,
    address: payload.address,
    userId: payload.userId,
    createdAt: Timestamp.now().toMillis(),
  };

  await walletRef.set(wallet);

  return wallet;
};

/** @deprecated - just use User.lootbox resolver */
export const getLootboxSnapshotsForWallet = async (
  walletAddress: Address
): Promise<LootboxSnapshot[]> => {
  const collectionRef = db
    .collection(Collection.Lootbox)
    .where("issuer", "==", walletAddress) as CollectionGroup<Lootbox_Firestore>;

  const lootboxSnapshot = await collectionRef.get();

  if (lootboxSnapshot.empty) {
    return [];
  } else {
    return lootboxSnapshot.docs.map((doc) => {
      const data = doc.data();
      return convertLootboxToSnapshot(data);
    });
  }
};

export const deleteWallet = async (
  userId: UserIdpID,
  walletId: WalletID
): Promise<void> => {
  const walletRef = db
    .collection(Collection.User)
    .doc(userId)
    .collection(Collection.Wallet)
    .doc(walletId) as DocumentReference<Wallet>;

  await walletRef.delete();
  return;
};
