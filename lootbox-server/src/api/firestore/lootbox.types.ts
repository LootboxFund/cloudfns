import { Address, LootboxID, TournamentID, UserID } from "@wormgraph/helpers";

// TODO move to helpers
export type LootboxMintSignatureID = string & { readonly _: unique symbol };
export type LootboxMintSignatureNonce = string & { readonly _: unique symbol };

export enum LootboxVariant_Firestore {
  escrow = "escrow",
  instant = "instant",
  cosmic = "cosmic",
}

export interface LootboxMetadataV2_Firestore {
  // points to stamp image - opensea compatible
  image: string;
  // points to lootbox page on lootbox.fund - opensea compatible
  external_url: string;
  // description of the lootbox - opensea compatible
  description: string;
  // name of the lootbox - opensea compatible
  name: string;
  // hex color, must be a six-character hexadecimal without a pre-pended # - opensea compatible
  background_color: string;
  // A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA
  animation_url?: string;
  // A URL to a YouTube video - opensea compatible
  youtube_url?: string;
  lootboxCustomSchema: LootboxCustomSchemaV2;
}

export type MintWhitelistSignature_Firestore = {
  id: LootboxMintSignatureID;
  signature: string;
  signer: Address;
  whitelistedAddress: Address;
  lootboxAddress: Address;
  isRedeemed: boolean;
  timestamps: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  nonce: LootboxMintSignatureNonce;
};

export type LootboxTimestamps = {
  createdAt: number;
  indexedAt: number;
  updatedAt: number;
};

export interface Lootbox_Firestore {
  id: LootboxID;
  address: Address;
  factory: Address;
  userId: UserID;
  name: string;
  description?: string; // TODO - make this required after full cosmic roll out
  chainIdHex: string;
  variant: LootboxVariant_Firestore;
  issuer: UserID;
  timestamps: LootboxTimestamps;
  metadataDownloadUrl: string;
  metadataV2: LootboxMetadataV2_Firestore;
  /** @deprecated */
  metadata?: LootboxMetadata_Firestore;
}

export type LootboxSnapshotTimestamps = {
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

export interface LootboxSnapshot {
  address: Address;
  issuer: Address;
  description: string;

  name: string;
  stampImage: string;
  image: string;
  backgroundColor: string;
  backgroundImage: string;

  metadataDownloadUrl?: string;
  timestamps: LootboxSnapshotTimestamps;
}

export interface LootboxCustomSchemaV2 {
  version: string;
  address: Address;
  chainIdHex: string;
  chainIdDecimal: string;
  chainName: string;
  transactionHash: string;
  blockNumber: string;
  name: string;
  description: string;
  image: string;
  backgroundColor: string;
  backgroundImage: string;
  badgeImage: string;
  createdAt: number;
  lootboxThemeColor: string;
  factory: Address;
  socials: LootboxSocials;
}

export interface LootboxSocials {
  twitter?: string;
  email: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  discord?: string;
  youtube?: string;
  snapchat?: string;
  twitch?: string;
  web?: string;
}

export interface LootboxSocialsWithoutEmail_Firestore {
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  discord?: string;
  youtube?: string;
  snapchat?: string;
  twitch?: string;
  web?: string;
}

/**
 * Deprecated from here onwards mostly from Cosmic Lootbox Refactor
 */

/** @deprecated use LootboxCustomSchemaDataV2 */
export interface LootboxCustomSchemaData {
  name: string;
  description: string;
  image: string;
  backgroundColor: string;
  backgroundImage: string;
  badgeImage: string;
  targetPaybackDate?: number;
  createdAt: number;
  fundraisingTarget: string;
  fundraisingTargetMax: string;
  basisPointsReturnTarget: string;
  returnAmountTarget: string;
  pricePerShare: string;
  lootboxThemeColor: string;
  transactionHash: string;
  blockNumber: string;
  factory: Address;
  tournamentId: TournamentID;
}

/** @deprecated will be removed after cosmic refactor */
export interface LootboxChain {
  address: Address;
  title: string;
  chainIdHex: string;
  chainIdDecimal: string;
  chainName: string;
}

/** @deprecated use LootboxCustomSchemaV2 */
export interface LootboxCustomSchema {
  version: string;
  chain: LootboxChain;
  lootbox: LootboxCustomSchemaData;
  socials: LootboxSocials;
}

/** @deprecated, use LootboxMetadataV2 */
export interface LootboxMetadata_Firestore {
  // points to stamp image - opensea compatible
  image: string;
  // points to lootbox page on lootbox.fund - opensea compatible
  external_url: string;
  // description of the lootbox - opensea compatible
  description: string;
  // name of the lootbox - opensea compatible
  name: string;
  // hex color, must be a six-character hexadecimal without a pre-pended # - opensea compatible
  background_color: string;
  // A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA
  animation_url?: string;
  // A URL to a YouTube video - opensea compatible
  youtube_url?: string;
  lootboxCustomSchema: LootboxCustomSchema;
}
