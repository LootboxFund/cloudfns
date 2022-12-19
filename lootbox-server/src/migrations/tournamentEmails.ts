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
 * npx ts-node --script-mode ./src/migrations/tournamentEmails.ts prod m36QEQdnoFP1WzQhlC7K
 *
 *
 * [env]            `prod` | `staging`
 * [tournamentID]   ID of tournament
 */
import { Collection, TournamentID, User_Firestore } from "@wormgraph/helpers";
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

  const fileName = `./lootbox-server/src/migrations/output/tournamentEmails-${new Date()}.txt`;

  if (!env) {
    throw new Error("Environment specified");
  }

  if (!tournamentID) {
    throw new Error("No Tournament specified");
  }

  logWrite(
    fileName,
    true,
    `
    
    Fetching user emails...
    Datestamp: ${new Date()}

        tournamentID: ${tournamentID}

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

  const claimUserIDs = claimsForTournament
    .filter((claim) => claim.claimerUserId)
    .map((claim) => claim.claimerUserId)
    .filter((v, i, a) => a.indexOf(v) === i);

  logWrite(
    fileName,
    true,
    `
 
     Found ${claimUserIDs.length} unique claimer user IDs
 
     `
  );
  console.log(claimUserIDs.join("\n"));
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
      let count = 0;
      if (_user && !userMap[userID]) {
        count++;
        logWrite(
          fileName,
          true,
          `${count}, ${_user.id}, ${_user.email}, ${_user.phoneNumber} \n`
        );
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
  
  
    --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  
    `
  );

  logWrite(
    fileName,
    true,
    `
 
     Printing User Emails 
 
     `
  );

  // const userEmails = Object.values(userMap)
  //   .filter((user) => user.email)
  //   .map((user) => ({
  //     id: user.id,
  //     username: user.username,
  //     email: user.email,
  //     phone: user.phoneNumber,
  //   }));

  // logWrite(fileName, true, `User Emails: ${userEmails.length}`);
  // userEmails.forEach((u) =>
  //   logWrite(fileName, true, `${u.id}, ${u.email}, ${u.phone} \n`)
  // );
};

run().catch(console.error);
