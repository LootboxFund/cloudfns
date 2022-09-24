import {
  CollectionReference,
  DocumentReference,
  Query,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import {
  BattleFeedEdge,
  EditTournamentPayload,
  Lootbox,
  LootboxTournamentSnapshot,
  Tournament,
  PageInfo,
  Stream,
  StreamInput,
  EditStreamPayload,
  StreamType,
} from "../../graphql/generated/types";
import {
  UserID,
  UserIdpID,
  TournamentID,
  StreamID,
  AffiliateID,
} from "../../lib/types";
import { Collection, Tournament_Firestore } from "@wormgraph/helpers";
import {
  LootboxTournamentSnapshot_Firestore,
  Stream_Firestore,
} from "./tournament.types";
import {
  parseTournamentStreamDB,
  parseTournamentDB,
  convertTournamentDBToGQL,
  parseLootboxTournamentSnapshotDB,
  convertStreamTypeGQLToDB,
} from "../../lib/tournament";
import {
  LootboxDeprecated_Firestore,
  Lootbox_Firestore,
} from "./lootbox.types";

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

export const getLootboxSnapshotsForTournament = async (
  tournamentID: TournamentID
): Promise<LootboxTournamentSnapshot_Firestore[]> => {
  const collectionRef = db
    .collection(Collection.Tournament)
    .doc(tournamentID)
    .collection(Collection.LootboxTournamentSnapshot)
    .orderBy(
      "timestamps.createdAt",
      "asc"
    ) as Query<LootboxTournamentSnapshot_Firestore>;

  const collectionSnapshot = await collectionRef.get();

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
  tournamentDate: number;
  communityURL?: string | null;
  organizer?: AffiliateID;
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
}: CreateTournamentArgs): Promise<Tournament_Firestore> => {
  const tournamentRef = db
    .collection(Collection.Tournament)
    .doc() as DocumentReference<Tournament_Firestore>;

  const tournament: Tournament_Firestore = {
    id: tournamentRef.id as TournamentID,
    title,
    description,
    creatorId: creatorId as UserID,
    isPostCosmic: true,
    timestamps: {
      createdAt: Timestamp.now().toMillis(),
      updatedAt: Timestamp.now().toMillis(),
      deletedAt: null,
    },
  };

  if (!!prize) {
    tournament.prize = prize;
  }

  if (!!coverPhoto) {
    tournament.coverPhoto = coverPhoto;
  }

  if (!!tournamentLink) {
    tournament.tournamentLink = tournamentLink;
  }

  if (!!tournamentDate) {
    tournament.tournamentDate = Number(tournamentDate);
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

export const updateTournament = async (
  id: TournamentID,
  payload: Omit<EditTournamentPayload, "id">
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

  await tournamentRef.update(updatePayload);

  return parseTournamentDB(
    (await tournamentRef.get()).data() as Tournament_Firestore
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
        address: data.address,
        issuer: data.issuer,
        name: data.name,
        metadataDownloadUrl: data.metadataDownloadUrl,
        description:
          data?.metadata?.lootboxCustomSchema?.lootbox?.description || "",
        timestamps: {
          updatedAt: data.timestamps.updatedAt,
          createdAt: data.timestamps.createdAt,
        },
        backgroundColor:
          data?.metadata?.lootboxCustomSchema?.lootbox.backgroundColor || "",
        backgroundImage:
          data?.metadata?.lootboxCustomSchema?.lootbox.backgroundImage || "",
        image: data?.metadata?.lootboxCustomSchema?.lootbox.image || "",
        // @ts-gignore
        stampImage: data.metadata?.image || "",
        status:
          // @ts-ignore
          data?.tournamentMetadata?.status || LootboxTournamentStatus.Pending,
        socials: data?.metadata?.lootboxCustomSchema?.socials
          ? {
              ...data?.metadata?.lootboxCustomSchema?.socials,
              email: undefined,
            }
          : {},
      };
    });
  }
};
