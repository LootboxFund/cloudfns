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
 * npx ts-node --script-mode ./src/migrations/getTings.ts [addr]
 *
 *
 * npx ts-node --script-mode ./src/migrations/getTings.ts VnkpX2dgvURHX1ICLvFGHoznnCC2
 *
 * [env]    `prod` | `staging`
 */
import { Claim_Firestore, Collection } from "@wormgraph/helpers";
import { Query } from "firebase-admin/firestore";
import { db } from "../api/firebase";

const run = async () => {
  const val = process.argv[2];

  // if (!env) {
  //   throw new Error("Environment specified");
  // }

  if (!val) {
    throw new Error("No value specified");
  }

  console.log(`
   
       Running Query...
   
           Value: ${val}
   
       `);

  // const collectionGroupRef = db.firestore().collectionGroup("claim");
  const ref = db
    .collectionGroup(Collection.Claim)
    .where("claimerUserId", "==", val) as Query<Claim_Firestore>;

  const snapshot = await ref.get();

  for (let doc of snapshot.docs) {
    const data = doc.data();
    console.log(`
    
        ClaimID:             ${data.id}
        ReferralID:          ${data.referralId}
        PartyBasketAddress:  ${data.chosenPartyBasketAddress}
    
    `);
  }
};

run().catch(console.error);
