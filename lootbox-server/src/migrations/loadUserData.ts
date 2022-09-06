/**
 * Creates CSV of user data
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default-login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * You might need to temporarily grant your account firestore write permission.
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/loadUserData.ts staging
 *
 * [env]    `prod` | `staging`
 */
import { CollectionReference } from "firebase-admin/firestore";
import { db, storage } from "../api/firebase";
import { Collection } from "../api/firestore/collection.types";
import { saveCsvToStorage } from "../api/storage";
import { User } from "../graphql/generated/types";
// import { getUserWallets } from "../api/firestore";

interface Config {
  bucketName: string;
}

const _scriptData: { prod: Config; staging: Config } = {
  prod: {
    bucketName: "sdnlkwejnfwelkjcnsdiofsdjfsodidkfjhsdoweorwen",
  },
  staging: {
    bucketName: "slkjdcsldbgljshbdalsjhdbalskjdnasldfb",
  },
};

const run = async () => {
  const env = process.argv[2];

  if (!env) {
    throw new Error("Environment specified");
  }

  const config = _scriptData[env] as Config;

  if (!config) {
    throw new Error("No config for env");
  }

  console.log(`
  
      Running migration script...
  
          Env:    ${env}
          Bucket: ${config.bucketName}
  
      `);

  // Lists all users
  const userCollectionRef = db.collection(
    Collection.User
  ) as CollectionReference<User>;

  const userdata = await userCollectionRef.get();

  if (userdata.empty) {
    return undefined;
  }

  const users = userdata.docs.map((doc) => doc.data());
  const userData = users.map((user) => {
    return {
      phone: user.phoneNumber || "",
      email: user.email || "",
    };
  });

  var lineArray: string[] = [];
  userData.forEach(function (row, index) {
    // If index == 0, then we are at the header row
    if (index == 0) {
      const titles = Object.keys(row);
      lineArray.push(titles.join(","));
    }

    const values = Object.values(row);
    var line = values.join(",");
    lineArray.push(line);
  });
  var csvContent = lineArray.join("\n");

  //   const downloadUrl = await saveCsvToStorage({
  //     fileName: `${new Date().valueOf()}.csv`,
  //     data: csvContent,
  //     bucket: config.bucketName,
  //   });

  const file = storage
    .bucket(config.bucketName)
    .file(`${new Date().valueOf()}.csv`);
  await file.save(csvContent);

  console.log("saved file", file.name);
};

run().catch(console.error);
