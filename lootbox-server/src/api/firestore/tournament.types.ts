import { StreamID, TournamentID, UserID } from "@wormgraph/helpers";

export interface StreamTimestamps {
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export enum StreamType_Firestore {
  facebook,
  twitch,
  discord,
  youtube,
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
