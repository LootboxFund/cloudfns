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
 * npx ts-node --script-mode ./src/migrations/getTings.ts [countryCode]
 *
 *
 * npx ts-node --script-mode ./src/migrations/getUsersFromRegion.ts 63
 *
 * [env]    `prod` | `staging`
 */
import {
  Claim_Firestore,
  Collection,
  User_Firestore,
} from "@wormgraph/helpers";
import { Query, QuerySnapshot } from "firebase-admin/firestore";
import { db } from "../api/firebase";
import { logWrite } from "./log-helper";

function checkMatchCountryCode(phoneNumber: string, countryCode: string) {
  return phoneNumber.indexOf(`+${countryCode}`) === 0;
}

const run = async () => {
  const countryCode = process.argv[2];

  // if (!env) {
  //   throw new Error("Environment specified");
  // }

  if (!countryCode) {
    throw new Error("No country specified");
  }
  const fileName = `src/migrations/output/getUsersFromRegion-${new Date()}.txt`;

  logWrite(
    fileName,
    true,
    `
  
  Running Query getUsersFromRegion.ts
  Datestamp: ${new Date()}

  Country: ${countryCode}

  `
  );
  // const collectionGroupRef = db.firestore().collectionGroup("claim");
  const snapshot = (await db
    .collection(Collection.User)
    .get()) as QuerySnapshot<User_Firestore>;
  // .where("phoneNumber", ">", "") as Query<User_Firestore>;

  const matches = snapshot.docs
    .map((doc) => {
      return doc.data();
    })
    .filter((data) => {
      // console.log(`
      // data.phoneNumber = ${data.phoneNumber}
      // extractCountryCode(phone) === countryCode
      // ${extractCountryCode(data.phoneNumber || "")} === ${countryCode}
      // extractAreaCode(phone) === cityCode
      // ${extractAreaCode(data.phoneNumber || "")} === ${cityCode}

      // --------
      // `);
      const phone = data.phoneNumber;
      if (phone) {
        if (checkMatchCountryCode(phone, countryCode)) {
          return true;
        }
        return false;
      }
      return false;
    });
  let count = 0;
  for (let user of matches) {
    count++;
    logWrite(
      fileName,
      true,
      `
     
      --- ${count} --------------------------
      UserID:            ${user.id}
      UserName:          ${user.username}
      Email:             ${user.email}
      Phone:             ${user.phoneNumber}
     
     `
    );
  }
};

run().catch(console.error);
