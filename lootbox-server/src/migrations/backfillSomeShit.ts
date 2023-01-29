/**
 * Adds various shit to various collections
 *
 * - Tournament model: adds inviteMetadata fields
 * - Lootbox model: Adds lootbox.type field = PLAYER if not already specified
 * - Claim model: Batch adds lootboxType = PLAYER to all claims
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * You might need to temporarily grant your account firestore write permission.
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/backfillSomeShit.ts
 */

import { db } from "../api/firebase";
import { CollectionGroup, CollectionReference } from "firebase-admin/firestore";
import {
  Claim_Firestore,
  Collection,
  EventInviteMetadata,
  LootboxID,
  LootboxType,
  Lootbox_Firestore,
  Tournament_Firestore,
} from "@wormgraph/helpers";
import { createEventInviteSlug } from "../lib/tournament";

interface ScriptLootbox extends Lootbox_Firestore {
  documentID: LootboxID;
}

interface ScriptEvent extends Tournament_Firestore {
  documentID: LootboxID;
}

interface EditEventPayload
  extends Pick<Tournament_Firestore, "inviteMetadata"> {
  __eventBackfilledAt?: number;
}

interface EditLootboxPayload extends Pick<Lootbox_Firestore, "type"> {
  __lootboxBackfilledAt?: number;
}

interface EditClaimPayload extends Pick<Claim_Firestore, "lootboxType"> {
  __claimBackfilledAt?: number;
}

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
    db.collection(Collection.Lootbox) as CollectionReference<Lootbox_Firestore>
  ).get();

  const lootboxes: ScriptLootbox[] = lootboxRef.docs.map((doc) => {
    return {
      ...doc.data(),
      documentID: doc.id as LootboxID,
    };
  });
  // Find only the ones we want to process
  const lootboxesToBackfill = lootboxes.filter((lootbox) => {
    return !lootbox.type;
  });

  console.log(`\n\nFound ${lootboxesToBackfill.length} lootboxes to backfill`);

  await sleep();
  let lbCount = 1;
  for (let lootbox of lootboxesToBackfill) {
    console.log(`${lbCount} / ${lootboxesToBackfill.length}`);
    if (lootbox.type) {
      continue;
    }
    const payload: EditLootboxPayload = {
      __lootboxBackfilledAt: new Date().valueOf(),
      type: LootboxType.Player,
    };
    console.log(`Processing lootbox ${lootbox.documentID}`);

    await db.collection("lootbox").doc(lootbox.documentID).update(payload);
    lbCount++;
  }

  // Now we do events

  // gets all events
  const eventRef = await (
    db.collection(
      Collection.Tournament
    ) as CollectionReference<Tournament_Firestore>
  ).get();

  const eventsToBackfill = eventRef.docs
    .map((doc) => {
      return {
        ...doc.data(),
        documentID: doc.id as LootboxID,
      };
    })
    .filter((e) => {
      return !e.inviteMetadata;
    }) as ScriptEvent[];

  console.log(`\n\nFound ${eventsToBackfill.length} events to backfill`);

  await sleep();

  let eventCount = 1;
  for (let event of eventsToBackfill) {
    console.log(`${eventCount} / ${eventsToBackfill.length}`);
    if (event.inviteMetadata) {
      continue;
    }
    console.log(`Processing event ${event.documentID}`);
    const payload: EditEventPayload = {
      __eventBackfilledAt: new Date().valueOf(),
      inviteMetadata: {
        slug: createEventInviteSlug(event.title),
        maxPlayerLootbox: 1,
        maxPromoterLootbox: 1,
      },
    };

    await db
      .collection(Collection.Tournament)
      .doc(event.documentID)
      .update(payload);

    eventCount++;
  }

  // Next we have to batch add lootboxType to all claims

  // gets all claims

  const claimRef = await (
    db.collectionGroup(Collection.Claim) as CollectionGroup<Claim_Firestore>
  ).get();

  const claimsToBackfill = claimRef.docs
    .map((doc) => {
      return {
        ...doc.data(),
        documentID: doc.id as LootboxID,
      };
    })
    .filter((c) => {
      return !c.lootboxType;
    });

  console.log(`\n\nFound ${claimsToBackfill.length} claims to backfill`);
  console.log(`= ${claimsToBackfill.length / 500} batches`);

  await sleep();
  let batchCount = 1;
  while (claimsToBackfill.length) {
    console.log(`${batchCount} / ${claimsToBackfill.length / 500}`);

    const batch = db.batch();

    const claims = claimsToBackfill.splice(0, 500);

    for (let claim of claims) {
      if (claim.lootboxType) {
        continue;
      }

      const payload: EditClaimPayload = {
        __claimBackfilledAt: new Date().valueOf(),
        lootboxType: LootboxType.Player,
      };

      console.log(
        `Adding claim to batch ${claim.referralId}   ---   ${claim.documentID}`
      );

      batch.update(
        db
          .collection(Collection.Referral)
          .doc(claim.referralId)
          .collection(Collection.Claim)
          .doc(claim.documentID),
        payload
      );
    }

    await batch.commit();
    batchCount++;

    console.log(`Batch committed`);
  }
};

run().catch(console.error);
