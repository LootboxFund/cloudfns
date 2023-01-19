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
  DepositVoucherRewardsPayload,
  VoucherDeposit,
  CreateLootboxPayload_StampMetadata,
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
  VoucherRewardID,
  VoucherRewardType,
  VoucherReward_Firestore,
  VoucherRewardStatus,
  Deposit_Firestore,
  DepositID,
  LootboxSafetyFeatures_Firestore,
  StampMetadata_Firestore,
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
import { retrieveRandomColor } from "../storage";
import {
  getRandomPortraitFromLexicaHardcoded,
  getRandomUserName,
} from "../lexica-images";
import { getRandomBackgroundFromLexicaHardcoded } from "../lexica-images/index";
import { getAdvertiser } from "./advertiser";
import { LootboxVoucherDeposits } from "../../graphql/generated/types";
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

export interface EditLootboxPayload {
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
  isExclusiveLootbox?: boolean;
  maxTicketsPerUser?: number;
}
export const editLootbox = async (
  lootboxID: LootboxID,
  payload: EditLootboxPayload
): Promise<Lootbox_Firestore> => {
  const updateRequest: Partial<Lootbox_Firestore> = {};

  if (payload.logo != undefined) {
    updateRequest.logo = payload.logo;
  }

  if (payload.name != undefined) {
    updateRequest.name = payload.name;
  }

  if (payload.description != undefined) {
    updateRequest.description = payload.description;
  }

  if (payload.nftBountyValue != undefined) {
    updateRequest.nftBountyValue = payload.nftBountyValue;
  }

  if (payload.joinCommunityUrl != undefined) {
    updateRequest.joinCommunityUrl = payload.joinCommunityUrl;
  }

  if (payload.status != undefined) {
    updateRequest.status = payload.status;
  }

  if (payload.maxTickets != undefined) {
    updateRequest.maxTickets = payload.maxTickets;
  }

  if (payload.backgroundImage != undefined) {
    updateRequest.backgroundImage = payload.backgroundImage;
  }

  if (payload.badgeImage != undefined) {
    updateRequest.name = payload.badgeImage;
  }

  if (payload.themeColor != undefined) {
    updateRequest.themeColor = payload.themeColor;
  }

  if (payload.symbol != undefined) {
    updateRequest.symbol = payload.symbol;
  }

  const safetyFeaturesFieldname: keyof Lootbox_Firestore = "safetyFeatures";
  if (payload.isExclusiveLootbox != undefined) {
    const isExclusiveLootboxFieldName: keyof LootboxSafetyFeatures_Firestore =
      "isExclusiveLootbox";
    updateRequest[`${safetyFeaturesFieldname}.${isExclusiveLootboxFieldName}`] =
      payload.isExclusiveLootbox;
  }
  if (payload.maxTicketsPerUser != undefined) {
    const maxTicketsPerUserFieldName: keyof LootboxSafetyFeatures_Firestore =
      "maxTicketsPerUser";
    updateRequest[`${safetyFeaturesFieldname}.${maxTicketsPerUserFieldName}`] =
      payload.maxTicketsPerUser;
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

export interface CreateLootboxPayloadLocalType {
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
  tournamentID?: TournamentID;
  variant: LootboxVariant_Firestore;
  type?: LootboxType;
  airdropMetadata?: AirdropMetadataCreateInput;
  maxTicketsPerUser?: number;
  isExclusiveLootbox?: boolean;
  stampMetadata?: StampMetadata_Firestore | null;
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
    tournamentID: payload.tournamentID,
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
    safetyFeatures: {
      maxTicketsPerUser: payload.maxTicketsPerUser ?? 5,
      isExclusiveLootbox: payload.isExclusiveLootbox || false,
    },
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
  if (payload.stampMetadata) {
    lootboxPayload.stampMetadata = payload.stampMetadata;
  }
  if (payload.airdropMetadata && payload.type === LootboxType.Airdrop) {
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
    const lootboxTemplate = offerInfo?.airdropMetadata?.lootboxTemplateID
      ? await getLootbox(offerInfo?.airdropMetadata?.lootboxTemplateID)
      : undefined;
    if (lootboxTemplate) {
      lootboxPayload.stampImage = lootboxTemplate.stampImage;
      lootboxPayload.logo = lootboxTemplate.logo;
      lootboxPayload.name = lootboxTemplate.name;
      lootboxPayload.description = lootboxTemplate.description;
      lootboxPayload.symbol = lootboxTemplate.symbol;
      lootboxPayload.backgroundImage = lootboxTemplate.backgroundImage;
      lootboxPayload.themeColor = lootboxTemplate.themeColor;
      lootboxPayload.joinCommunityUrl = lootboxTemplate.joinCommunityUrl;
      lootboxPayload.nftBountyValue = lootboxTemplate.nftBountyValue;
    }
    const advertiserInfo = offerInfo?.advertiserID
      ? await getAdvertiser(offerInfo.advertiserID)
      : undefined;
    const batchedName = `${payload.airdropMetadata.title} - Batch ${payload.airdropMetadata.batch}`;
    lootboxPayload.airdropMetadata = {
      batch: payload.airdropMetadata.batch,
      instructionsLink: offerInfo?.airdropMetadata?.instructionsLink,
      instructionsCallToAction:
        offerInfo?.airdropMetadata?.instructionsCallToAction,
      callToActionLink: offerInfo?.airdropMetadata?.callToActionLink,
      offerID: payload.airdropMetadata.offerID as OfferID,
      oneLiner: offerInfo?.airdropMetadata?.oneLiner || "",
      title: batchedName,
      tournamentID: payload.airdropMetadata.tournamentID
        ? (payload.airdropMetadata.tournamentID as TournamentID)
        : undefined,
      value: offerInfo?.airdropMetadata?.value || "Free Gift",
      lootboxID: lootboxRef.id as LootboxID,
      organizerID: tournamentInfo ? tournamentInfo.organizer : undefined,
      advertiserID: offerInfo?.advertiserID,
      advertiserName: advertiserInfo ? advertiserInfo.name : "",
      questions: offerInfo?.airdropMetadata?.questions || [],
    };
    lootboxPayload.name = batchedName;
    // create the lootbox first because the claims creation depends on existence of a lootbox
    // creating a claim will trigger a firestore function to increment the lootbox.runningClaimAmount
    await lootboxRef.set(lootboxPayload);

    await Promise.all(
      airdropClaimers.map(async (claim) => {
        return await createAirdropClaim(
          claim,
          lootboxPayload,
          // @ts-ignore
          payload.airdropMetadata.offerID as OfferID
        );
      })
    );
    await updateOfferBatchCount(payload.airdropMetadata.offerID as OfferID);
  } else {
    await lootboxRef.set(lootboxPayload);
  }
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

interface MockLootboxInputPayload {
  description?: string | null;
  backgroundImage?: string | null;
  logoImage?: string | null;
  themeColor?: string | null;
  nftBountyValue?: string | null;
  maxTickets?: number | null;
  joinCommunityUrl?: string;
  symbol?: string | null;
  lootboxName?: string | null;
  tournamentID: TournamentID;
  type?: LootboxType;
  airdropMetadata?: AirdropMetadataCreateInput;
  isExclusiveLootbox?: boolean;
  isStampV2?: boolean;
  stampMetadata?: CreateLootboxPayload_StampMetadata;
}

interface MockLootboxInputPayloadOutput {
  description: string;
  backgroundImage: string;
  logoImage: string;
  themeColor: string;
  nftBountyValue: string;
  maxTickets: number;
  joinCommunityUrl?: string;
  symbol: string;
  lootboxName: string;
  tournamentID: TournamentID;
  type?: LootboxType;
  airdropMetadata?: AirdropMetadataCreateInput;
  isExclusiveLootbox?: boolean;
  isStampV2?: boolean;
  stampMetadata?: CreateLootboxPayload_StampMetadata;
}

export const extractOrGenerateLootboxCreateInput = async (
  payload: MockLootboxInputPayload
): Promise<MockLootboxInputPayloadOutput> => {
  let name = payload.lootboxName;
  if (!name) {
    name = await getRandomUserName({
      type: "lootbox",
    });
  }
  let backgroundImage = payload.backgroundImage;
  if (!backgroundImage) {
    backgroundImage = await getRandomBackgroundFromLexicaHardcoded();
  }
  let logoImage = payload.logoImage;
  if (!logoImage) {
    logoImage = await getRandomPortraitFromLexicaHardcoded();
  }
  // if (!payload.logo && !payload.backgroundImage) {
  //   const { logo, background } = await getRandomLootboxImagePairingFromLexica();
  //   logoImage = logo;
  //   backgroundImage = background;
  // }
  let themeColor = payload.themeColor;
  if (!themeColor || themeColor === DEFAULT_THEME_COLOR) {
    themeColor = await retrieveRandomColor();
  }
  const trimmedName = name.replace(" ", "");
  const impliedSymbol =
    trimmedName.length < 12 ? trimmedName : trimmedName.slice(0, 12);
  return {
    description: payload.description || "",
    backgroundImage: backgroundImage,
    logoImage: logoImage,
    themeColor: themeColor,
    nftBountyValue: payload.nftBountyValue || "Prize",
    maxTickets: payload.maxTickets || 30,
    joinCommunityUrl: payload.joinCommunityUrl || undefined,
    symbol: impliedSymbol || "LOOTBOX",
    lootboxName: name,
    tournamentID: payload.tournamentID as TournamentID,
    type: payload.type ? (payload.type as LootboxType) : undefined,
    isExclusiveLootbox: payload.isExclusiveLootbox || false,
    airdropMetadata: payload.airdropMetadata
      ? (payload.airdropMetadata as AirdropMetadataCreateInput)
      : undefined,
    isStampV2: payload.isStampV2 ?? false,
    stampMetadata: payload.stampMetadata,
  };
};

export const depositVoucherRewards = async (
  payload: DepositVoucherRewardsPayload,
  userIdpID: UserIdpID
): Promise<DepositID> => {
  const lootbox = await getLootbox(payload.lootboxID as LootboxID);
  if (!lootbox) {
    throw new Error(`Lootbox ${payload.lootboxID} does not exist`);
  }
  const tournament = await getTournamentById(
    lootbox.tournamentID as TournamentID
  );
  if (!tournament) {
    throw new Error(`Tournament ${lootbox.tournamentID} does not exist`);
  }
  const parsedReuseableVouchers = parseVoucherRewardsList(
    payload.reuseableVoucher || ""
  );
  const parsedOneTimeVouchers = parseVoucherRewardsList(
    payload.oneTimeVouchers || ""
  );
  const deposit = await createVoucherDeposit({
    depositerID: userIdpID as unknown as UserID,
    lootboxID: payload.lootboxID as LootboxID,
    maxTicketSnapshot: lootbox.maxTickets,
    tournamentID: tournament.id,
    hasReuseableVoucher: parsedReuseableVouchers.length > 0,
    oneTimeVouchersCount: parsedOneTimeVouchers.length,
    voucherTitle: payload.title,
  });
  const baseMetadata = {
    title: payload.title,
    lootboxID: payload.lootboxID as LootboxID,
    depositedBy: userIdpID as unknown as UserID,
    tournamentID: tournament.id,
    offerID: payload.offerID as OfferID,
    depositID: deposit.id,
  };
  const [reuseableVoucher, ...oneTimeVouchers] = await Promise.all([
    createVoucher(parsedReuseableVouchers[0] || { url: "", code: "" }, {
      ...baseMetadata,
      type: VoucherRewardType.ReusableSource,
    }),
    ...parsedOneTimeVouchers.map((v) =>
      createVoucher(v, { ...baseMetadata, type: VoucherRewardType.OneTime })
    ),
  ]);
  return deposit.id;
};

export const parseVoucherRewardsList = (
  bulkString: string
): { url: string; code: string }[] => {
  const parsedList = bulkString.split(/[\n\r]/);

  const splitList = parsedList
    .filter((v) => v)
    .map((v) => {
      const info = v.split(",");
      const data = {
        url: "",
        code: "",
      };
      if (info[0] && isValidUrl(info[0])) {
        data["url"] = info[0];
      }
      if (info[1]) {
        data["code"] = info[1];
      }
      return data;
    });
  return splitList;
};

export const createVoucher = async (
  voucher: {
    url: string;
    code: string;
  },
  metadata: {
    title: string;
    type: VoucherRewardType;
    lootboxID: LootboxID;
    depositedBy: UserID;
    tournamentID?: TournamentID;
    offerID?: OfferID;
    depositID: DepositID;
  }
): Promise<VoucherReward_Firestore | undefined> => {
  if (!voucher.url && !voucher.code) return;
  const voucherRewardRef = db
    .collection(Collection.VoucherReward)
    .doc() as DocumentReference<VoucherReward_Firestore>;
  const voucherCreatedObjectOfSchema: VoucherReward_Firestore = {
    id: voucherRewardRef.id as VoucherRewardID,
    title: metadata.title,
    status: VoucherRewardStatus.Available,
    url: voucher.url,
    code: voucher.code.trim(),
    type: metadata.type,
    lootboxID: metadata.lootboxID,
    depositedBy: metadata.depositedBy,
    depositedDate: new Date().getTime() / 1000,
    tournamentID: metadata.tournamentID,
    offerID: metadata.offerID,
    depositID: metadata.depositID,
  };
  await voucherRewardRef.set(voucherCreatedObjectOfSchema);
  return voucherCreatedObjectOfSchema;
};

const isValidUrl = (urlString) => {
  var urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

export const createVoucherDeposit = async (payload: {
  depositerID: UserID;
  lootboxID: LootboxID;
  maxTicketSnapshot: number;
  tournamentID?: TournamentID;
  hasReuseableVoucher: boolean;
  oneTimeVouchersCount: number;
  voucherTitle: string;
}): Promise<Deposit_Firestore> => {
  const depositRef = db
    .collection(Collection.Deposit)
    .doc() as DocumentReference<Deposit_Firestore>;
  const depositCreatedObjectOfSchema: Deposit_Firestore = {
    id: depositRef.id as DepositID,
    depositerID: payload.depositerID,
    lootboxID: payload.lootboxID,
    maxTicketSnapshot: payload.maxTicketSnapshot,
    tournamentID: payload.tournamentID,
    voucherMetadata: {
      hasReuseableVoucher: payload.hasReuseableVoucher,
      oneTimeVouchersCount: payload.oneTimeVouchersCount,
      voucherTitle: payload.voucherTitle,
    },
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  };
  await depositRef.set(depositCreatedObjectOfSchema);
  return depositCreatedObjectOfSchema;
};

export const getDepositsOfLootbox = async (
  lootboxID: LootboxID,
  userID: UserID
): Promise<LootboxVoucherDeposits[]> => {
  const depositsRef = db
    .collection(Collection.Deposit)
    .where("lootboxID", "==", lootboxID) as Query<Deposit_Firestore>;

  const depositCollectionItems = await depositsRef.get();

  if (depositCollectionItems.empty) {
    return [];
  }
  const deposits = depositCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id,
      title: data.voucherMetadata?.voucherTitle || "",
      createdAt: data.createdAt,
      oneTimeVouchersCount: data.voucherMetadata?.oneTimeVouchersCount || 0,
      hasReuseableVoucher: data.voucherMetadata?.hasReuseableVoucher || false,
      isRedeemed: false,
    };
  });
  // const depositsWithRedemptionBool = await Promise.all(
  //   deposits.map((d) => {
  //     const isRedeemed = checkIfUserHasRedeemedFromDeposit(d.id, userID);
  //     return {
  //       ...d,
  //       isRedeemed,
  //     };
  //   })
  // );
  return deposits;
};

export const checkIfUserHasRedeemedFromDeposit = async (
  depositID: DepositID,
  userID: UserID
) => {
  const vouchersRef = db
    .collection(Collection.VoucherReward)
    .where("depositID", "==", depositID)
    .where("redeemedBy", "==", userID) as Query<VoucherReward_Firestore>;

  const voucherCollectionItems = await vouchersRef.get();

  if (voucherCollectionItems.empty) {
    return [];
  } else {
    return voucherCollectionItems.docs
      .map((doc) => doc.data())
      .filter((d) => d);
  }
};

export const getVoucherRewardsOfDeposit = async (depositID: DepositID) => {
  const vouchersRef = db
    .collection(Collection.VoucherReward)
    .where("depositID", "==", depositID) as Query<VoucherReward_Firestore>;

  const voucherCollectionItems = await vouchersRef.get();

  if (voucherCollectionItems.empty) {
    return [];
  } else {
    return voucherCollectionItems.docs
      .map((doc) => doc.data())
      .filter((d) => d);
  }
};

export const updateVoucherAsClaimed = async ({
  id,
  redeemedBy,
  ticketID,
}: {
  id: VoucherRewardID;
  redeemedBy: UserID;
  ticketID: LootboxTicketID;
}): Promise<VoucherReward_Firestore> => {
  const voucherRef = db
    .collection(Collection.VoucherReward)
    .doc(id) as DocumentReference<VoucherReward_Firestore>;
  const voucherSnapshot = await voucherRef.get();
  if (!voucherSnapshot.exists) {
    throw Error(`VoucherReward ${id} does not exist!`);
  }
  const updatePayload: Partial<VoucherReward_Firestore> = {
    redeemedBy,
    redeemedDate: new Date().getTime() / 1000,
    ticketID: ticketID as LootboxTicketID,
    status: VoucherRewardStatus.Redeemed,
  };
  // until done
  await voucherRef.update(updatePayload);
  return (await voucherRef.get()).data() as VoucherReward_Firestore;
};

export const cloneReuseableVoucher = async ({
  id,
  userID,
  ticketID,
}: {
  userID: UserID;
  id: VoucherRewardID;
  ticketID: LootboxTicketID;
}): Promise<VoucherReward_Firestore> => {
  const voucherRef = db
    .collection(Collection.VoucherReward)
    .doc(id) as DocumentReference<VoucherReward_Firestore>;
  const userSnapshot = await voucherRef.get();
  const existingVoucher = userSnapshot.data() as VoucherReward_Firestore;
  const cloneRef = db
    .collection(Collection.VoucherReward)
    .doc() as DocumentReference<VoucherReward_Firestore>;
  const cloneObjectOfSchema: VoucherReward_Firestore = {
    ...existingVoucher,
    id: cloneRef.id as VoucherRewardID,
    redeemedBy: userID,
    redeemedDate: new Date().getTime() / 1000,
    ticketID: ticketID as LootboxTicketID,
    type: VoucherRewardType.ReusableCloned,
    status: VoucherRewardStatus.Redeemed,
  };
  await cloneRef.set(cloneObjectOfSchema);
  return cloneObjectOfSchema;
};

export const getVoucherForDepositForFan = async ({
  depositID,
  ticketID,
  userID,
}: {
  depositID: DepositID;
  ticketID: LootboxTicketID;
  userID: UserID;
}): Promise<VoucherDeposit | undefined> => {
  // 0. Check that there is a Ticket with matching user and lootbox
  // 1. Get VoucherRewards matching voucher.deposit
  const [vouchers, deposit] = await Promise.all([
    getVoucherRewardsOfDeposit(depositID),
    getDeposit(depositID),
  ]);
  if (!deposit) {
    throw Error(`Deposit ${depositID} does not exist!`);
  }
  const ticket = await getTicket(deposit.lootboxID, ticketID);
  if (!ticket) {
    throw Error(`Ticket ${ticketID} does not exist!`);
  }
  if (ticket.ownerUserID !== userID) {
    throw Error(`Ticket ${ticketID} does not belong to user ${userID}!`);
  }
  // 2. Filter for existance of existing voucher via voucher.ticketID && voucher.redeemedBy
  // 2a. If voucher.ticketID && voucher.redeemedBy exists, return Voucher as Redeemed
  const existingVoucher = vouchers.find((v) => v.ticketID && v.redeemedBy);
  if (existingVoucher) {
    return {
      id: existingVoucher.id,
      title: existingVoucher.title,
      code: existingVoucher.code,
      url: existingVoucher.url,
      isRedeemed: true,
    };
  }
  // 2b. If not voucher.ticketID || voucher.redeemedBy, return first one-time Voucher as Available (and mark it redeemed)
  const firstFreeOneTime = vouchers.find(
    (v) => !v.ticketID && !v.redeemedBy && v.type === VoucherRewardType.OneTime
  );
  if (firstFreeOneTime) {
    await updateVoucherAsClaimed({
      id: firstFreeOneTime.id,
      redeemedBy: userID,
      ticketID,
    });
    return {
      id: firstFreeOneTime.id,
      title: firstFreeOneTime.title,
      code: firstFreeOneTime.code,
      url: firstFreeOneTime.url,
      isRedeemed: false,
    };
  }
  // 3. If no one-time VoucherRewards are available, return a reuseable VoucherReward
  const firstFreeReuseable = vouchers.find(
    (v) => v.type === VoucherRewardType.ReusableSource
  );
  if (firstFreeReuseable) {
    const voucher = await cloneReuseableVoucher({
      id: firstFreeReuseable.id,
      userID,
      ticketID,
    });
    return {
      id: voucher.id,
      title: voucher.title,
      code: voucher.code,
      url: voucher.url,
      isRedeemed: false,
    };
  }
  // 3. If no VoucherRewards are available, throw Error
  throw Error(`No VoucherRewards available for this deposit ${depositID}`);
};

export const getDeposit = async (
  id: DepositID
): Promise<Deposit_Firestore | undefined> => {
  const depositRef = db
    .collection(Collection.Deposit)
    .doc(id) as DocumentReference<Deposit_Firestore>;

  const depositSnapshot = await depositRef.get();

  if (!depositSnapshot.exists) {
    return undefined;
  } else {
    return depositSnapshot.data();
  }
};
