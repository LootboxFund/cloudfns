import {
  CollectionReference,
  DocumentReference,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import {
  BattleFeedEdge,
  LootboxTournamentSnapshot,
  PageInfo,
  StreamInput,
  EditStreamPayload,
  StreamType,
  LootboxTournamentStatus,
  PaginateLootboxTournamentSnapshotEdge,
  PaginatedLootboxTournamentSnapshotPageInfo,
  LootboxTournamentSnapshotCursor,
} from "../../graphql/generated/types";
import {
  UserID,
  UserIdpID,
  TournamentID,
  StreamID,
  AffiliateID,
  LootboxID,
  LootboxTournamentStatus_Firestore,
  LootboxType,
  TournamentPrivacyScope,
  TournamentSafetyFeatures_Firestore,
  TournamentVisibility_Firestore,
  EventInviteSlug,
  StampMetadata,
} from "@wormgraph/helpers";
import {
  Collection,
  Tournament_Firestore,
  LootboxTournamentSnapshot_Firestore,
  LootboxTournamentSnapshotID,
} from "@wormgraph/helpers";
import { Stream_Firestore } from "./tournament.types";
import {
  parseTournamentStreamDB,
  parseTournamentDB,
  convertTournamentDBToGQL,
  parseLootboxTournamentSnapshotDB,
  convertStreamTypeGQLToDB,
  convertLootboxTournamentSnapshotDBToGQL,
} from "../../lib/tournament";
import { LootboxDeprecated_Firestore } from "./lootbox.types";
import { getRandomEventCoverFromLexicaHardcoded } from "../lexica-images";

export const getTournamentById = async (
  id: TournamentID
): Promise<Tournament_Firestore | undefined> => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(id) as DocumentReference<Tournament_Firestore>;

  const tournamentSnapshot = await tournamentRef.get();

  if (!tournamentSnapshot.exists) {
    return undefined;
  } else {
    const data = tournamentSnapshot.data();
    return data === undefined ? undefined : parseTournamentDB(data);
  }
};

export const paginateLootboxSnapshotsForTournament = async (
  tournamentID: TournamentID,
  limit: number,
  cursor?: LootboxTournamentSnapshotCursor // Created at timestamp
): Promise<{
  totalCount: number;
  edges: PaginateLootboxTournamentSnapshotEdge[];
  pageInfo: PaginatedLootboxTournamentSnapshotPageInfo;
}> => {
  const lootboxTournamentSnapshotsRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID)
    .collection(Collection.LootboxTournamentSnapshot)
    .orderBy("impressionPriority", "desc")
    .orderBy(
      "timestamps.createdAt",
      "desc"
    ) as Query<LootboxTournamentSnapshot_Firestore>;

  const lootboxTournamentSnapshotsQuery = cursor
    ? lootboxTournamentSnapshotsRef.startAfter(
        Number(cursor.impression),
        Number(cursor.createdAt)
      )
    : lootboxTournamentSnapshotsRef;

  const lootboxTournamentSnapshots = await lootboxTournamentSnapshotsQuery
    .limit(limit)
    .get();

  const edges: PaginateLootboxTournamentSnapshotEdge[] = [];
  let totalCount = 0;

  for (const lootboxTournamentSnapshot of lootboxTournamentSnapshots.docs) {
    const data = lootboxTournamentSnapshot.data();
    if (data) {
      edges.push({
        cursor: data.id,
        // TODO: fix with this:
        // cursor: {
        //   impression: data.impressionPriority,
        //   createdAt: data.timestamps.createdAt,
        // },
        node: convertLootboxTournamentSnapshotDBToGQL(data),
      });
    }
  }

  totalCount = edges.length;

  const lastNode = edges[edges.length - 1];

  const pageInfo: PaginatedLootboxTournamentSnapshotPageInfo = {
    hasNextPage: totalCount === limit,
    // startCursor: edges[0]?.cursor || null,
    // TODO: uncomment this:
    // endCursor: lastNode?.cursor || null,
    endCursor: null, // TEMPORARY HACK FOR BACKWARDS COMPATIBILITY
  };

  return {
    totalCount,
    edges,
    pageInfo,
  };
};

export const getLootboxTournamentSnapshotByLootboxID = async (
  tournamentID: TournamentID,
  lootboxID: LootboxID
): Promise<LootboxTournamentSnapshot_Firestore | undefined> => {
  const lootboxIDFieldName: keyof LootboxTournamentSnapshot_Firestore =
    "lootboxID";
  const lootboxTournamentSnapshotRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID)
    .collection(Collection.LootboxTournamentSnapshot)
    .where(lootboxIDFieldName, "==", lootboxID)
    .limit(1) as Query<LootboxTournamentSnapshot_Firestore>;

  const lootboxTournamentSnapshot = await lootboxTournamentSnapshotRef.get();

  if (lootboxTournamentSnapshot.empty) {
    return undefined;
  } else {
    const data = lootboxTournamentSnapshot.docs[0].data();
    return data === undefined
      ? undefined
      : parseLootboxTournamentSnapshotDB(data);
  }
};

export const getLootboxSnapshotsForTournament = async (
  tournamentID: TournamentID,
  status: LootboxTournamentStatus_Firestore | null
): Promise<LootboxTournamentSnapshot_Firestore[]> => {
  const impressionPriorityFieldName: keyof LootboxTournamentSnapshot_Firestore =
    "impressionPriority";
  const statusFieldName: keyof LootboxTournamentSnapshot_Firestore = "status";

  let query: Query<LootboxTournamentSnapshot_Firestore> = db
    .collection(Collection.Tournament)
    .doc(tournamentID)
    .collection(Collection.LootboxTournamentSnapshot)
    .orderBy(impressionPriorityFieldName, "desc")
    .orderBy(
      "timestamps.createdAt",
      "desc"
    ) as Query<LootboxTournamentSnapshot_Firestore>;

  if (status) {
    query = query.where(statusFieldName, "==", status);
  }

  const collectionSnapshot = await query.get();

  if (collectionSnapshot.empty) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => {
      const data = doc.data();
      return parseLootboxTournamentSnapshotDB(data);
    });
  }
};

export const getStreamById = async (
  id: StreamID
): Promise<Stream_Firestore | undefined> => {
  const streamRef = db
    .collectionGroup(Collection.Stream)
    .where("id", "==", id)
    .limit(1) as Query<Stream_Firestore>;

  const streamSnapshot = await streamRef.get();

  if (streamSnapshot.empty) {
    return undefined;
  } else {
    const doc = streamSnapshot.docs[0];
    return parseTournamentStreamDB(doc.data());
  }
};

export const deleteStream = async (
  streamId: StreamID,
  tournamentId: TournamentID
): Promise<Stream_Firestore> => {
  const streamRef = db
    .collection(Collection.Tournament)
    .doc(tournamentId)
    .collection(Collection.Stream)
    .doc(streamId) as DocumentReference<Stream_Firestore>;

  await streamRef.update(
    "timestamps.deletedAt",
    Timestamp.now().toMillis() // soft delete
  );

  return parseTournamentStreamDB(
    (await streamRef.get()).data() as Stream_Firestore
  );
};

export const getTournamentStreams = async (
  tournamentID: TournamentID
): Promise<Stream_Firestore[]> => {
  const collectionRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID)
    .collection(Collection.Stream)
    .where("timestamps.deletedAt", "==", null) as Query<Stream_Firestore>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => {
      return parseTournamentStreamDB(doc.data());
    });
  }
};

export const createTournamentStreams = async (
  userId: UserID | UserIdpID,
  tournamentId: TournamentID,
  streams: (StreamInput | EditStreamPayload)[]
): Promise<Stream_Firestore[]> => {
  const streamCollection = db
    .collection(Collection.Tournament)
    .doc(tournamentId)
    .collection(Collection.Stream) as CollectionReference<Stream_Firestore>;

  const createdStreams: Stream_Firestore[] = [];

  for (const stream of streams) {
    const streamRef = streamCollection.doc();
    const documentToWrite: Stream_Firestore = {
      creatorId: userId as UserID,
      type: convertStreamTypeGQLToDB(stream.type),
      url: stream.url,
      name: stream.name,
      id: streamRef.id as StreamID,
      tournamentId: tournamentId,
      timestamps: {
        createdAt: Timestamp.now().toMillis(),
        updatedAt: Timestamp.now().toMillis(),
        deletedAt: null,
      },
    };

    await streamRef.set(documentToWrite);
    createdStreams.push(documentToWrite);
  }
  // const batch = db.batch();
  // const createdStreams: Stream[] = [];
  // streams.forEach((stream) => {
  //   const streamRef = streamCollection.doc();
  //   const streamDocumentData: Stream = {
  //     creatorId: userId,
  //     type: stream.type,
  //     url: stream.url,
  //     name: stream.name,
  //     id: streamRef.id,
  //     tournamentId: tournamentId,
  //     timestamps: {
  //       createdAt: Timestamp.now().toMillis(),
  //       updatedAt: Timestamp.now().toMillis(),
  //       deletedAt: null,
  //     },
  //   };
  //   batch.set(streamRef, streamDocumentData);
  //   createdStreams.push(streamDocumentData);
  // });
  // await batch.commit();
  return createdStreams;
};

interface UpdateStreamPayload {
  type: StreamType;
  url: String;
  name: String;
}
export const updateStream = async (
  streamId: StreamID,
  tournamentId: TournamentID,
  stream: UpdateStreamPayload
): Promise<Stream_Firestore> => {
  const streamRef = db
    .collection(Collection.Tournament)
    .doc(tournamentId)
    .collection(Collection.Stream)
    .doc(streamId) as DocumentReference<Stream_Firestore>;

  await streamRef.update({
    type: stream.type,
    url: stream.url,
    name: stream.name,
    "timestamps.updatedAt": Timestamp.now().toMillis(), // soft delete
  });

  return parseTournamentStreamDB(
    (await streamRef.get()).data() as Stream_Firestore
  );
};

export interface CreateTournamentArgs {
  title: string;
  description: string;
  tournamentLink?: string | null;
  creatorId: UserID;
  prize?: string | null;
  coverPhoto?: string | null;
  tournamentDate?: number;
  communityURL?: string | null;
  organizer?: AffiliateID;
  privacyScope?: TournamentPrivacyScope[];
  seedMaxLootboxTicketsPerUser?: number;
  maxTicketsPerUser?: number;
  inviteSlug: EventInviteSlug;
}

export const createTournament = async ({
  title,
  description,
  tournamentLink,
  creatorId,
  prize,
  coverPhoto,
  tournamentDate,
  communityURL,
  organizer,
  privacyScope,
  inviteSlug,
  seedMaxLootboxTicketsPerUser = 5,
  maxTicketsPerUser = 100,
}: CreateTournamentArgs): Promise<Tournament_Firestore> => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc() as DocumentReference<Tournament_Firestore>;
  const placeholderImageTournament =
    await getRandomEventCoverFromLexicaHardcoded();

  const tournament: Tournament_Firestore = {
    id: tournamentRef.id as TournamentID,
    title,
    description: description || "",
    creatorId: creatorId as UserID,
    isPostCosmic: true,
    coverPhoto: coverPhoto || placeholderImageTournament,
    privacyScope: privacyScope || [],
    playbookUrl: "https://lootbox.fyi/playbook",
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
    },
    safetyFeatures: {
      seedMaxLootboxTicketsPerUser: seedMaxLootboxTicketsPerUser,
      maxTicketsPerUser: maxTicketsPerUser,
    },
    visibility: TournamentVisibility_Firestore.Private,
    runningCompletedClaims: 0,
    inviteMetadata: {
      slug: inviteSlug,
      maxPlayerLootbox: 1,
      maxPromoterLootbox: 1,
    },
  };

  if (!!prize) {
    tournament.prize = prize;
  }

  if (!!tournamentLink) {
    tournament.tournamentLink = tournamentLink;
  }

  if (!!tournamentDate) {
    tournament.tournamentDate = Number(tournamentDate);
  } else {
    tournament.tournamentDate = Number(new Date().getTime());
  }

  if (!!communityURL) {
    tournament.communityURL = communityURL;
  }

  if (!!organizer) {
    tournament.organizer = organizer;
  }

  await tournamentRef.set(tournament);

  return tournament;
};

export interface UpdateTournamentPayload {
  communityURL?: string | null;
  coverPhoto?: string | null;
  description?: string | null;
  magicLink?: string | null;
  maxTicketsPerUser?: number | null;
  playbookUrl?: string | null;
  privacyScope?: TournamentPrivacyScope[] | null;
  prize?: string | null;
  seedMaxLootboxTicketsPerUser?: number | null;
  title?: string | null;
  tournamentDate?: number | null;
  tournamentLink?: string | null;
  visibility?: TournamentVisibility_Firestore | null;
  maxPlayerLootboxes?: number | null;
  maxPromoterLootboxes?: number | null;
  // playerDestinationURL?: string | null;
  // promoterDestinationURL?: string | null;
  seedLootboxLogoURLs?: string[] | null;
  seedLootboxFanTicketPrize?: string | null;
  playerDestinationURL?: string | null;
  promoterDestinationURL?: string | null;
}
export const updateTournament = async (
  id: TournamentID,
  payload: UpdateTournamentPayload
): Promise<Tournament_Firestore> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }

  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(id) as DocumentReference<Tournament_Firestore>;

  const updatePayload: Partial<Tournament_Firestore> = {};

  if (payload.title != undefined) {
    updatePayload.title = payload.title;
  }

  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }

  if (payload.tournamentLink != undefined) {
    updatePayload.tournamentLink = payload.tournamentLink;
  }

  if (payload.magicLink != undefined) {
    updatePayload.magicLink = payload.magicLink;
  }

  if (payload.coverPhoto != undefined) {
    updatePayload.coverPhoto = payload.coverPhoto;
  }

  if (payload.prize != undefined) {
    updatePayload.prize = payload.prize;
  }

  if (payload.tournamentDate != undefined) {
    updatePayload.tournamentDate = Number(payload.tournamentDate);
  }

  if (payload.communityURL != undefined) {
    updatePayload.communityURL = payload.communityURL;
  }

  if (payload.playbookUrl != undefined) {
    updatePayload.playbookUrl = payload.playbookUrl;
  }

  if (payload.privacyScope != undefined) {
    updatePayload.privacyScope = payload.privacyScope;
  }

  if (payload.visibility != undefined) {
    updatePayload.visibility = payload.visibility;
  }

  const safetyFeaturesFieldname: keyof Tournament_Firestore = "safetyFeatures";

  if (payload.seedMaxLootboxTicketsPerUser != undefined) {
    const seedMaxLootboxTicketsPerUser: keyof TournamentSafetyFeatures_Firestore =
      "seedMaxLootboxTicketsPerUser";
    updatePayload[
      `${safetyFeaturesFieldname}.${seedMaxLootboxTicketsPerUser}`
    ] = payload.seedMaxLootboxTicketsPerUser;
  }

  if (payload.maxTicketsPerUser != undefined) {
    const maxTicketsFieldname: keyof TournamentSafetyFeatures_Firestore =
      "maxTicketsPerUser";
    updatePayload[`${safetyFeaturesFieldname}.${maxTicketsFieldname}`] =
      payload.maxTicketsPerUser;
  }

  const inviteMetadataFieldName: keyof Tournament_Firestore = "inviteMetadata";
  if (payload.maxPlayerLootboxes != undefined) {
    const maxPlayerLootboxFieldName: keyof Tournament_Firestore["inviteMetadata"] =
      "maxPlayerLootbox";
    updatePayload[`${inviteMetadataFieldName}.${maxPlayerLootboxFieldName}`] =
      payload.maxPlayerLootboxes;
  }

  if (payload.maxPromoterLootboxes != undefined) {
    const maxPromoterLootboxFieldName: keyof Tournament_Firestore["inviteMetadata"] =
      "maxPromoterLootbox";
    updatePayload[`${inviteMetadataFieldName}.${maxPromoterLootboxFieldName}`] =
      payload.maxPromoterLootboxes;
  }

  if (payload.playerDestinationURL !== undefined) {
    const playerDestinationURLFieldName: keyof Tournament_Firestore["inviteMetadata"] =
      "playerDestinationURL";
    updatePayload[
      `${inviteMetadataFieldName}.${playerDestinationURLFieldName}`
    ] = payload.playerDestinationURL;
  }

  if (payload.promoterDestinationURL !== undefined) {
    const promoterDestinationURLFieldName: keyof Tournament_Firestore["inviteMetadata"] =
      "promoterDestinationURL";
    updatePayload[
      `${inviteMetadataFieldName}.${promoterDestinationURLFieldName}`
    ] = payload.promoterDestinationURL;
  }

  const stampMetadataFieldName: keyof Tournament_Firestore = "stampMetadata";
  if (payload.seedLootboxLogoURLs != undefined) {
    const seedLootboxLogoURLsFieldName: keyof StampMetadata = "logoURLs";
    updatePayload[`${stampMetadataFieldName}.${seedLootboxLogoURLsFieldName}`] =
      payload.seedLootboxLogoURLs ?? [];
  }
  if (payload.seedLootboxFanTicketPrize != undefined) {
    const seedLootboxFanTicketPrizeFieldName: keyof StampMetadata =
      "seedLootboxFanTicketValue";
    updatePayload[
      `${stampMetadataFieldName}.${seedLootboxFanTicketPrizeFieldName}`
    ] = payload.seedLootboxFanTicketPrize;
  }

  await tournamentRef.update(updatePayload);

  return parseTournamentDB(
    (await tournamentRef.get()).data() as unknown as Tournament_Firestore
  );
};

export const deleteTournament = async (
  tournamentId: TournamentID
): Promise<Tournament_Firestore> => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc(tournamentId) as DocumentReference<Tournament_Firestore>;

  await tournamentRef.update(
    "timestamps.deletedAt",
    Timestamp.now().toMillis() // soft delete
  );

  return parseTournamentDB(
    (await tournamentRef.get()).data() as Tournament_Firestore
  );
};

export const getUserTournaments = async (
  userId: UserID
): Promise<Tournament_Firestore[]> => {
  const collectionRef = db
    .collection(Collection.Tournament)
    .where("creatorId", "==", userId)
    .orderBy("timestamps.createdAt", "desc") as Query<Tournament_Firestore>;

  const tournaments = await collectionRef.get();

  if (tournaments.empty) {
    return [];
  } else {
    return tournaments.docs.map((doc) => {
      const data = doc.data();
      return parseTournamentDB(data);
    });
  }
};

export const paginateBattleFeedQuery = async (
  limit: number,
  cursor?: TournamentID | null
): Promise<{
  totalCount: number;
  edges: BattleFeedEdge[];
  pageInfo: PageInfo;
}> => {
  let tournamentQuery = db
    .collection(Collection.Tournament)
    .where("timestamps.deletedAt", "==", null)
    .where("visibility", "==", TournamentVisibility_Firestore.Public)
    .orderBy("timestamps.createdAt", "desc") as Query<Tournament_Firestore>;

  if (cursor) {
    const cursorRef = db
      .collection(Collection.Tournament)
      .doc(cursor) as DocumentReference<Tournament_Firestore>;

    const cursorData = (await cursorRef.get()).data();
    if (cursorData) {
      tournamentQuery = tournamentQuery.startAfter(
        cursorData.timestamps.createdAt
      );
    }
  }

  tournamentQuery = tournamentQuery.limit(limit + 1);

  const tournamentSnapshot = await tournamentQuery.get();

  if (tournamentSnapshot.empty) {
    return {
      edges: [],
      totalCount: -1,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    };
  } else {
    const docs = tournamentSnapshot.docs.slice(0, limit);
    return {
      edges: docs.map((doc) => {
        return {
          node: convertTournamentDBToGQL(doc.data()),
          cursor: doc.id,
        };
      }),
      totalCount: -1,
      pageInfo: {
        endCursor: docs[docs.length - 1].id,
        hasNextPage: tournamentSnapshot.docs.length === limit + 1,
      },
    };
  }
};

export const getLootboxTournamentSnapshot = async (
  tournamentID: TournamentID,
  snapshotID: LootboxTournamentSnapshotID
): Promise<LootboxTournamentSnapshot_Firestore> => {
  const lootboxRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID)
    .collection(Collection.LootboxTournamentSnapshot)
    .doc(snapshotID) as DocumentReference<LootboxTournamentSnapshot_Firestore>;

  const lootboxSnapshot = await lootboxRef.get();

  if (!lootboxSnapshot.exists) {
    throw new Error("Lootbox does not exist");
  }

  return lootboxSnapshot.data() as LootboxTournamentSnapshot_Firestore;
};

/** @deprecated please use getLootboxSnapshotsForTournament */
export const getLootboxSnapshotsForTournamentDeprecated = async (
  tournamentID: TournamentID
): Promise<LootboxTournamentSnapshot[]> => {
  const collectionRef = db
    .collection(Collection.Lootbox)
    .where("tournamentId", "==", tournamentID)
    .orderBy(
      "timestamps.createdAt",
      "asc"
    ) as Query<LootboxDeprecated_Firestore>;

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        address: data.address,
        // creatorID: data?.creatorID || "",
        creatorID: "",
        // issuer: data.issuer,
        lootboxCreatorID: "",
        lootboxID: "",
        name: data.name,
        metadataDownloadUrl: data.metadataDownloadUrl,
        description:
          data?.metadata?.lootboxCustomSchema?.lootbox?.description || "",
        timestamps: {
          updatedAt: data.timestamps.updatedAt,
          createdAt: data.timestamps.createdAt,
        },
        stampImage: data.metadata?.image || "",
        status: LootboxTournamentStatus.Active,
        impressionPriority: 0,
      };
    });
  }
};

export const bulkDeleteLootboxTournamentSnapshots = async (
  tournamentID: TournamentID,
  lootboxSnapshotIDs: LootboxTournamentSnapshotID[]
): Promise<void> => {
  const batch = db.batch();

  for (const lootboxSnapshotID of lootboxSnapshotIDs) {
    const lootboxRef = db
      .collection(Collection.Tournament)
      .doc(tournamentID)
      .collection(Collection.LootboxTournamentSnapshot)
      .doc(
        lootboxSnapshotID
      ) as DocumentReference<LootboxTournamentSnapshot_Firestore>;

    batch.delete(lootboxRef);
  }

  await batch.commit();
};

export const bulkEditLootboxTournamentSnapshots = async (
  tournamentID: TournamentID,
  lootboxSnapshotIDs: LootboxTournamentSnapshotID[],
  payload: {
    status?: LootboxTournamentStatus_Firestore | null;
    impressionPriority?: number | null;
  }
): Promise<void> => {
  const updateRequest: Partial<LootboxTournamentSnapshot_Firestore> = {};
  if (payload.status != null) {
    updateRequest.status = payload.status;
  }
  if (payload.impressionPriority != null) {
    updateRequest.impressionPriority = payload.impressionPriority;
  }

  if (Object.values(updateRequest).length === 0) {
    throw new Error("Nothing to update");
  }

  const batch = db.batch();

  for (const lootboxSnapshotID of lootboxSnapshotIDs) {
    const lootboxSnapshotRef = db
      .collection(Collection.Tournament)
      .doc(tournamentID)
      .collection(Collection.LootboxTournamentSnapshot)
      .doc(
        lootboxSnapshotID
      ) as DocumentReference<LootboxTournamentSnapshot_Firestore>;

    batch.update(lootboxSnapshotRef, updateRequest);
  }

  await batch.commit();
};

export const getTournamentByInviteSlug = async (
  slug: EventInviteSlug
): Promise<Tournament_Firestore | undefined> => {
  const inviteMetadataFieldName: keyof Tournament_Firestore = "inviteMetadata";
  const inviteSlugFieldName: keyof Tournament_Firestore["inviteMetadata"] =
    "slug";
  const tournamentRef = db
    .collection(Collection.Tournament)
    .where(
      `${inviteMetadataFieldName}.${inviteSlugFieldName}`,
      "==",
      slug
    ) as Query<Tournament_Firestore>;

  const tournamentSnapshot = await tournamentRef.get();

  if (tournamentSnapshot.empty || tournamentSnapshot.docs.length === 0) {
    return undefined;
  } else {
    return tournamentSnapshot.docs[0].data();
  }
};
