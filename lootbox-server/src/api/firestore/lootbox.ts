import {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import {
  LootboxFeedResponseSuccess,
  AirdropMetadataCreateInput,
  CreateLootboxPayload,
} from "../../graphql/generated/types";
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
  TournamentID,
  LootboxTournamentSnapshot_Firestore,
  LootboxTournamentSnapshotID,
  LootboxTournamentStatus_Firestore,
  LootboxVariant_Firestore,
  LootboxTicketDigest,
  Claim_Firestore,
  ClaimTimestamps_Firestore,
  ClaimStatus_Firestore,
  LootboxType,
  OfferID,
} from "@wormgraph/helpers";
import { LootboxID, UserIdpID } from "@wormgraph/helpers";
import { convertLootboxToSnapshot, parseLootboxDB } from "../../lib/lootbox";
import { getTournamentById } from "./tournament";
import { getOffer, updateOfferBatchCount } from "./offer";
import {
  createAirdropClaim,
  determineAirdropClaimWithReferrerCredit,
} from "./airdrop";
import { CreateLootboxRequest } from "../../service/lootbox";
import { retrieveRandomImage, retrieveRandomColor } from "../storage";
import {
  getRandomPortraitFromLexicaHardcoded,
  getRandomUserName,
} from "../lexica-images";
import { getRandomBackgroundFromLexicaHardcoded } from "../lexica-images/index";
const DEFAULT_THEME_COLOR = "#000001";

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
    return data
      ? { ...parseLootboxDB(data), id: lootboxSnapshot.id as LootboxID }
      : undefined;
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
    return { ...parseLootboxDB(doc.data()), id: doc.id as LootboxID };
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

/** Duplicated in cloudfns/firebase */
export const getWhitelistByDigest = async (
  lootboxID: LootboxID,
  digest: LootboxTicketDigest
): Promise<MintWhitelistSignature_Firestore | undefined> => {
  const ref = db
    .collection(Collection.Lootbox)
    .doc(lootboxID)
    .collection(Collection.MintWhiteList)
    .where("digest", "==", digest)
    .limit(1) as Query<MintWhitelistSignature_Firestore>;

  const query = await ref.get();

  if (query.empty) {
    return undefined;
  } else {
    return query.docs[0].data();
  }
};

interface CreateMintWhitelistSignatureRequest {
  signature: string;
  signer: Address;
  whitelistedAddress: Address;
  lootboxId: LootboxID;
  lootboxAddress: Address;
  nonce: LootboxMintSignatureNonce;
  digest: LootboxTicketDigest;
  claim: Claim_Firestore;
}

/**
 * Creates whitelist signature database object
 * Updates claim if provided with whitelistId as DB transaction
 */
export const createMintWhitelistSignature = async ({
  signature,
  signer,
  whitelistedAddress,
  lootboxId,
  lootboxAddress,
  nonce,
  claim,
  digest,
}: CreateMintWhitelistSignatureRequest): Promise<MintWhitelistSignature_Firestore> => {
  const batch = db.batch();

  const signatureRef = db
    .collection(Collection.Lootbox)
    .doc(lootboxId)
    .collection(Collection.MintWhiteList)
    .doc() as DocumentReference<MintWhitelistSignature_Firestore>;

  const whitelistID: LootboxMintWhitelistID =
    signatureRef.id as LootboxMintWhitelistID;

  const signatureDocument: MintWhitelistSignature_Firestore = {
    id: whitelistID,
    isRedeemed: false,
    lootboxAddress,
    whitelistedAddress,
    signature,
    signer,
    nonce,
    digest,
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
    deletedAt: null,
    lootboxTicketID: null,
    lootboxID: lootboxId,
    whitelistedAt: null,
    userID: claim?.claimerUserId ? claim.claimerUserId : null,
    claimID: claim.id,
    referralID: claim.referralId,
  };

  batch.set(signatureRef, signatureDocument);

  if (claim) {
    // Update the claim's whitelistId
    const claimRef = db
      .collection(Collection.Referral)
      .doc(claim.referralId)
      .collection(Collection.Claim)
      .doc(claim.id) as DocumentReference<Claim_Firestore>;

    // Annoying typesafety for nested objects
    const timestampName: keyof Claim_Firestore = "timestamps";
    const updatedAtName: keyof ClaimTimestamps_Firestore = "updatedAt";
    const whitelistedAtName: keyof ClaimTimestamps_Firestore = "whitelistedAt";
    const updateClaimRequest: Partial<Claim_Firestore> = {
      whitelistId: whitelistID,
      whitelistedAddress: whitelistedAddress,
      [`${timestampName}.${updatedAtName}`]: Timestamp.now().toMillis(),
      [`${timestampName}.${whitelistedAtName}`]: Timestamp.now().toMillis(),
    };

    batch.update(claimRef, updateClaimRequest);
  }

  await batch.commit();

  return signatureDocument;
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
  const creatorIDFieldName: keyof Lootbox_Firestore = "creatorID";
  const creationNonceFieldName: keyof Lootbox_Firestore = "creationNonce";
  const collectionRef = db
    .collection(Collection.Lootbox)
    .where(creatorIDFieldName, "==", userID)
    .where(creationNonceFieldName, "==", nonce)
    .limit(1) as Query<Lootbox_Firestore>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return undefined;
  }

  return collectionSnapshot.docs[0].data();
};

interface CreateLootboxPayloadLocalType {
  creatorID: UserID;
  stampImage: string;
  logo: string;
  name: string;
  description: string;
  symbol: string;
  maxTickets: number;
  backgroundImage: string;
  nftBountyValue: string;
  themeColor: string;
  joinCommunityUrl?: string;
  variant: LootboxVariant_Firestore;
  type?: LootboxType;
  airdropMetadata?: AirdropMetadataCreateInput;
}
export const createLootbox = async (
  payload: CreateLootboxPayloadLocalType,
  ref?: DocumentReference<Lootbox_Firestore>
): Promise<Lootbox_Firestore> => {
  if (payload.airdropMetadata && !payload.airdropMetadata.offerID) {
    throw Error("No offerID provided");
  }
  const lootboxRef = ref
    ? ref
    : (db
        .collection(Collection.Lootbox)
        .doc() as DocumentReference<Lootbox_Firestore>);

  const lootboxPayload: Lootbox_Firestore = {
    id: lootboxRef.id as LootboxID,
    address: null,
    factory: null,
    creatorID: payload.creatorID,
    creatorAddress: null,
    variant: payload.variant, // WARN: This also gets updated when web3 contract is deployed in @cloudfns/firebase/functions/index.ts > indexLootboxOnCreate
    chainIdHex: null,
    chainIdDecimal: null,
    chainName: null,
    transactionHash: null,
    blockNumber: null,
    baseTokenURI: null,
    stampImage: payload.stampImage,
    logo: payload.logo,
    name: payload.name,
    description: payload.description,
    nftBountyValue: payload.nftBountyValue,
    joinCommunityUrl: payload.joinCommunityUrl || "",
    status: LootboxStatus_Firestore.active,
    maxTickets: payload.maxTickets,
    backgroundImage: payload.backgroundImage,
    themeColor: payload.themeColor,
    symbol: payload.symbol,
    runningCompletedClaims: 0,
    creationNonce: null,
    members: [],
    isContractDeployed: false,
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
      deployedAt: null,
    },
  };
  if (payload.type) {
    lootboxPayload.type = payload.type;
  }
  if (payload.airdropMetadata && payload.type === LootboxType.Airdrop) {
    console.log(
      `Airdrop on tournament = ${payload.airdropMetadata.tournamentID} with claimers = ${payload.airdropMetadata.claimers.length}`
    );
    const [offerInfo, tournamentInfo, airdropClaimers] = await Promise.all([
      getOffer(payload.airdropMetadata.offerID as OfferID),
      payload.airdropMetadata.tournamentID
        ? getTournamentById(
            payload.airdropMetadata.tournamentID as TournamentID
          )
        : undefined,
      payload.airdropMetadata.tournamentID
        ? determineAirdropClaimWithReferrerCredit(
            payload.airdropMetadata.claimers as UserID[],
            payload.airdropMetadata.tournamentID as TournamentID
          )
        : [],
    ]);
    const batchedName = `${payload.airdropMetadata.title} - Batch ${payload.airdropMetadata.batch}`;
    lootboxPayload.airdropMetadata = {
      batch: payload.airdropMetadata.batch,
      instructionsLink: payload.airdropMetadata.instructionsLink || "",
      offerID: payload.airdropMetadata.offerID as OfferID,
      oneLiner: payload.airdropMetadata.oneLiner || "",
      title: batchedName,
      tournamentID: payload.airdropMetadata.tournamentID
        ? (payload.airdropMetadata.tournamentID as TournamentID)
        : undefined,
      value: payload.airdropMetadata.value,
      lootboxID: lootboxRef.id as LootboxID,
      organizerID: tournamentInfo ? tournamentInfo.organizer : undefined,
      advertiserID: offerInfo?.advertiserID,
      questions: offerInfo?.airdropMetadata?.questions || [],
    };
    lootboxPayload.name = batchedName;
    console.log(`Got airdrop claimers: ${airdropClaimers.length}`);
    await Promise.all(
      airdropClaimers.map((claim) => {
        return createAirdropClaim(
          claim,
          lootboxPayload,
          // @ts-ignore
          payload.airdropMetadata.offerID as OfferID
        );
      })
    );
    lootboxPayload.runningCompletedClaims = airdropClaimers.length;
    await updateOfferBatchCount(payload.airdropMetadata.offerID as OfferID);
  }
  await lootboxRef.set(lootboxPayload);
  return lootboxPayload;
};

interface CreateLootboxTournamentSnapshot {
  tournamentID: TournamentID;
  lootboxAddress: Address | null;
  lootboxID: LootboxID;
  creatorID: UserID;
  lootboxCreatorID: UserID;
  description: string;
  name: string;
  stampImage: string;
  type?: LootboxType;
}
export const createLootboxTournamentSnapshot = async (
  payload: CreateLootboxTournamentSnapshot
): Promise<LootboxTournamentSnapshot_Firestore> => {
  const doc = db
    .collection(Collection.Tournament)
    .doc(payload.tournamentID)
    .collection(Collection.LootboxTournamentSnapshot)
    .doc() as DocumentReference<LootboxTournamentSnapshot_Firestore>;

  const request: LootboxTournamentSnapshot_Firestore = {
    id: doc.id as LootboxTournamentSnapshotID,
    tournamentID: payload.tournamentID as TournamentID,
    address: payload.lootboxAddress || null,
    lootboxID: payload.lootboxID,
    creatorID: payload.creatorID,
    lootboxCreatorID: payload.lootboxCreatorID,
    description: payload.description,
    name: payload.name,
    stampImage: payload.stampImage,
    impressionPriority: 0,
    status: LootboxTournamentStatus_Firestore.active,
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
      depositEmailSentAt: null,
    },
  };
  if (payload.type) {
    request.type = payload.type;
  }

  await doc.set(request);

  return request;
};

export const getLootboxUnassignedClaimForUser = async (
  lootboxID: LootboxID,
  userID: UserID
): Promise<Claim_Firestore[]> => {
  const lootboxSatusField: keyof Claim_Firestore = "status";
  const whitelistIDField: keyof Claim_Firestore = "whitelistId";
  const lootboIDField: keyof Claim_Firestore = "lootboxID";
  const claimerUserId: keyof Claim_Firestore = "claimerUserId";

  const collectionGroupRef = db
    .collectionGroup(Collection.Claim)
    .where(claimerUserId, "==", userID)
    .where(lootboIDField, "==", lootboxID)
    .where(lootboxSatusField, "==", ClaimStatus_Firestore.complete)
    .where(whitelistIDField, "==", null) as CollectionGroup<Claim_Firestore>;

  const snapshot = await collectionGroupRef.get();

  if (!snapshot || snapshot.empty) {
    return [];
  } else {
    // return snapshot.docs.map((doc) => doc.ref);
    return snapshot.docs.map((doc) => doc.data());
  }
};

export const extractOrGenerateLootboxCreateInput = async (
  payload: CreateLootboxPayload,
  userIdpID: UserIdpID
): Promise<CreateLootboxRequest> => {
  let name = payload.name;
  if (!name) {
    name = await getRandomUserName({
      type: "lootbox",
    });
  }
  let backgroundImage = payload.backgroundImage;
  if (!backgroundImage) {
    backgroundImage = await getRandomBackgroundFromLexicaHardcoded();
  }
  let logoImage = payload.logo;
  if (!logoImage) {
    logoImage = await getRandomPortraitFromLexicaHardcoded();
  }
  let themeColor = payload.themeColor;
  if (!themeColor || themeColor === DEFAULT_THEME_COLOR) {
    themeColor = await retrieveRandomColor();
  }
  const trimmedName = name.replace(" ", "");
  const impliedSymbol =
    trimmedName.length < 12 ? trimmedName : trimmedName.slice(0, 12);
  return {
    lootboxDescription: payload.description || "",
    backgroundImage: backgroundImage,
    logoImage: logoImage,
    themeColor: themeColor,
    nftBountyValue: payload.nftBountyValue || "Prize",
    maxTickets: payload.maxTickets || 30,
    joinCommunityUrl: payload.joinCommunityUrl || undefined,
    symbol: impliedSymbol,
    creatorID: userIdpID as unknown as UserID,
    lootboxName: name,
    tournamentID: payload.tournamentID as TournamentID,
    type: payload.type ? (payload.type as LootboxType) : undefined,
    airdropMetadata: payload.airdropMetadata
      ? (payload.airdropMetadata as AirdropMetadataCreateInput)
      : undefined,
  };
};
