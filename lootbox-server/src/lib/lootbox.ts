import { UserID } from "@wormgraph/helpers";
import {
  LootboxMetadataV2_Firestore,
  LootboxMetadata_Firestore,
  Lootbox_Firestore,
  LootboxVariant_Firestore,
  MintWhitelistSignature_Firestore,
} from "../api/firestore/lootbox.types";
import {
  Lootbox,
  LootboxSnapshot,
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
    timestamps: data.timestamps,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    deletedAt: data.deletedAt || null,
    nonce: data.nonce,
  };

  return res;
};

export const convertLootboxMetadataV2 = (
  metadata: LootboxMetadata_Firestore
): LootboxMetadataV2_Firestore => {
  const res: LootboxMetadataV2_Firestore = {
    // points to stamp image - opensea compatible
    image: metadata.image,
    // points to lootbox page on lootbox.fund - opensea compatible
    external_url: metadata.external_url,
    // description of the lootbox - opensea compatible
    description: metadata.description,
    // name of the lootbox - opensea compatible
    name: metadata.name,
    // hex color, must be a six-character hexadecimal without a pre-pended # - opensea compatible
    background_color: metadata.background_color,
    // A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA
    lootboxCustomSchema: {
      version: metadata.lootboxCustomSchema.version,
      address: metadata.lootboxCustomSchema.chain.address,
      chainIdHex: metadata.lootboxCustomSchema.chain.chainIdHex,
      chainIdDecimal: metadata.lootboxCustomSchema.chain.chainIdDecimal,
      chainName: metadata.lootboxCustomSchema.chain.chainName,
      transactionHash: metadata.lootboxCustomSchema.lootbox.transactionHash,
      blockNumber: metadata.lootboxCustomSchema.lootbox.blockNumber,
      name: metadata.lootboxCustomSchema.lootbox.name,
      description: metadata.lootboxCustomSchema.lootbox.description,
      image: metadata.lootboxCustomSchema.lootbox.image,
      backgroundColor: metadata.lootboxCustomSchema.lootbox.backgroundColor,
      backgroundImage: metadata.lootboxCustomSchema.lootbox.backgroundImage,
      badgeImage: metadata.lootboxCustomSchema.lootbox.badgeImage,
      createdAt: metadata.lootboxCustomSchema.lootbox.createdAt,
      lootboxThemeColor: metadata.lootboxCustomSchema.lootbox.lootboxThemeColor,
      factory: metadata.lootboxCustomSchema.lootbox.factory,
      socials: metadata.lootboxCustomSchema.socials,
    },
  };
  return res;
};

export const parseLootboxDB = (
  lootbox: Lootbox_Firestore
): Lootbox_Firestore => {
  const metadataV2: LootboxMetadataV2_Firestore = !!lootbox.metadataV2
    ? lootbox.metadataV2
    : convertLootboxMetadataV2(lootbox.metadata as LootboxMetadata_Firestore);

  const lootboxDB: Lootbox_Firestore = {
    id: lootbox.id,
    userId: lootbox.userId || ("UNKNOWN" as UserID),
    address: lootbox.address,
    factory: lootbox.factory,
    name: lootbox.name,
    chainIdHex: lootbox.chainIdHex,
    variant: lootbox.variant,
    issuer: lootbox.issuer,
    timestamps: {
      createdAt: lootbox.timestamps.createdAt,
      updatedAt: lootbox.timestamps.updatedAt,
      indexedAt: lootbox.timestamps.indexedAt,
    },
    metadataDownloadUrl: lootbox.metadataDownloadUrl,
    metadataV2, // TODO expand this?
    metadata: lootbox.metadata,
  };

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

export const convertLootboxDBToGQL = (lootbox: Lootbox_Firestore): Lootbox => {
  const description: string = !!lootbox.description
    ? lootbox.description
    : !!lootbox.metadata?.description
    ? lootbox.metadata?.description // v1 compat
    : "";

  const metadataV2: LootboxMetadataV2_Firestore = !!lootbox.metadataV2
    ? lootbox.metadataV2
    : convertLootboxMetadataV2(lootbox.metadata as LootboxMetadata_Firestore);

  return {
    id: lootbox.id,
    userId: lootbox.userId || "UNKNOWN",
    address: lootbox.address,
    issuer: lootbox.issuer,
    name: lootbox.name,
    metadataDownloadUrl: lootbox.metadataDownloadUrl,
    description,
    chainIdHex: lootbox.chainIdHex,
    factory: lootbox.factory,
    variant: convertLootboxVariantDBToGQL(lootbox.variant),
    timestamps: {
      updatedAt: lootbox.timestamps.updatedAt,
      createdAt: lootbox.timestamps.createdAt,
      indexedAt: lootbox.timestamps.indexedAt,
    },
    metadataV2,
  };
};

export const convertMintWhitelistSignatureDBToGQL = (
  data: MintWhitelistSignature_Firestore
): MintWhitelistSignature => {
  const res: MintWhitelistSignature = {
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
  };

  return res;
};

/** @deprecated use convertLootboxToSnapshot */
export const convertLootboxToSnapshotOld = (data: Lootbox): LootboxSnapshot => {
  return {
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
    /** @ts-ignore */
    stampImage: data?.metadata?.image || "",
  };
};
