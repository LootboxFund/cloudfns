/**
 * Migration script to get user emails from a tournament
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default-login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/tournamentEmails.ts [env] [tournamentID]
 *
 * npx ts-node --script-mode ./src/migrations/tournamentEmails.ts prod I9CPcXHC5oKnxEyEmL9d
 *
 *
 * [env]            `prod` | `staging`
 * [tournamentID]   ID of tournament
 */
import { Collection, TournamentID, User_Firestore } from "@wormgraph/helpers";
import { getAllClaimsForTournament } from "../api/firestore";
import { db } from "../api/firebase";
import { DocumentReference } from "firebase-admin/firestore";

/**
 * Main function run in this script
 */
const run = async () => {
  const env = process.argv[2];
  const tournamentID = process.argv[3];

  if (!env) {
    throw new Error("Environment specified");
  }

  if (!tournamentID) {
    throw new Error("No Tournament specified");
  }

  console.log(`
    
        Fetching user emails...
    
            tournamentID: ${tournamentID}
    
        `);

  const claimsForTournament = await getAllClaimsForTournament(
    tournamentID as TournamentID
  );
  console.log(`
 
     Found ${claimsForTournament.length} claims for tournament ${tournamentID}
 
    `);

  const userMap: { [key: string]: User_Firestore } = {};

  const claimUserIDs = claimsForTournament
    .filter((claim) => claim.claimerUserId)
    .map((claim) => claim.claimerUserId)
    .filter((v, i, a) => a.indexOf(v) === i);

  console.log(`
 
     Found ${claimUserIDs.length} unique claimer user IDs
 
     `);

  for (const userID of claimUserIDs) {
    if (!userID || !!userMap[userID]) {
      continue;
    }
    try {
      const userRef = db
        .collection(Collection.User)
        .doc(userID) as DocumentReference<User_Firestore>;
      const userDoc = await userRef.get();
      const _user = userDoc.data() as User_Firestore | undefined;
      if (_user) {
        userMap[userID] = _user;
      }
    } catch (err) {
      console.error(err);
    }
  }

  console.log(`
 
     Printing User Emails 
 
     `);

  const userEmails = Object.values(userMap)
    .filter((user) => user.email)
    .map((user) => user.email);

  console.log(`User Emails: ${userEmails.length}`);
  console.log(userEmails.join("\n"));
};

run().catch(console.error);
