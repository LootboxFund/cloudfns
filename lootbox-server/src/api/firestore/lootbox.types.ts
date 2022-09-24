import {
  Address,
  ClaimID,
  LootboxID,
  TournamentID,
  UserID,
  LootboxMintWhitelistID,
  LootboxMintSignatureNonce,
  LootboxTicketID,
  LootboxTicketID_Web3,
} from "@wormgraph/helpers";

export enum LootboxVariant_Firestore {
  escrow = "escrow",
  instant = "instant",
  cosmic = "cosmic",
}

export interface LootboxTicketMetadataV2_Firestore {
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
  lootboxCustomSchema: LootboxTicketCustomSchemaV2;
}

export type MintWhitelistSignature_Firestore = {
  id: LootboxMintWhitelistID;
  signature: string;
  signer: Address;
  whitelistedAddress: Address;
  lootboxAddress: Address;
  isRedeemed: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  nonce: LootboxMintSignatureNonce;
};

export type LootboxTimestamps = {
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

export enum LootboxStatus_Firestore {
  active,
  disabled,
  soldOut,
}

export interface LootboxTicket_Firestore {
  id: LootboxTicketID;
  lootboxID: LootboxID;
  lootboxAddress: Address;
  ticketID: LootboxTicketID_Web3;
  minterUserID: UserID;
  minterAddress: Address;
  mintWhitelistID: LootboxMintWhitelistID;
  createdAt: number;
  stampImage: string;
  metadataURL: string;
  claimID: ClaimID | null;
}

export interface Lootbox_Firestore {
  // Immutable
  id: LootboxID;
  address: Address;
  factory: Address;
  creatorID: UserID;
  creatorAddress: Address;
  chainIdHex: string;
  variant: LootboxVariant_Firestore;
  issuer: UserID;
  chainIdDecimal: string;
  chainName: string;
  transactionHash: string;
  blockNumber: string;
  version: string;
  stampImage: string;

  // Mutable
  logo: string;
  name: string;
  description: string;
  nftBountyValue?: string;
  joinCommunityUrl?: string;
  status?: LootboxStatus_Firestore;
  maxTickets: number;
  backgroundImage: string;
  badgeImage?: string;
  themeColor: string;
  socials: LootboxSocials_Firestore;

  timestamps: LootboxTimestamps;
  // metadataDownloadUrl: string;
  // metadataV2: LootboxMetadataV2_Firestore;
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

export interface LootboxTicketCustomSchemaV2 {
  version: string;
  address: Address;
  chainIdHex: string;
  chainIdDecimal: string;
  chainName: string;
  transactionHash: string;
  blockNumber: string;
  name: string;
  description: string;
  logo: string;
  themeColor: string;
  backgroundImage: string;
  badgeImage?: string;
  createdAt: number;
  lootboxThemeColor: string;
  factory: Address;
  socials: LootboxSocials_Firestore;
  ticketID: LootboxTicketID_Web3;
}

export interface LootboxSocials_Firestore {
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

export type LootboxSocialsWithoutEmail_Firestore = Omit<
  LootboxSocials_Firestore,
  "email"
>;

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
  socials: LootboxSocials_Firestore;
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

/** @deprecated will eventually be removed after cosmic */
export type LootboxDeprecated_Firestore = {
  address: Address;
  factory: Address;
  tournamentId: TournamentID;
  name: string;
  chainIdHex: string;
  variant: LootboxVariant_Firestore;

  issuer: UserID;
  treasury: Address;
  targetSharesSold: string;
  maxSharesSold: string;

  timestamps: {
    createdAt: number;
    indexedAt: number;
    updatedAt: number;
  };

  // # Metadata
  metadataDownloadUrl: string;
  metadata: LootboxMetadata_Firestore;
};
