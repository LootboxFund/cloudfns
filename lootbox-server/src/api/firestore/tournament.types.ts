import {
  Address,
  LootboxID,
  StreamID,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
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
  lootboxID: LootboxID;
  creatorID: string;
  lootboxCreatorID: UserID;
  description: string;
  name: string;
  stampImage: string;
  timestamps: LootboxSnapshotTimestamps;
  status: LootboxTournamentStatus_Firestore;
  // backgroundImage: string;
  // image: string;
  // metadataDownloadUrl: string;
  // socials: LootboxSocialsWithoutEmail_Firestore;
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
