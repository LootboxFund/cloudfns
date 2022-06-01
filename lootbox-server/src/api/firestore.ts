import {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "./firebase";
import {
  Lootbox,
  LootboxSnapshot,
  User,
  Wallet,
} from "../graphql/generated/types";
import { Address, LootboxDatabaseSchema } from "@wormgraph/helpers";
import { IIdpUser } from "./identityProvider/interface";
import { UserID, UserIdpID, LootboxID } from "../lib/types";

// TODO: extract this to helpers
//       this is copied over in @cloudfns/firebase
enum Collection {
  "Lootbox" = "lootbox",
  "User" = "user",
  "Wallet" = "wallet",
  "WalletLootboxSnapshot" = "wallet-lootbox-snapshot",
}

type WalletWithoutLootboxSnapshot = Omit<Wallet, "lootboxSnapshots">;

type UserWithoutWalletsOrLootboxSnapshots = Omit<
  User,
  "wallets" | "lootboxSnapshots"
>;

interface CreateFirestoreUserPayload {
  firstName?: string;
  lastName?: string;
}

export const getLootboxByAddress = async (
  address: Address
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
      id: doc.id as LootboxID,
      address: lootbox.address,
    };
  }
};

export const createUser = async (
  idpUser: IIdpUser,
  payload: CreateFirestoreUserPayload
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
): Promise<UserWithoutWalletsOrLootboxSnapshots | undefined> => {
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

export const getUserWallets = async (
  id: UserID
): Promise<WalletWithoutLootboxSnapshot[]> => {
  const wallets = db
    .collectionGroup(Collection.Wallet)
    .where("userId", "==", id) as CollectionGroup<WalletWithoutLootboxSnapshot>;

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
    .collectionGroup(Collection.Wallet)
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

export const getLootboxSnapshotsForWallet = async (walletAddress: Address) => {
  const collectionGroupRef = db
    .collectionGroup(Collection.WalletLootboxSnapshot)
    .where("address", "==", walletAddress) as CollectionGroup<LootboxSnapshot>;

  const lootboxSnapshot = await collectionGroupRef.get();

  if (lootboxSnapshot.empty) {
    return [];
  } else {
    return lootboxSnapshot.docs.map((doc) => {
      return doc.data();
    });
  }
};
