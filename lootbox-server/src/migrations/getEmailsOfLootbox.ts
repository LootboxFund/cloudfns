/**
 * Migration script to get user emails from a tournament
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default-login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/getEmailsOfLootbox.ts [env] [tournamentID] [lootboxID]
 *
 * npx ts-node --script-mode ./src/migrations/getEmailsOfLootbox.ts prod IXU25LtCbCUzF62BSIWo RR1yAMWoIbYADPu8R6Dh
 *
 *
 * [env]            `prod` | `staging`
 * [tournamentID]   ID of tournament
 * [lootboxID]      ID of lootbox
 */
import {
  ClaimStatus_Firestore,
  Collection,
  TournamentID,
  User_Firestore,
} from "@wormgraph/helpers";
import { getAllClaimsForTournament } from "../api/firestore";
import { db } from "../api/firebase";
import { DocumentReference } from "firebase-admin/firestore";

/**
 * Main function run in this script
 */
const run = async () => {
  const env = process.argv[2];
  const tournamentID = process.argv[3];
  const lootboxID = process.argv[4];

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

  const claimUserIDsAll = claimsForTournament
    .filter((claim) => claim.claimerUserId)
    .filter((claim) => claim.lootboxID && claim.lootboxID === lootboxID)
    .filter((claim) => claim.status === ClaimStatus_Firestore.complete)
    .map((claim) => claim.claimerUserId);

  const claimUserIDs = claimUserIDsAll.filter((v, i, a) => a.indexOf(v) === i);

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
    .map((user) => ({
      email: user.email,
      count: claimUserIDsAll.filter((c) => c === user.id).length,
    }));

  console.log(`User Emails: ${userEmails.length}`);
  console.log(
    userEmails.map((em) => `${em.email} - ${em.count} tickets`).join("\n")
  );
};

run().catch(console.error);
