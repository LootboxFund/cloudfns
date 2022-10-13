import {
  CollectionReference,
  DocumentReference,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import { LootboxFeedResponseSuccess } from "../../graphql/generated/types";
import {
  Address,
  Collection,
  UserID,
  LootboxMintWhitelistID,
  LootboxMintSignatureNonce,
  LootboxTicketID,
  LootboxTicket_Firestore,
  Lootbox_Firestore,
  LootboxStatus_Firestore,
  MintWhitelistSignature_Firestore,
} from "@wormgraph/helpers";
import { LootboxID } from "@wormgraph/helpers";
import { convertLootboxToSnapshot, parseLootboxDB } from "../../lib/lootbox";

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

// export const getUserMintSignaturesForLootbox = async (
//   lootboxID: LootboxID,
//   userID: string
// ): Promise<MintWhitelistSignature_Firestore[]> => {
//   const collectionRef = db
//     .collection(Collection.Lootbox)
//     .doc(lootboxID)
//     .collection(Collection.MintWhiteList)
//     .where("userID", "==", userID)
//     .orderBy(
//       "createdAt",
//       "asc"
//     ) as CollectionReference<MintWhitelistSignature_Firestore>;

//   const collectionSnapshot = await collectionRef.get();

//   if (collectionSnapshot.empty) {
//     return [];
//   }

//   return collectionSnapshot.docs.map((doc) =>
//     parseMintWhitelistSignature(doc.data())
//   );
// };

// interface CreateMintWhitelistSignatureRequest {
//   signature: string;
//   signer: Address;
//   whitelistedAddress: Address;
//   lootboxId: LootboxID;
//   lootboxAddress: Address;
//   nonce: LootboxMintSignatureNonce;
//   digest: LootboxTicketDigest;
//   userID: UserID | null;
// }
// /** @WARNING ALSO duplicated in functions */
// export const createMintWhitelistSignature = async ({
//   signature,
//   signer,
//   whitelistedAddress,
//   lootboxId,
//   lootboxAddress,
//   nonce,
//   digest,
//   userID,
// }: CreateMintWhitelistSignatureRequest): Promise<MintWhitelistSignature_Firestore> => {
//   const signatureRef = db
//     .collection(Collection.Lootbox)
//     .doc(lootboxId)
//     .collection(Collection.MintWhiteList)
//     .doc() as DocumentReference<MintWhitelistSignature_Firestore>;

//   const signatureDocument: MintWhitelistSignature_Firestore = {
//     id: signatureRef.id as LootboxMintWhitelistID,
//     isRedeemed: false,
//     lootboxAddress,
//     whitelistedAddress,
//     signature,
//     signer,
//     nonce,
//     createdAt: Timestamp.now().toMillis(),
//     updatedAt: Timestamp.now().toMillis(),
//     deletedAt: null,
//     lootboxID: lootboxId,
//     digest,
//     lootboxTicketID: null,
//     userID,
//   };

//   await signatureRef.set(signatureDocument);

//   return signatureDocument;
// };

export const getTicket = async (
  lootboxID: LootboxID,
  ticketID: LootboxTicketID
): Promise<LootboxTicket_Firestore | undefined> => {
  const ticketRef = db
    .collection(Collection.Lootbox)
    .doc(lootboxID)
    .collection(Collection.LootboxTicket)
    .doc(ticketID) as DocumentReference<LootboxTicket_Firestore>;

  const ticket = await ticketRef.get();

  if (!ticket.exists) {
    return undefined;
  }

  return ticket.data();
};

export const getMintWhistlistSignature = async (
  lootboxID: LootboxID,
  signatureID: LootboxMintWhitelistID
): Promise<MintWhitelistSignature_Firestore | undefined> => {
  const signatureRef = db
    .collection(Collection.Lootbox)
    .doc(lootboxID)
    .collection(Collection.MintWhiteList)
    .doc(signatureID) as DocumentReference<MintWhitelistSignature_Firestore>;

  const signature = await signatureRef.get();

  if (!signature.exists) {
    return undefined;
  }

  return signature.data();
};

export const getLootboxByUserIDAndNonce = async (
  userID: UserID,
  nonce: LootboxMintSignatureNonce
): Promise<Lootbox_Firestore | undefined> => {
  const collectionRef = db
    .collection(Collection.Lootbox)
    .where("userID", "==", userID)
    .where("nonce", "==", nonce)
    .limit(1) as Query<Lootbox_Firestore>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return undefined;
  }

  return collectionSnapshot.docs[0].data();
};
