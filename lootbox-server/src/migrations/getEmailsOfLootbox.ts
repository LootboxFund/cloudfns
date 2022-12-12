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
 * npx ts-node --script-mode ./src/migrations/getEmailsOfLootbox.ts prod CC2kzXEKGYC8Cq5IExTm vhvgFKDbhrK485dKrFxy
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
import { logWrite } from "./log-helper";

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

  const fileName = `src/migrations/output/getEmailsOfLootbox-${new Date()}.txt`;

  logWrite(
    fileName,
    true,
    `
  
  Running Query getEmailsOfLootbox.ts
  Datestamp: ${new Date()}

  tournamentID: ${tournamentID}
  lootboxID: ${lootboxID}

  `
  );

  const claimsForTournament = await getAllClaimsForTournament(
    tournamentID as TournamentID
  );
  logWrite(
    fileName,
    true,
    `
 
     Found ${claimsForTournament.length} claims for tournament ${tournamentID}
 
    `
  );

  const userMap: { [key: string]: User_Firestore } = {};

  const claimUserIDsAll = claimsForTournament
    .filter((claim) => claim.claimerUserId)
    .filter((claim) => claim.lootboxID && claim.lootboxID === lootboxID)
    .filter((claim) => claim.status === ClaimStatus_Firestore.complete)
    .map((claim) => claim.claimerUserId);

  const claimUserIDs = claimUserIDsAll.filter((v, i, a) => a.indexOf(v) === i);

  logWrite(
    fileName,
    true,
    `
 
     Found ${claimUserIDs.length} unique claimer user IDs
 
     `
  );

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

  logWrite(
    fileName,
    true,
    `

     Printing User Emails

     `
  );

  const userEmails = Object.values(userMap)
    .filter((user) => user.email)
    .map((user) => ({
      id: user.id,
      email: user.email,
      count: claimUserIDsAll.filter((c) => c === user.id).length,
    }));

  logWrite(fileName, true, `User Emails: ${userEmails.length} \n`);
  let ticketCount = 0;
  logWrite(
    fileName,
    true,
    `Number, User ID, Email, Ticket Count, Ticket Count \n`
  );
  userEmails.forEach((em, i) => {
    ticketCount = ticketCount + em.count;
    logWrite(
      fileName,
      true,
      `#${i + 1}, ${em.id}, ${em.email}, ${em.count}, ${em.count} tickets \n`
    );
  });
  logWrite(fileName, true, `Total ${ticketCount}`);
};

run().catch(console.error);
