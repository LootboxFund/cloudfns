import {
  LootboxTournamentSnapshot,
  LootboxTournamentStatus,
  Stream,
  StreamType,
  Tournament,
} from "../graphql/generated/types";
import {
  Tournament_Firestore,
  LootboxTournamentSnapshot_Firestore,
  LootboxTournamentStatus_Firestore,
} from "@wormgraph/helpers";
import {
  Stream_Firestore,
  StreamType_Firestore,
} from "../api/firestore/tournament.types";

export const parseLootboxTournamentSnapshotDB = (
  data: LootboxTournamentSnapshot_Firestore
): LootboxTournamentSnapshot_Firestore => {
  const res: LootboxTournamentSnapshot_Firestore = {
    id: data.id,
    address: data.address,
    lootboxCreatorID: data.lootboxCreatorID,
    creatorID: data.creatorID,
    lootboxID: data.lootboxID,
    tournamentID: data.tournamentID,
    impressionPriority: data.impressionPriority,
    description: data.description,

    name: data.name,
    stampImage: data.stampImage,
    // image: data.image,
    // backgroundColor: data.backgroundColor,
    // backgroundImage: data.backgroundImage,
    // metadataDownloadUrl: data.metadataDownloadUrl,
    timestamps: {
      createdAt: data.timestamps.createdAt,
      updatedAt: data.timestamps.updatedAt,
      deletedAt: data.timestamps.deletedAt,
      depositEmailSentAt: data.timestamps.depositEmailSentAt || null,
    },
    // socials,
    status: data.status || LootboxTournamentStatus_Firestore.disabled,
  };

  return res;
};

export const parseTournamentDB = (
  data: Tournament_Firestore
): Tournament_Firestore => {
  const res: Tournament_Firestore = {
    id: data.id,
    title: data.title,
    description: data.description,
    creatorId: data.creatorId,
    isPostCosmic: data.isPostCosmic || false,
    runningCompletedClaims: data.runningCompletedClaims || 0,
    timestamps: {
      createdAt: data.timestamps.createdAt,
      updatedAt: data.timestamps.updatedAt,
      deletedAt: data.timestamps.deletedAt || null,
    },
  };

  if (data.coverPhoto) {
    res.coverPhoto = data.coverPhoto;
  }
  if (data.tournamentLink) {
    res.tournamentDate = data.tournamentDate;
  }
  if (data.offers) {
    res.offers = data.offers;
  }

  return res;
};

export const parseTournamentStreamDB = (
  stream: Stream_Firestore
): Stream_Firestore => {
  const res: Stream_Firestore = {
    id: stream.id,
    creatorId: stream.creatorId,
    type: stream.type,
    url: stream.url,
    name: stream.name,
    tournamentId: stream.tournamentId,
    timestamps: {
      createdAt: stream.timestamps.createdAt,
      updatedAt: stream.timestamps.updatedAt,
      deletedAt: stream.timestamps.deletedAt || null,
    },
  };

  return stream;
};

export const convertLootboxTournamentSnapshotStatusGQLToDB = (
  status: LootboxTournamentStatus
): LootboxTournamentStatus_Firestore => {
  switch (status) {
    case LootboxTournamentStatus.Active:
      return LootboxTournamentStatus_Firestore.active;
    case LootboxTournamentStatus.Disabled:
    default:
      return LootboxTournamentStatus_Firestore.disabled;
  }
};

export const convertLootboxTournamentSnapshotStatusDBToGQL = (
  type: LootboxTournamentStatus_Firestore
): LootboxTournamentStatus => {
  switch (type) {
    case LootboxTournamentStatus_Firestore.active:
      return LootboxTournamentStatus.Active;
    case LootboxTournamentStatus_Firestore.disabled:
    default:
      return LootboxTournamentStatus.Disabled;
  }
};

export const convertStreamDBToGQL = (stream: Stream_Firestore): Stream => {
  return {
    id: stream.id,
    creatorId: stream.creatorId,
    type: convertStreamTypeDBToGQL(stream.type),
    url: stream.url,
    name: stream.name,
    tournamentId: stream.tournamentId,
    timestamps: {
      createdAt: stream.timestamps.createdAt,
      updatedAt: stream.timestamps.updatedAt,
      deletedAt: stream.timestamps.deletedAt || null,
    },
  };
};

export const convertStreamTypeDBToGQL = (
  type: StreamType_Firestore
): StreamType => {
  switch (type) {
    case StreamType_Firestore.discord:
      return StreamType.Discord;
    case StreamType_Firestore.facebook:
      return StreamType.Facebook;
    case StreamType_Firestore.twitch:
      return StreamType.Twitch;
    case StreamType_Firestore.youtube:
    default:
      return StreamType.Youtube;
  }
};

export const convertStreamTypeGQLToDB = (
  type: StreamType
): StreamType_Firestore => {
  switch (type) {
    case StreamType.Discord:
      return StreamType_Firestore.discord;
    case StreamType.Facebook:
      return StreamType_Firestore.facebook;
    case StreamType.Twitch:
      return StreamType_Firestore.twitch;
    case StreamType.Youtube:
    default:
      return StreamType_Firestore.youtube;
  }
};

export const convertTournamentDBToGQL = (
  tournament: Tournament_Firestore
): Tournament => {
  const res: Omit<Tournament, "dealConfigs"> = {
    id: tournament.id,
    title: tournament.title,
    description: tournament.description,
    creatorId: tournament.creatorId,
    isPostCosmic: tournament.isPostCosmic || false,
    runningCompletedClaims: tournament?.runningCompletedClaims || 0,
    timestamps: {
      createdAt: tournament.timestamps.createdAt,
      updatedAt: tournament.timestamps.updatedAt,
      deletedAt: tournament.timestamps.deletedAt || null,
    },
  };

  if (!!tournament.magicLink) {
    res.magicLink = tournament.magicLink;
  }

  if (!!tournament.tournamentDate) {
    res.tournamentDate = tournament.tournamentDate;
  }

  if (!!tournament.prize) {
    res.prize = tournament.prize;
  }

  if (!!tournament.coverPhoto) {
    res.coverPhoto = tournament.coverPhoto;
  }

  if (!!tournament.communityURL) {
    res.communityURL = tournament.communityURL;
  }

  if (!!tournament.tournamentLink) {
    res.tournamentLink = tournament.tournamentLink;
  }

  return res as unknown as Tournament;
};

export const convertLootboxTournamentSnapshotDBToGQL = (
  snapshot: LootboxTournamentSnapshot_Firestore
) => {
  const res: LootboxTournamentSnapshot = {
    id: snapshot.id,
    address: snapshot.address,
    lootboxID: snapshot.lootboxID,
    creatorID: snapshot.creatorID,
    lootboxCreatorID: snapshot.lootboxCreatorID,
    description: snapshot.description,
    name: snapshot.name,
    stampImage: snapshot.stampImage,
    impressionPriority: snapshot.impressionPriority || 0,
    // image: snapshot.image,
    // backgroundColor: snapshot.backgroundColor,
    // backgroundImage: snapshot.backgroundImage,
    // metadataDownloadUrl: snapshot.metadataDownloadUrl,
    timestamps: {
      createdAt: snapshot.timestamps.createdAt,
      updatedAt: snapshot.timestamps.updatedAt,
      depositEmailSentAt: snapshot.timestamps.depositEmailSentAt || null,
    },
    // socials,
    status: convertLootboxTournamentSnapshotStatusDBToGQL(snapshot.status),
  };

  return res;
};
