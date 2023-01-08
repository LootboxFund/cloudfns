import {
  LootboxTicket_Firestore,
  Lootbox_Firestore,
  LootboxVariant_Firestore,
  LootboxStatus_Firestore,
  MintWhitelistSignature_Firestore,
  LootboxType,
} from "@wormgraph/helpers";
import { LootboxDeprecated_Firestore } from "../api/firestore/lootbox.types";
import {
  Lootbox,
  LootboxSnapshot,
  LootboxStatus,
  LootboxTicket,
  LootboxVariant,
  MintWhitelistSignature,
} from "../graphql/generated/types";

export const parseMintWhitelistSignature = (
  data: MintWhitelistSignature_Firestore
): MintWhitelistSignature_Firestore => {
  const res: MintWhitelistSignature_Firestore = {
    id: data.id,
    signature: data.signature,
    signer: data.signer,
    whitelistedAddress: data.whitelistedAddress,
    lootboxAddress: data.lootboxAddress,
    isRedeemed: data.isRedeemed,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt || null,
    nonce: data.nonce,
    lootboxTicketID: data.lootboxTicketID,
    lootboxID: data.lootboxID,
    digest: data.digest,
    userID: data.userID,
    claimID: data.claimID,
    referralID: data.referralID,
  };

  return res;
};

export const convertLootboxTicketDBToGQL = (
  ticketDB: LootboxTicket_Firestore
): LootboxTicket => {
  const ticket: LootboxTicket = {
    id: ticketDB.id,
    lootboxID: ticketDB.lootboxID,
    ownerUserID: ticketDB.ownerUserID || null,
    createdAt: ticketDB.createdAt,
    updatedAt: ticketDB.updatedAt || null,

    // Web3 stuff
    lootboxAddress: ticketDB.lootboxAddress || null,
    minterUserID: ticketDB.minterUserID || null,
    minterAddress: ticketDB.minterAddress || null,
    metadataURL: ticketDB.metadataURL || null,
    mintWhitelistID: ticketDB.mintWhitelistID || null,
    stampImage: ticketDB.stampImage || null,
    ticketID: ticketDB.ticketID || null,
    nonce: ticketDB.nonce || null,
    digest: ticketDB.digest || null,
    isMinted: ticketDB.isMinted || false,
    mintedAt: ticketDB.mintedAt || null,
  };

  return ticket;
};

export const parseLootboxDB = (
  lootbox: Lootbox_Firestore
): Lootbox_Firestore => {
  const lootboxDB: Lootbox_Firestore = {
    id: lootbox.id,
    address: lootbox.address,
    factory: lootbox.factory,
    creatorAddress: lootbox.creatorAddress,
    chainIdHex: lootbox.chainIdHex,
    variant: lootbox.variant,
    creatorID: lootbox.creatorID,
    chainIdDecimal: lootbox.chainIdDecimal,
    chainName: lootbox.chainName,
    transactionHash: lootbox.transactionHash,
    blockNumber: lootbox.blockNumber,
    name: lootbox.name,
    description: lootbox.description,
    status: lootbox.status,
    nftBountyValue: lootbox.nftBountyValue,
    joinCommunityUrl: lootbox.joinCommunityUrl,
    maxTickets: lootbox.maxTickets,
    stampImage: lootbox.stampImage,
    logo: lootbox.logo,
    backgroundImage: lootbox.backgroundImage,
    themeColor: lootbox.themeColor,
    symbol: lootbox.symbol,
    baseTokenURI: lootbox.baseTokenURI,
    creationNonce: lootbox.creationNonce || null,
    tournamentID: lootbox.tournamentID,
    timestamps: {
      createdAt: lootbox.timestamps.createdAt,
      updatedAt: lootbox.timestamps.updatedAt,
      deletedAt: lootbox.timestamps.deletedAt || null,
    },
    metadata: lootbox.metadata, // deprecated, dont use
    runningCompletedClaims: lootbox.runningCompletedClaims || 0,
    type: lootbox.type,
    safetyFeatures: {
      isExclusiveLootbox: lootbox?.safetyFeatures?.isExclusiveLootbox || false,
      maxTicketsPerUser: lootbox?.safetyFeatures?.maxTicketsPerUser || 5,
    },
  };
  if (lootbox.type === LootboxType.Airdrop && lootbox.airdropMetadata) {
    // @ts-ignore
    lootboxDB.airdropMetadata = {
      lootboxID: lootbox.airdropMetadata.lootboxID,
      batch: lootbox.airdropMetadata.batch,
      offerID: lootbox.airdropMetadata.offerID,
      title: lootbox.airdropMetadata.title,
      oneLiner: lootbox.airdropMetadata.oneLiner,
      value: lootbox.airdropMetadata.value,
      instructionsLink: lootbox.airdropMetadata.instructionsLink,
      instructionsCallToAction:
        lootbox.airdropMetadata.instructionsCallToAction,
      callToActionLink: lootbox.airdropMetadata.callToActionLink,
      tournamentID: lootbox.airdropMetadata.tournamentID,
      organizerID: lootbox.airdropMetadata.organizerID,
      advertiserID: lootbox.airdropMetadata.advertiserID,
      questions: lootbox.airdropMetadata.questions,
      advertiserName: lootbox.airdropMetadata.advertiserName,
    };
  }
  return lootboxDB;
};

export const convertLootboxVariantDBToGQL = (
  variant: LootboxVariant_Firestore
): LootboxVariant => {
  switch (variant) {
    case LootboxVariant_Firestore.escrow:
      return LootboxVariant.Escrow;
    case LootboxVariant_Firestore.instant:
      return LootboxVariant.Instant;
    case LootboxVariant_Firestore.cosmic:
    default:
      return LootboxVariant.Cosmic;
  }
};

export const convertLootboxVariantGQLToDB = (
  variant: LootboxVariant
): LootboxVariant_Firestore => {
  switch (variant) {
    case LootboxVariant.Escrow:
      return LootboxVariant_Firestore.escrow;
    case LootboxVariant.Instant:
      return LootboxVariant_Firestore.instant;
    case LootboxVariant.Cosmic:
    default:
      return LootboxVariant_Firestore.cosmic;
  }
};

export const convertLootboxStatusDBToGQL = (
  status: LootboxStatus_Firestore
): LootboxStatus => {
  switch (status) {
    case LootboxStatus_Firestore.active:
      return LootboxStatus.Active;
    case LootboxStatus_Firestore.soldOut:
      return LootboxStatus.SoldOut;
    case LootboxStatus_Firestore.disabled:
    default:
      return LootboxStatus.Disabled;
  }
};

export const convertLootboxStatusGQLToDB = (
  status: LootboxStatus
): LootboxStatus_Firestore => {
  switch (status) {
    case LootboxStatus.Active:
      return LootboxStatus_Firestore.active;
    case LootboxStatus.SoldOut:
      return LootboxStatus_Firestore.soldOut;
    case LootboxStatus.Disabled:
    default:
      return LootboxStatus_Firestore.disabled;
  }
};

export const convertLootboxDBToGQL = (lootbox: Lootbox_Firestore): Lootbox => {
  if (lootbox.variant === LootboxVariant_Firestore.cosmic) {
    const data = {
      id: lootbox.id,
      address: lootbox.address,
      factory: lootbox.factory,
      creatorAddress: lootbox.creatorAddress,
      chainIdHex: lootbox.chainIdHex,
      variant: convertLootboxVariantDBToGQL(lootbox.variant),
      creatorID: lootbox.creatorID,
      timestamps: lootbox.timestamps,
      chainIdDecimal: lootbox.chainIdDecimal,
      chainName: lootbox.chainName,
      transactionHash: lootbox.transactionHash,
      blockNumber: lootbox.blockNumber,
      name: lootbox.name,
      description: lootbox.description,
      status: lootbox.status
        ? convertLootboxStatusDBToGQL(lootbox.status)
        : LootboxStatus.Disabled,
      nftBountyValue: lootbox.nftBountyValue,
      joinCommunityUrl: lootbox.joinCommunityUrl,
      maxTickets: lootbox.maxTickets,
      stampImage: lootbox.stampImage,
      logo: lootbox.logo,
      backgroundImage: lootbox.backgroundImage,
      // badgeImage: lootbox.badgeImage,
      themeColor: lootbox.themeColor,
      // version: lootbox.version,
      symbol: lootbox.symbol || "",
      baseTokenURI: lootbox.baseTokenURI || null,
      runningCompletedClaims: lootbox.runningCompletedClaims || 0,
      creationNonce: lootbox.creationNonce || null,
      type: lootbox.type,
      safetyFeatures: {
        isExclusiveLootbox:
          lootbox?.safetyFeatures?.isExclusiveLootbox || false,
        maxTicketsPerUser: lootbox?.safetyFeatures?.maxTicketsPerUser || 5,
      },
    };
    if (lootbox.type === LootboxType.Airdrop && lootbox.airdropMetadata) {
      // @ts-ignore
      data.airdropMetadata = {
        lootboxID: lootbox.airdropMetadata.lootboxID,
        batch: lootbox.airdropMetadata.batch,
        offerID: lootbox.airdropMetadata.offerID,
        title: lootbox.airdropMetadata.title,
        oneLiner: lootbox.airdropMetadata.oneLiner,
        value: lootbox.airdropMetadata.value,
        instructionsLink: lootbox.airdropMetadata.instructionsLink,
        instructionsCallToAction:
          lootbox.airdropMetadata.instructionsCallToAction,
        callToActionLink: lootbox.airdropMetadata.callToActionLink,
        tournamentID: lootbox.airdropMetadata.tournamentID,
        organizerID: lootbox.airdropMetadata.organizerID,
        advertiserID: lootbox.airdropMetadata.advertiserID,
        advertiserName: lootbox.airdropMetadata.advertiserName,
        questions: lootbox.airdropMetadata.questions,
      };
    }
    return data;
  } else {
    // this should all be removed soon
    const deprecatedLootbox = lootbox as unknown as LootboxDeprecated_Firestore; // coerce the deprecated type
    return {
      id: "",
      address: deprecatedLootbox.address,
      factory: deprecatedLootbox.factory,
      creatorAddress: "",
      creatorID: "",
      chainIdHex: deprecatedLootbox.chainIdHex,
      variant: convertLootboxVariantDBToGQL(deprecatedLootbox.variant),
      timestamps: deprecatedLootbox.timestamps,
      chainIdDecimal:
        deprecatedLootbox.metadata.lootboxCustomSchema.chain.chainIdDecimal,
      chainName: deprecatedLootbox.metadata.lootboxCustomSchema.chain.chainName,
      transactionHash:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.transactionHash,
      blockNumber:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.blockNumber,
      name: deprecatedLootbox.name,
      description:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.description,
      status: LootboxStatus.Active,
      nftBountyValue: "",
      joinCommunityUrl: "",
      maxTickets: 0,
      stampImage: deprecatedLootbox.metadata.image,
      logo: deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.image,
      backgroundImage:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.backgroundImage,
      // badgeImage:
      //   deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.badgeImage,
      themeColor:
        deprecatedLootbox.metadata.lootboxCustomSchema.lootbox.backgroundColor,
      symbol: "",
      baseTokenURI: "",
      runningCompletedClaims: lootbox.runningCompletedClaims || 0,
    };
  }
};

export const convertMintWhitelistSignatureDBToGQL = (
  data: MintWhitelistSignature_Firestore
): MintWhitelistSignature => {
  const res: MintWhitelistSignature = {
    lootboxID: data.lootboxID,
    id: data.id,
    signature: data.signature,
    signer: data.signer,
    whitelistedAddress: data.whitelistedAddress,
    lootboxAddress: data.lootboxAddress,
    isRedeemed: data.isRedeemed,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt || null,
    nonce: data.nonce,
    digest: data.digest,
    lootboxTicketID: data.lootboxTicketID,
  };

  return res;
};

/** @deprecated this abstract will be removed soon */
export const convertLootboxToSnapshot = (
  lootbox: Lootbox_Firestore | LootboxDeprecated_Firestore
): LootboxSnapshot => {
  if (lootbox.variant === LootboxVariant_Firestore.cosmic) {
    lootbox = lootbox as Lootbox_Firestore;
    return {
      id: lootbox.id,
      address: lootbox.address,
      issuer: lootbox.creatorAddress,
      name: lootbox.name,
      metadataDownloadUrl: "",
      description: lootbox.description,
      timestamps: {
        updatedAt: lootbox.timestamps.updatedAt,
        createdAt: lootbox.timestamps.createdAt,
      },
      backgroundColor: lootbox.themeColor,
      backgroundImage: lootbox.backgroundImage,
      image: lootbox.logo,
      stampImage: lootbox.stampImage,
    };
  } else {
    // DEPRECATED
    return convertLootboxToSnapshotOld(lootbox as LootboxDeprecated_Firestore);
  }
};

/** @deprecated use convertLootboxToSnapshot */
const convertLootboxToSnapshotOld = (
  data: LootboxDeprecated_Firestore
): LootboxSnapshot => {
  return {
    id: data.id,
    address: data.address,
    issuer: data.issuer,
    name: data.name,
    metadataDownloadUrl: data.metadataDownloadUrl,
    description:
      data?.metadata?.lootboxCustomSchema?.lootbox?.description || "",
    timestamps: {
      updatedAt: data.timestamps.updatedAt,
      createdAt: data.timestamps.createdAt,
    },
    backgroundColor:
      data?.metadata?.lootboxCustomSchema?.lootbox.backgroundColor || "",
    backgroundImage:
      data?.metadata?.lootboxCustomSchema?.lootbox.backgroundImage || "",
    image: data?.metadata?.lootboxCustomSchema?.lootbox.image || "",
    stampImage: data?.metadata?.image || "",
  };
};

export const isLootboxDeployed = (lootbox: Lootbox_Firestore) => {
  // return lootbox && lootbox.isContractDeployed
  return lootbox && !!lootbox.address;
};
