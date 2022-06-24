import {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "./firebase";
import {
  BattleFeedEdge,
  EditTournamentPayload,
  Lootbox,
  LootboxSnapshot,
  LootboxTournamentSnapshot,
  LootboxTournamentStatus,
  Tournament,
  User,
  Wallet,
  PageInfo,
} from "../graphql/generated/types";
import { Address } from "@wormgraph/helpers";
import { IIdpUser } from "./identityProvider/interface";
import {
  UserID,
  UserIdpID,
  LootboxID,
  TournamentID,
  WalletID,
} from "../lib/types";

// TODO: extract this to helpers
//       this is copied over in @cloudfns/firebase
export enum Collection {
  "Lootbox" = "lootbox",
  "User" = "user",
  "Wallet" = "wallet",
  "Tournament" = "tournament",
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

type TournamentWithoutLootboxSnapshots = Omit<Tournament, "lootboxSnapshots">;

export const getLootboxByAddress = async (
  address: Address
): Promise<Lootbox | undefined> => {
  const lootboxRef = db
    .collection(Collection.Lootbox)
    .where("address", "==", address) as CollectionReference<Lootbox>;

  const lootboxSnapshot = await lootboxRef.get();

  if (lootboxSnapshot.empty) {
    return undefined;
  } else {
    const doc = lootboxSnapshot.docs[0];
    return doc.data();
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
    deletedAt: null,
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
    .collection(Collection.User)
    .doc(id)
    .collection(
      Collection.Wallet
    ) as CollectionReference<WalletWithoutLootboxSnapshot>;

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

export const getLootboxSnapshotsForWallet = async (
  walletAddress: Address
): Promise<LootboxSnapshot[]> => {
  const collectionRef = db
    .collection(Collection.Lootbox)
    .where("issuer", "==", walletAddress) as CollectionGroup<Lootbox>;

  const lootboxSnapshot = await collectionRef.get();

  if (lootboxSnapshot.empty) {
    return [];
  } else {
    return lootboxSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        address: data.address,
        issuer: data.issuer,
        name: data.name,
        metadataDownloadUrl: data.metadataDownloadUrl,
        timestamps: {
          updatedAt: data.timestamps.updatedAt,
          createdAt: data.timestamps.createdAt,
        },
        backgroundColor:
          data?.metadata?.lootboxCustomSchema?.lootbox.backgroundColor || "",
        backgroundImage:
          data?.metadata?.lootboxCustomSchema?.lootbox.backgroundImage || "",
        image: data?.metadata?.lootboxCustomSchema?.lootbox.image || "",
        stampImage: data.metadata.image || "",
      };
    });
  }
};

export const getTournamentById = async (
  id: TournamentID
): Promise<Tournament | undefined> => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(id) as DocumentReference<Tournament>;

  const tournamentSnapshot = await tournamentRef.get();

  if (!tournamentSnapshot.exists) {
    return undefined;
  } else {
    return tournamentSnapshot.data();
  }
};

export const getLootboxSnapshotsForTournament = async (
  tournamentID: TournamentID
): Promise<LootboxTournamentSnapshot[]> => {
  const collectionRef = db
    .collection(Collection.Lootbox)
    .where("tournamentId", "==", tournamentID) as Query<Lootbox>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        address: data.address,
        issuer: data.issuer,
        name: data.name,
        metadataDownloadUrl: data.metadataDownloadUrl,
        timestamps: {
          updatedAt: data.timestamps.updatedAt,
          createdAt: data.timestamps.createdAt,
        },
        backgroundColor:
          data?.metadata?.lootboxCustomSchema?.lootbox.backgroundColor || "",
        backgroundImage:
          data?.metadata?.lootboxCustomSchema?.lootbox.backgroundImage || "",
        image: data?.metadata?.lootboxCustomSchema?.lootbox.image || "",
        stampImage: data.metadata.image,
        status:
          data?.tournamentMetadata?.status || LootboxTournamentStatus.Pending,
      };
    });
  }
};

export interface CreateTournamentArgs {
  title: string;
  description: string;
  tournamentLink?: string | null;
  creatorId: UserIdpID;
  prize?: string | null;
  coverPhoto?: string | null;
  tournamentDate: number;
}
export const createTournament = async ({
  title,
  description,
  tournamentLink,
  creatorId,
  prize,
  coverPhoto,
  tournamentDate,
}: CreateTournamentArgs): Promise<Tournament> => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc() as DocumentReference<Tournament>;

  const tournament: Tournament = {
    id: tournamentRef.id,
    title,
    description,
    creatorId,
    ...(!!prize && { prize }),
    ...(!!coverPhoto && { coverPhoto }),
    ...(!!tournamentLink && { tournamentLink }),
    ...(!!tournamentDate && {
      tournamentDate: Number(tournamentDate),
    }),
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
    },
  };

  await tournamentRef.set(tournament);

  return tournament;
};

export const updateTournament = async (
  id: TournamentID,
  payload: Omit<EditTournamentPayload, "id">
): Promise<Tournament> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }

  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(id) as DocumentReference<Tournament>;

  const updatePayload = {
    ...(payload.title != undefined && { title: payload.title }),
    ...(payload.description != undefined && {
      description: payload.description,
    }),
    ...(payload.tournamentLink != undefined && {
      tournamentLink: payload.tournamentLink,
    }),
    ...(payload.magicLink != undefined && { magicLink: payload.magicLink }),
    ...(payload.coverPhoto != undefined && { coverPhoto: payload.coverPhoto }),
    ...(payload.prize != undefined && { prize: payload.prize }),
    ...(payload.tournamentDate != undefined && {
      tournamentDate: Number(payload.tournamentDate),
    }),
  };

  await tournamentRef.update(updatePayload);

  return (await tournamentRef.get()).data() as Tournament;
};

export const deleteTournament = async (tournamentId: TournamentID) => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(tournamentId) as DocumentReference<Tournament>;

  await tournamentRef.update(
    "timestamps.deletedAt",
    Timestamp.now().toMillis() // soft delete
  );

  return (await tournamentRef.get()).data() as Tournament;
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

export const getUserTournaments = async (
  userId: UserID
): Promise<Tournament[]> => {
  const collectionRef = db
    .collection(Collection.Tournament)
    .where("creatorId", "==", userId) as Query<Tournament>;

  const tournaments = await collectionRef.get();

  if (tournaments.empty) {
    return [];
  } else {
    return tournaments.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        creatorId: data.creatorId,
        timestamps: {
          createdAt: data.timestamps.createdAt,
          updatedAt: data.timestamps.updatedAt,
          ...(data.timestamps.deletedAt && {
            deletedAt: data.timestamps.deletedAt,
          }),
        },
        ...(data.tournamentDate != undefined && {
          tournamentDate: data.tournamentDate,
        }),
      };
    });
  }
};

export const paginateBattleFeedQuery = async (
  limit: number,
  cursor: TournamentID
): Promise<{
  totalCount: number;
  edges: BattleFeedEdge[];
  pageInfo: PageInfo;
}> => {
  let tournamentQuery = db
    .collection(Collection.Tournament)
    .where("timestamps.deletedAt", "==", null)
    .orderBy("timestamps.createdAt", "desc") as Query<Tournament>;

  if (cursor) {
    const cursorRef = db
      .collection(Collection.Tournament)
      .doc(cursor) as DocumentReference<Tournament>;

    const cursorData = (await cursorRef.get()).data();
    if (cursorData) {
      tournamentQuery = tournamentQuery.startAfter(
        cursorData.timestamps.createdAt
      );
    }
  }

  tournamentQuery = tournamentQuery.limit(limit + 1);

  const tournamentSnapshot = await tournamentQuery.get();

  if (tournamentSnapshot.empty) {
    return {
      edges: [],
      totalCount: -1,
      pageInfo: {
        endCursor: undefined,
        hasNextPage: false,
      },
    };
  } else {
    const docs = tournamentSnapshot.docs.slice(0, limit);
    return {
      edges: docs.map((doc) => {
        return {
          node: doc.data(),
          cursor: doc.id,
        };
      }),
      totalCount: -1,
      pageInfo: {
        endCursor: docs[docs.length - 1].id,
        hasNextPage: tournamentSnapshot.docs.length === limit + 1,
      },
    };
  }
};
