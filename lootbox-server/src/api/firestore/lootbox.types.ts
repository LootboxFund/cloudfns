import {
  Address,
  LootboxID,
  TournamentID,
  UserID,
  LootboxMintWhitelistID,
  LootboxVariant_Firestore,
  LootboxMintSignatureNonce,
  LootboxMetadata_Firestore,
  LootboxSocials_Firestore,
  LootboxSnapshotTimestamps,
} from "@wormgraph/helpers";

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

export enum LootboxStatus_Firestore {
  active,
  disabled,
  soldOut,
}

export type LootboxTimestamps = {
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

// export type LootboxSnapshotTimestamps = {
//   createdAt: number;
//   updatedAt: number;
//   deletedAt: number | null;
// };

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

/** @deprecated */
export type LootboxSocialsWithoutEmail_Firestore = Omit<
  LootboxSocials_Firestore,
  "email"
>;
