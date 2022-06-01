import { CollectionGroup, DocumentReference } from "firebase-admin/firestore";
import {
  Lootbox,
  LootboxSnapshot,
  Wallet,
  Tournament,
  User,
} from "./graphql/generated/types";
import { error } from "firebase-functions/lib/logger";
import { db } from "./firebase";
import { Address } from "@wormgraph/helpers";

export enum Collection {
  "Lootbox" = "lootbox",
  "User" = "user",
  "Wallet" = "wallet",
  "LootboxSnapshotWallet" = "lootbox-snapshot-wallet",
  "LootboxSnapshotTournament" = "lootbox-snapshot-tournament",
  "Tournament" = "tournament",
}

const getWalletByAddress = async (
  address: Address
): Promise<Wallet | undefined> => {
  const wallet = db
    .collectionGroup(Collection.Wallet)
    .where("address", "==", address) as CollectionGroup<Wallet>;
  const snapshot = await wallet.get();

  if (snapshot.empty) {
    return undefined;
  } else {
    return snapshot.docs[0]?.data();
  }
};

const getTournamentById = async (
  tournamentId: string
): Promise<Tournament | undefined> => {
  const tournament = db
    .collection(Collection.Tournament)
    .doc(tournamentId) as DocumentReference<Tournament>;

  const snapshot = await tournament.get();

  if (!snapshot.exists) {
    return undefined;
  } else {
    return snapshot.data();
  }
};

const getUserById = async (userId: string): Promise<User | undefined> => {
  const user = db
    .collection(Collection.User)
    .doc(userId) as DocumentReference<User>;

  const snapshot = await user.get();

  if (!snapshot.exists) {
    return undefined;
  } else {
    return snapshot.data();
  }
};

const getLootboxesByIssuer = async (issuer: string): Promise<Lootbox[]> => {
  const lootboxes = db
    .collection(Collection.Lootbox)
    .where("issuer", "==", issuer) as CollectionGroup<Lootbox>;
  const snapshot = await lootboxes.get();

  if (snapshot.empty) {
    return [];
  } else {
    return snapshot.docs.map((doc) => doc.data());
  }
};

export const indexLootboxOnCreate = async (lootbox: Lootbox) => {
  const { issuer, tournamentId } = lootbox;

  const lootboxSnapshot = parseLootboxSnapshot(lootbox);

  if (issuer) {
    try {
      const userWallet = await getWalletByAddress(issuer as Address);

      if (!!userWallet) {
        // Need to get user id of the issuer:
        // Write to user/wallet/ subcollection
        const userAccount = await getUserById(userWallet.userId);
        if (!!userAccount) {
          const documentPath = `${Collection.User}/${userWallet.userId}/${Collection.Wallet}/${userWallet.id}/${Collection.LootboxSnapshotWallet}`;
          await db.collection(documentPath).doc().set(lootboxSnapshot);
        } else {
          throw new Error("User account not found");
        }
      } else {
        throw new Error("User wallet not found");
      }
    } catch (err) {
      error(err);
    }
  }

  if (tournamentId) {
    try {
      // Write to tournament collection
      const tournament = await getTournamentById(tournamentId);
      if (tournament) {
        const documentPath = `${Collection.Tournament}/${tournamentId}/${Collection.LootboxSnapshotTournament}`;
        await db.collection(documentPath).doc().set(lootboxSnapshot);
      } else {
        throw new Error("Tournament not found");
      }
    } catch (err) {
      error(err);
    }
  }
};

export const indexWalletOnCreate = async (wallet: Wallet) => {
  // Writes lootbox snapshots to User/Wallet/LootboxSnapshot subcollection
  const lootboxes = await getLootboxesByIssuer(wallet.address);
  for (const lootbox of lootboxes) {
    try {
      const documentPath = `${Collection.User}/${wallet.userId}/${Collection.Wallet}/${wallet.id}/${Collection.LootboxSnapshotWallet}`;
      const lootboxSnapshot = parseLootboxSnapshot(lootbox);
      await db.collection(documentPath).doc().set(lootboxSnapshot);
    } catch (err) {
      error(err);
    }
  }
};

const parseLootboxSnapshot = (lootbox: Lootbox): LootboxSnapshot => {
  const lootboxSnapshot: LootboxSnapshot = {
    address: lootbox.address,

    backgroundImage:
      lootbox.metadata?.lootboxCustomSchema?.lootbox?.backgroundImage || "",
    backgroundColor:
      lootbox.metadata?.lootboxCustomSchema?.lootbox?.backgroundColor || "",
    image: lootbox.metadata?.lootboxCustomSchema?.lootbox?.image || "",
    name: lootbox.metadata?.lootboxCustomSchema?.lootbox?.name || "",

    issuer: lootbox.issuer,
    metadataDownloadUrl: lootbox.metadataDownloadUrl || "",
    stampImage: lootbox?.metadata?.image || "",

    timestamps: {
      createdAt: new Date().valueOf(),
      updatedAt: new Date().valueOf(),
    },
  };
  return lootboxSnapshot;
};
