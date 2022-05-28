import { CollectionReference } from "firebase-admin/firestore";
import { db } from "./firebase";
import { Lootbox } from "../graphql/generated/types";
import { LootboxDatabaseSchema } from "@wormgraph/helpers";

enum collection {
  "lootbox" = "lootbox",
}

export const getLootboxByAddress = async (
  address: string
): Promise<Lootbox> => {
  const lootboxRef = db
    .collection(collection.lootbox)
    .where(
      "address",
      "==",
      address
    ) as CollectionReference<LootboxDatabaseSchema>;

  const lootboxSnapshot = await lootboxRef.get();

  if (lootboxSnapshot.empty) {
    return undefined;
  } else {
    const doc = lootboxSnapshot.docs[0];
    const lootbox = doc.data();
    return {
      id: doc.id,
      address: lootbox.address,
    };
  }
};
