import {
  LootboxTournamentSnapshot,
  LootboxTournamentStatus,
  Stream,
  StreamType,
  Tournament,
} from "../graphql/generated/types";
import { Collection, Tournament_Firestore } from "@wormgraph/helpers";
import {
  LootboxTournamentSnapshot_Firestore,
  LootboxTournamentStatus_Firestore,
  Stream_Firestore,
  StreamType_Firestore,
} from "../api/firestore/tournament.types";
import { LootboxSocialsWithoutEmail_Firestore } from "../api/firestore/lootbox.types";

export const parseLootboxTournamentSnapshotDB = (
  data: LootboxTournamentSnapshot_Firestore
): LootboxTournamentSnapshot_Firestore => {
  const socials: LootboxSocialsWithoutEmail_Firestore = {};

  if (!!data?.socials?.twitter) {
    socials.twitter = data.socials.twitter;
  }
  if (!!data?.socials?.instagram) {
    socials.instagram = data.socials.instagram;
  }
  if (!!data?.socials?.tiktok) {
    socials.tiktok = data.socials.tiktok;
  }
  if (!!data?.socials?.facebook) {
    socials.facebook = data.socials.facebook;
  }
  if (!!data?.socials?.discord) {
    socials.discord = data.socials.discord;
  }
  if (!!data?.socials?.youtube) {
    socials.youtube = data.socials.youtube;
  }
  if (!!data?.socials?.snapchat) {
    socials.snapchat = data.socials.snapchat;
  }
  if (!!data?.socials?.twitch) {
    socials.twitch = data.socials.twitch;
  }
  if (!!data?.socials?.web) {
    socials.web = data.socials.web;
  }

  const res: LootboxTournamentSnapshot_Firestore = {
    id: data.id,
    address: data.address,
    issuer: data.issuer,
    description: data.description,
    name: data.name,
    stampImage: data.stampImage,
    image: data.image,
    backgroundColor: data.backgroundColor,
    backgroundImage: data.backgroundImage,
    metadataDownloadUrl: data.metadataDownloadUrl,
    timestamps: {
      createdAt: data.timestamps.createdAt,
      updatedAt: data.timestamps.updatedAt,
      deletedAt: data.timestamps.deletedAt,
    },
    socials,
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
    timestamps: {
      createdAt: data.timestamps.createdAt,
      updatedAt: data.timestamps.updatedAt,
      deletedAt: data.timestamps.deletedAt || null,
    },
  };

  if (data.tournamentLink) {
    res.tournamentDate = data.tournamentDate;
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
  const res: Tournament = {
    id: tournament.id,
    title: tournament.title,
    description: tournament.description,
    creatorId: tournament.creatorId,
    isPostCosmic: tournament.isPostCosmic || false,
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

  return res;
};

export const convertLootboxTournamentSnapshotDBToGQL = (
  snapshot: LootboxTournamentSnapshot_Firestore
) => {
  const socials: LootboxSocialsWithoutEmail_Firestore = {};

  if (!!snapshot?.socials?.twitter) {
    socials.twitter = snapshot.socials.twitter;
  }
  if (!!snapshot?.socials?.instagram) {
    socials.instagram = snapshot.socials.instagram;
  }
  if (!!snapshot?.socials?.tiktok) {
    socials.tiktok = snapshot.socials.tiktok;
  }
  if (!!snapshot?.socials?.facebook) {
    socials.facebook = snapshot.socials.facebook;
  }
  if (!!snapshot?.socials?.discord) {
    socials.discord = snapshot.socials.discord;
  }
  if (!!snapshot?.socials?.youtube) {
    socials.youtube = snapshot.socials.youtube;
  }
  if (!!snapshot?.socials?.snapchat) {
    socials.snapchat = snapshot.socials.snapchat;
  }
  if (!!snapshot?.socials?.twitch) {
    socials.twitch = snapshot.socials.twitch;
  }
  if (!!snapshot?.socials?.web) {
    socials.web = snapshot.socials.web;
  }

  const res: LootboxTournamentSnapshot = {
    address: snapshot.address,
    issuer: snapshot.issuer,
    description: snapshot.description,
    name: snapshot.name,
    stampImage: snapshot.stampImage,
    image: snapshot.image,
    backgroundColor: snapshot.backgroundColor,
    backgroundImage: snapshot.backgroundImage,
    metadataDownloadUrl: snapshot.metadataDownloadUrl,
    timestamps: {
      createdAt: snapshot.timestamps.createdAt,
      updatedAt: snapshot.timestamps.updatedAt,
    },
    socials,
    status: convertLootboxTournamentSnapshotStatusDBToGQL(snapshot.status),
  };

  return res;
};
