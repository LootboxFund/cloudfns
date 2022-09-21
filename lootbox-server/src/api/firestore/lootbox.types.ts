import {
  Address,
  PartyBasketID,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
import { LootboxTournamentStatus } from "./tournament.types";

export enum LootboxVariant {
  escrow = "escrow",
  instant = "instant",
}

export interface LootboxChain {
  address: Address;
  title: string;
  chainIdHex: string;
  chainIdDecimal: string;
  chainName: string;
}

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

export interface LootboxSocialsWithoutEmail {
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

export interface LootboxCustomSchema {
  version: string;
  chain: LootboxChain;
  lootbox: LootboxCustomSchemaData;
  socials: LootboxSocials;
}

export interface LootboxMetadata {
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

export type LootboxTimestamps = {
  createdAt: number;
  indexedAt: number;
  updatedAt: number;
};

export type TournamentMetadata = {
  status: LootboxTournamentStatus;
};

export interface Lootbox_Firestore {
  address: Address;
  factory: Address;
  tournamentId?: TournamentID;
  name: string;
  chainIdHex: string;
  variant: LootboxVariant;

  issuer: UserID;
  treasury: UserID;
  targetSharesSold: string;
  maxSharesSold: string;

  // From Block Trigger Event
  timestamps: LootboxTimestamps;

  // Metadata
  metadataDownloadUrl?: string;
  metadata: LootboxMetadata;

  tournamentMetadata?: TournamentMetadata;
  partyBaskets?: PartyBasketID[];
}

export type LootboxSnapshotTimestamps = {
  createdAt: number;
  updatedAt: number;
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
