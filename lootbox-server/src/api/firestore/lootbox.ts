import { Collection } from "./collection.types";
import {
  CollectionReference,
  DocumentReference,
  Query,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import {
  Lootbox,
  LootboxFeedResponseSuccess,
} from "../../graphql/generated/types";
import { Address } from "@wormgraph/helpers";
import { LootboxID } from "../../lib/types";
import { convertLootboxToSnapshot } from "../../lib/lootbox";

export const getLootboxByAddress = async (
  address: Address
): Promise<Lootbox | undefined> => {
  const lootboxRef = db
    .collection(Collection.Lootbox)
    .where("address", "==", address) as CollectionReference<Lootbox>;

  const lootboxSnapshot = await lootboxRef.get();

  if (lootboxSnapshot.empty) {
    return undefined;
  } else {
    const doc = lootboxSnapshot.docs[0];
    return doc.data();
  }
};

export const paginateLootboxFeedQuery = async (
  limit: number,
  cursor?: LootboxID | null
): Promise<LootboxFeedResponseSuccess> => {
  let collectionRef = db
    .collection(Collection.Lootbox)
    .orderBy("timestamps.createdAt", "desc") as Query<Lootbox>;

  if (cursor) {
    // collectionRef.startAfter(cursor);
    const cursorRef = db
      .collection(Collection.Lootbox)
      .doc(cursor) as DocumentReference<Lootbox>;

    const cursorData = (await cursorRef.get()).data();
    if (cursorData) {
      collectionRef = collectionRef.startAfter(cursorData.timestamps.createdAt);
    }
  }

  collectionRef = collectionRef.limit(limit + 1);

  const collectionSnapshot = await collectionRef.get();

  if (collectionSnapshot.empty) {
    return {
      totalCount: -1,
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    };
  } else {
    const docs = collectionSnapshot.docs.slice(0, limit);
    return {
      edges: docs.map((doc) => {
        const data = doc.data();
        return {
          node: convertLootboxToSnapshot(data),
          cursor: doc.id,
        };
      }),
      totalCount: -1,
      pageInfo: {
        endCursor: docs[docs.length - 1].id,
        hasNextPage: collectionSnapshot.docs.length === limit + 1,
      },
    };
  }
};
