import {
  CollectionGroup,
  CollectionReference,
  DocumentData,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "./firebase";
import {
  Lootbox,
  User,
  Wallet,
  CreateUserPayload,
} from "../graphql/generated/types";
import { Address, LootboxDatabaseSchema } from "@wormgraph/helpers";
import { IIdpUser } from "./identityProvider/interface";

enum Collection {
  "Lootbox" = "lootbox",
  "User" = "user",
  "Wallet" = "wallet",
}

export const getLootboxByAddress = async (
  address: string
): Promise<Lootbox | undefined> => {
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

export const createUser = async (
  idpUser: IIdpUser,
  payload: CreateUserPayload
): Promise<User> => {
  const userRef = db
    .collection(Collection.User)
    .doc(idpUser.id) as DocumentReference<User>;

  const user: User = {
    id: idpUser.id,
    email: idpUser.email,
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
  };

  if (idpUser.phoneNumber) {
    user.phoneNumber = idpUser.phoneNumber;
  }
  if (payload.firstName) {
    user.firstName = payload.firstName;
  }
  if (payload.lastName) {
    user.lastName = payload.lastName;
  }

  await userRef.set(user);

  return user;
};

export const getUser = async (
  id: string
): Promise<Omit<User, "wallets"> | undefined> => {
  const userRef = db
    .collection(Collection.User)
    .doc(id) as DocumentReference<User>;

  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    return undefined;
  } else {
    const user = userSnapshot.data() as User;
    return {
      id: userSnapshot.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
        ...wallet,
      };
    });
  }
};

export const getWalletByAddress = async (
  address: Address
): Promise<Wallet | undefined> => {
  const walletRef = db
    .collection(Collection.Wallet)
    .where("address", "==", address) as CollectionReference<Wallet>;

  const walletSnapshot = await walletRef.get();

  if (walletSnapshot.empty) {
    return undefined;
  } else {
    const doc = walletSnapshot.docs[0];
    const wallet = doc.data();
    return {
      ...wallet,
    };
  }
};

interface CreateUserWalletPayload {
  address: Address;
  userId: string;
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
