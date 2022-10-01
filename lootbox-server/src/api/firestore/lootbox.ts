import {
  CollectionReference,
  DocumentReference,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import {
  Lootbox,
  LootboxFeedResponseSuccess,
} from "../../graphql/generated/types";
import {
  Address,
  ClaimID,
  Collection,
  UserID,
  LootboxMintWhitelistID,
  LootboxMintSignatureNonce,
  LootboxTicketID_Web3,
  LootboxTicketID,
  LootboxTicket_Firestore,
  Lootbox_Firestore,
  LootboxStatus_Firestore,
} from "@wormgraph/helpers";
import { LootboxID } from "../../lib/types";
import {
  convertLootboxToSnapshot,
  parseLootboxDB,
  parseMintWhitelistSignature,
} from "../../lib/lootbox";
import { MintWhitelistSignature_Firestore } from "./lootbox.types";

export const getLootbox = async (
  id: LootboxID
): Promise<Lootbox_Firestore | undefined> => {
  const lootboxRef = db
    .collection(Collection.Lootbox)
    .doc(id) as DocumentReference<Lootbox_Firestore>;

  const lootboxSnapshot = await lootboxRef.get();

  if (!lootboxSnapshot.exists) {
    return undefined;
  } else {
    const data = lootboxSnapshot.data();
    return data ? parseLootboxDB(data) : undefined;
  }
};

export const getLootboxByAddress = async (
  address: Address
): Promise<Lootbox_Firestore | undefined> => {
  const lootboxRef = db
    .collection(Collection.Lootbox)
    .where("address", "==", address) as CollectionReference<Lootbox_Firestore>;

  const lootboxSnapshot = await lootboxRef.get();

  if (lootboxSnapshot.empty) {
    return undefined;
  } else {
    const doc = lootboxSnapshot.docs[0];
    return parseLootboxDB(doc.data());
  }
};

interface EditLootboxPayload {
  logo?: string;
  name?: string;
  description?: string;
  nftBountyValue?: string;
  joinCommunityUrl?: string;
  status?: LootboxStatus_Firestore;
  maxTickets?: number;
  backgroundImage?: string;
  badgeImage?: string;
  themeColor?: string;
  symbol?: string;
}
export const editLootbox = async (
  lootboxID: LootboxID,
  payload: EditLootboxPayload
): Promise<Lootbox_Firestore> => {
  const updateRequest: Partial<Lootbox_Firestore> = {};

  if (!!payload.logo) {
    updateRequest.logo = payload.logo;
  }

  if (!!payload.name) {
    updateRequest.name = payload.name;
  }

  if (!!payload.description) {
    updateRequest.description = payload.description;
  }

  if (!!payload.nftBountyValue) {
    updateRequest.nftBountyValue = payload.nftBountyValue;
  }

  if (!!payload.joinCommunityUrl) {
    updateRequest.joinCommunityUrl = payload.joinCommunityUrl;
  }

  if (!!payload.status) {
    updateRequest.status = payload.status;
  }

  if (!!payload.maxTickets) {
    updateRequest.maxTickets = payload.maxTickets;
  }

  if (!!payload.backgroundImage) {
    updateRequest.backgroundImage = payload.backgroundImage;
  }

  if (!!payload.badgeImage) {
    updateRequest.name = payload.badgeImage;
  }

  if (!!payload.themeColor) {
    updateRequest.themeColor = payload.themeColor;
  }

  if (!!payload.symbol) {
    updateRequest.symbol = payload.symbol;
  }

  updateRequest["timestamps.updatedAt"] = Timestamp.now().toMillis();

  const docRef = db
    .collection(Collection.Lootbox)
    .doc(lootboxID) as DocumentReference<Lootbox_Firestore>;

  await docRef.update(updateRequest);
  const updatedData = await docRef.get();

  // return (await getLootbox(lootboxID)) as Lootbox_Firestore;
  return updatedData.data()!;
};

export const paginateLootboxFeedQuery = async (
  limit: number,
  cursor?: LootboxID | null
): Promise<LootboxFeedResponseSuccess> => {
  let collectionRef = db
    .collection(Collection.Lootbox)
    .orderBy("timestamps.createdAt", "desc") as Query<Lootbox_Firestore>;

  if (cursor) {
    const cursorRef = db
      .collection(Collection.Lootbox)
      .doc(cursor) as DocumentReference<Lootbox_Firestore>;

    const cursorData = (await cursorRef.get()).data();
    if (cursorData) {
      collectionRef = collectionRef.startAfter(cursorData.timestamps.createdAt);
    }
  }

  collectionRef = collectionRef.limit(limit + 1);

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return {
      totalCount: -1,
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    };
  } else {
    const docs = collectionSnapshot.docs.slice(0, limit);
    return {
      edges: docs.map((doc) => {
        const data = doc.data();
        return {
          node: convertLootboxToSnapshot(data),
          cursor: doc.id,
        };
      }),
      totalCount: -1,
      pageInfo: {
        endCursor: docs[docs.length - 1].id,
        hasNextPage: collectionSnapshot.docs.length === limit + 1,
      },
    };
  }
};

export const getUserMintSignaturesForLootbox = async (
  lootboxID: LootboxID,
  userID: string
): Promise<MintWhitelistSignature_Firestore[]> => {
  const collectionRef = db
    .collection(Collection.Lootbox)
    .doc(lootboxID)
    .collection(Collection.MintWhiteList)
    .where("userID", "==", userID)
    .orderBy(
      "timestamp",
      "asc"
    ) as CollectionReference<MintWhitelistSignature_Firestore>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return [];
  }

  return collectionSnapshot.docs.map((doc) =>
    parseMintWhitelistSignature(doc.data())
  );
};

interface CreateMintWhitelistSignatureRequest {
  signature: string;
  signer: Address;
  whitelistedAddress: Address;
  lootboxId: LootboxID;
  lootboxAddress: Address;
  nonce: LootboxMintSignatureNonce;
}
export const createMintWhitelistSignature = async ({
  signature,
  signer,
  whitelistedAddress,
  lootboxId,
  lootboxAddress,
  nonce,
}: CreateMintWhitelistSignatureRequest): Promise<MintWhitelistSignature_Firestore> => {
  const signatureRef = db
    .collection(Collection.Lootbox)
    .doc(lootboxId)
    .collection(Collection.MintWhiteList)
    .doc() as DocumentReference<MintWhitelistSignature_Firestore>;

  const signatureDocument: MintWhitelistSignature_Firestore = {
    id: signatureRef.id as LootboxMintWhitelistID,
    isRedeemed: false,
    lootboxAddress,
    whitelistedAddress,
    signature,
    signer,
    nonce,
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
    deletedAt: null,
  };

  await signatureRef.set(signatureDocument);

  return signatureDocument;
};

interface CreateTicketRequest {
  minterUserID: UserID;
  lootboxID: LootboxID;
  lootboxAddress: Address;
  ticketID: LootboxTicketID_Web3;
  minterAddress: Address;
  mintWhitelistID: LootboxMintWhitelistID;
  stampImage: string;
  metadataURL: string;
  claimID?: ClaimID;
}

/**
 * - updates mintWhitelist.redeemed = true
 * - creates LootboxTicket_Firestore as subcollection under Lootbox
 */
export const finalizeMint = async (
  payload: CreateTicketRequest
): Promise<LootboxTicket_Firestore> => {
  const batch = db.batch();

  const ticketRef = db
    .collection(Collection.Lootbox)
    .doc(payload.lootboxID)
    .collection(Collection.LootboxTicket)
    .doc() as DocumentReference<LootboxTicket_Firestore>;

  const ticketDocument: LootboxTicket_Firestore = {
    lootboxAddress: payload.lootboxAddress,
    ticketID: payload.ticketID,
    minterAddress: payload.minterAddress,
    mintWhitelistID: payload.mintWhitelistID,
    createdAt: Timestamp.now().toMillis(),
    stampImage: payload.stampImage,
    metadataURL: payload.metadataURL,
    lootboxID: payload.lootboxID,
    minterUserID: payload.minterUserID,
    id: ticketRef.id as LootboxTicketID,
    claimID: payload.claimID || null,
  };

  const whitelistRef = db
    .collection(Collection.Lootbox)
    .doc(payload.lootboxID)
    .collection(Collection.MintWhiteList)
    .doc(
      payload.mintWhitelistID
    ) as DocumentReference<MintWhitelistSignature_Firestore>;

  batch.create(ticketRef, ticketDocument);
  batch.update(whitelistRef, whitelistRef);

  await batch.commit();

  const ticket = await ticketRef.get();
  return ticket.data()!;
};

export const createLootboxTicket = async (
  payload: CreateTicketRequest
): Promise<LootboxTicket_Firestore> => {
  const ticketRef = db
    .collection(Collection.Lootbox)
    .doc(payload.lootboxID)
    .collection(Collection.LootboxTicket)
    .doc() as DocumentReference<LootboxTicket_Firestore>;

  const ticketDocument: LootboxTicket_Firestore = {
    lootboxAddress: payload.lootboxAddress,
    ticketID: payload.ticketID,
    minterAddress: payload.minterAddress,
    mintWhitelistID: payload.mintWhitelistID,
    createdAt: Timestamp.now().toMillis(),
    stampImage: payload.stampImage,
    metadataURL: payload.metadataURL,
    lootboxID: payload.lootboxID,
    minterUserID: payload.minterUserID,
    id: ticketRef.id as LootboxTicketID,
    claimID: payload.claimID || null,
  };

  await ticketRef.set(ticketDocument);

  return ticketDocument;
};

export const getTicketByWeb3ID = async (
  lootboxID: LootboxID,
  ticketID: LootboxTicketID_Web3
): Promise<LootboxTicket_Firestore | undefined> => {
  const ticketRef = db
    .collection(Collection.Lootbox)
    .doc(lootboxID)
    .collection(Collection.LootboxTicket)
    .where("ticketID", "==", ticketID)
    .limit(1) as Query<LootboxTicket_Firestore>;

  const ticketSnapshot = await ticketRef.get();

  if (ticketSnapshot.empty) {
    return undefined;
  }

  return ticketSnapshot.docs[0].data();
};
