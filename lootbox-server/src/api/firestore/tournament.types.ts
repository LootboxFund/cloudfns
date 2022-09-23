import { Address, StreamID, TournamentID, UserID } from "@wormgraph/helpers";
import {
  LootboxSocialsWithoutEmail_Firestore,
  LootboxSnapshotTimestamps,
} from "./lootbox.types";

// TODO move to helpers...
export type LootboxTournamentSnapshotID = string & {
  readonly _: unique symbol;
};

export interface StreamTimestamps {
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export enum LootboxTournamentStatus_Firestore {
  active,
  disabled,
  soldOut,
}

export enum StreamType_Firestore {
  facebook,
  twitch,
  discord,
  youtube,
}

export interface LootboxTournamentSnapshot_Firestore {
  id: LootboxTournamentSnapshotID;
  address: Address;
  issuer: Address;
  description: string;
  name: string;
  stampImage: string;
  image: string;
  backgroundColor: string;
  backgroundImage: string;
  metadataDownloadUrl: string;
  timestamps: LootboxSnapshotTimestamps;
  socials: LootboxSocialsWithoutEmail_Firestore;
  status: LootboxTournamentStatus_Firestore;
}

export interface Stream_Firestore {
  id: StreamID;
  creatorId: UserID;
  type: StreamType_Firestore;
  url: string;
  name: string;
  tournamentId: TournamentID;
  timestamps: StreamTimestamps;
}
