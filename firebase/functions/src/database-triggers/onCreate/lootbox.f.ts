import { EventContext } from "firebase-functions";
import { QueryDocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { error } from "firebase-functions/lib/logger";
import { firestore } from "firebase-functions";
import { Collection, indexLootboxOnCreate } from "../../api/firestore";
import { Lootbox } from "../../api/graphql/generated/types";

export default firestore
  .document(`${Collection.Lootbox}/{lootboxId}`)
  .onCreate(async (snap: QueryDocumentSnapshot, context: EventContext) => {
    const lootbox = (snap.data()?.original as Lootbox) || undefined;

    if (!lootbox) {
      error(`Lootbox onCreate: No data in snapshot`);
      return;
    }

    try {
      await indexLootboxOnCreate(lootbox);
    } catch (err) {
      error(err);
    }

    return;
  });
