import {
  ChainIDHex,
  SemanticVersion,
  GBucketPrefixes,
  GCloudBucket,
} from "@lootboxfund/helpers";
const { Storage } = require("@google-cloud/storage");

const encodeURISafe = (stringFragment: string) =>
  encodeURIComponent(stringFragment).replace(/'/g, "%27").replace(/"/g, "%22");

// type GBucketCreds = {
//   project_id: string;
//   client_email: string;
//   private_key: string;
// };
interface GBucketSaveLocalProps {
  alias: string;
  localFilePath: string;
  fileName: string;
  semver: SemanticVersion;
  chainIdHex: ChainIDHex;
  prefix: GBucketPrefixes;
  bucket: GCloudBucket;
}

export const saveLocalFileToGBucket = async ({
  alias,
  localFilePath,
  fileName,
  semver,
  chainIdHex,
  prefix,
  bucket,
}: GBucketSaveLocalProps) => {
  // const storage = new Storage({
  //   projectId: credentials.project_id,
  //   credentials: {
  //     client_email: credentials.client_email,
  //     private_key: credentials.private_key,
  //   },
  // });
  const storage = new Storage();
  const filePath = `v/${semver}/${chainIdHex}/${prefix}/${fileName}`;
  const downloadablePath = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
    filePath
  )}?alt=media`;
  console.log(
    `⏳ Uploading ${alias} to Cloud Storage Bucket as ${downloadablePath}`
  );
  await storage.bucket(bucket).upload(localFilePath, {
    destination: filePath,
  });
  console.log(`
  
  ✅ File uploaded
  
  `);
  return downloadablePath;
};
