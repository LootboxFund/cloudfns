/**
 * Migration script to index every lootbox JSON metadata file we have for a lootbox in cloud storage into our
 * firestore database. Run in your nodejs environment.
 *
 * You'll have to install @google-cloud/storage
 * > $ yarn add -D @google-cloud/storage
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default-login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * You might need to temporarily grant your account firestore write permission.
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/getExpiredTicketsOfLootbox.ts [addr]
 *
 *
 * npx ts-node --script-mode ./src/migrations/getExpiredTicketsOfLootbox.ts 28hgUotsDJHIvXclzrN3
 *
 * [env]    `prod` | `staging`
 */
import { Claim_Firestore, Collection } from "@wormgraph/helpers";
import { Query } from "firebase-admin/firestore";
import { db } from "../api/firebase";

const run = async () => {
  const lootboxID = process.argv[2];

  // if (!env) {
  //   throw new Error("Environment specified");
  // }

  if (!lootboxID) {
    throw new Error("No value specified");
  }

  console.log(`
   
       Running Query...
   
           LootboxID: ${lootboxID}
   
       `);

  // const collectionGroupRef = db.firestore().collectionGroup("claim");
  const ref = db
    .collectionGroup(Collection.Claim)
    .where("lootboxID", "==", lootboxID) as Query<Claim_Firestore>;

  const snapshot = await ref.get();
  let count = 0;
  let expiredCount = 0;
  let pendingCount = 0;
  let unverifiedCount = 0;
  let completeCount = 0;
  for (let doc of snapshot.docs) {
    const data = doc.data();
    count++;
    if (data.status === "expired") {
      expiredCount++;
    }
    if (data.status === "pending") {
      pendingCount++;
    }
    if (data.status === "unverified") {
      unverifiedCount++;
    }
    if (data.status === "complete") {
      completeCount++;
    }
    console.log(`
        ----------------------------

        Count:              ${count}
        ClaimID:            ${data.id}
        ClaimerID:          ${data.claimerUserId}
        Status:             ${data.status}

        expired count:      ${expiredCount}
        pending count:      ${pendingCount}
        unverified count:   ${unverifiedCount}
        complete count:     ${completeCount}
    `);
  }
};

run().catch(console.error);
