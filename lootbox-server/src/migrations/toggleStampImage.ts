// @ts-nocheck - remove this before running

/**
 * Toggle all stamp images in storage (renaming, then renaming back lol) so that firebase extension resize will trigger
 * Run in your nodejs environment.
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
 * npx ts-node --script-mode ./src/migrations/toggleStampImage.ts staging
 *
 * [env]    `prod` | `staging`
 */
// @ts-ignore ---> you need to run yarn add -D @google-cloud/storage
import { Storage } from "@google-cloud/storage";

const storage = new Storage();

interface Config {
  bucketName: string;
}

const _scriptData: { prod: Config; staging: Config } = {
  prod: {
    bucketName: "lootbox-stamp-prod",
  },
  staging: {
    bucketName: "lootbox-stamp-staging",
  },
};

/**
 * Main function run in this script
 * 1. gets json metadata files from cloud storage
 * 2. parses json metadata files into Lootbox database schema
 *      We have a couple different structures of metadata files. So we need to handle them slightly differently
 * 3. creates lootbox metadata document in firestore
 *
 * Function processes each lootbox sequentially.
 */
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
  
          Bucket: ${config.bucketName}
  
      `);

  console.log("...waiting... 5s....");
  await sleep(5000);

  // Lists files in the bucket
  let [files] = await storage.bucket(config.bucketName).getFiles();

  console.log(`fetching... ${files.length} files`);

  for (let idx = 0; idx < files.length; idx++) {
    console.log("\nreading ", idx);
    const file = files[idx];
    console.log(file?.name);
    if (!file) {
      continue;
    }
    if (file.name.toLowerCase().includes("thumbs")) {
      console.log("already processed...");
      continue;
    }
    const originalFilename = file.name;
    const fileNameParts = originalFilename.split("/");
    const filename = fileNameParts.pop();
    const tmpFilename = `tmp-${filename}`;
    console.log(
      `filename: ${filename}    --->    tmp filename: ${tmpFilename}`
    );
    const tmpFile = [...fileNameParts, tmpFilename].join("/");
    console.log(`orig: ${originalFilename}     --->   ${tmpFile}`);

    await file.rename(tmpFile);
    const newFile = storage.bucket(config.bucketName).file(tmpFile);
    await newFile.rename(originalFilename);
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
