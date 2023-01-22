/**
 * Fixes old data integrity issues with the lootbox collection.
 *
 * - some ids are null
 * - some stamp images are null
 * - some timestamps are seconds instead of milliseconds
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * You might need to temporarily grant your account firestore write permission.
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/backfillLootboxDataIntegrityIssues.ts
 */

import { db } from "../api/firebase";
import { CollectionReference } from "firebase-admin/firestore";
import { LootboxID, Lootbox_Firestore } from "@wormgraph/helpers";

interface ScriptLootbox extends Lootbox_Firestore {
  documentID: LootboxID;
}

type EditPayload = Partial<
  Pick<Lootbox_Firestore, "stampImage" | "id" | "timestamps">
> & {
  __lootboxBackfilledAt?: number;
};

const DEFAULT_STAMP_IMAGE = `https://storage.googleapis.com/lootbox-constants-prod%2Fassets%2FTemplateLootboxCard.png?alt=media`;

const isTimestampFucked = (timestamp: number) => {
  return `${timestamp}`.length < 11;
};

const sleep = async (ms: number = 3000) => {
  // Just to confirm output above in terminal
  await new Promise((res) => {
    setTimeout(res, ms);
  });

  return;
};

/**
 * Main function run in this script
 */
const run = async () => {
  // gets all lootboxes
  const lootboxRef = await (
    db.collection("lootbox") as CollectionReference<Lootbox_Firestore>
  ).get();

  const lootboxes: ScriptLootbox[] = lootboxRef.docs.map((doc) => {
    return {
      ...doc.data(),
      documentID: doc.id as LootboxID,
    };
  });
  // Filter out the fucked ones
  const problemLootboxes = lootboxes.filter((lootbox) => {
    return (
      !lootbox.id ||
      !lootbox.stampImage ||
      isTimestampFucked(lootbox.timestamps.createdAt)
    );
  });

  console.log(`Found ${problemLootboxes.length} problem lootboxes`);

  await sleep();

  for (let lootbox of problemLootboxes) {
    const payload: EditPayload = {
      __lootboxBackfilledAt: new Date().valueOf(),
    };

    if (!lootbox.id) {
      payload.id = lootbox.documentID;
    }

    if (!lootbox.stampImage) {
      payload.stampImage = lootbox?.metadata?.image || DEFAULT_STAMP_IMAGE;
    }

    if (isTimestampFucked(lootbox.timestamps.createdAt)) {
      const createdAtFieldName: keyof Lootbox_Firestore["timestamps"] =
        "createdAt";
      const timestampsFieldName: keyof Lootbox_Firestore = "timestamps";
      payload[`${timestampsFieldName}.${createdAtFieldName}`] =
        lootbox.timestamps.createdAt * 1000;
    }

    if (Object.keys(payload).length > 1) {
      console.log(`\nUpdating lootbox ${lootbox.documentID}`);
      console.log(
        `Updating ${Object.keys(payload).join(", ")} -> ${JSON.stringify(
          payload
        )}`
      );
      await db.collection("lootbox").doc(lootbox.documentID).update(payload);
    }
  }
};

run().catch(console.error);
