/**
 * Toggle all stamp images in storage (renaming, then renaming back lol) so that firebase extension resize will trigger
 * Run in your nodejs environment.
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * You might need to temporarily grant your account firestore write permission.
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/lowercaseEmails.ts
 *
 * [env]    `prod` | `staging`
 */

import { User_Firestore } from "@wormgraph/helpers";
import { db } from "../api/firebase";
import { CollectionReference } from "firebase-admin/firestore";

/**
 * Main function run in this script
 */
const run = async () => {
  // gets all users
  const usersRef = await (
    db.collection("user") as CollectionReference<User_Firestore>
  ).get();

  const users = usersRef.docs.map((doc) => doc.data());

  console.log(`Found ${users.length} users`);

  await sleep();

  for (let user of users) {
    if (!user.email) {
      continue;
    }

    const fmtEmail = user.email.toLowerCase().trim();
    if (user.email !== fmtEmail) {
      console.log(`\nUpdating user ${user.id}`);
      console.log(`Updating email ${fmtEmail} from ${user.email}`);
      await db.collection("user").doc(user.id).update({
        email: fmtEmail,
        __backfilledEmailSave: user.email,
        __backfilledAt: new Date().valueOf(),
      });
    }
  }
};

const sleep = async (ms: number = 3000) => {
  // Just to confirm output above in terminal
  await new Promise((res) => {
    setTimeout(res, ms);
  });

  return;
};

run().catch(console.error);
