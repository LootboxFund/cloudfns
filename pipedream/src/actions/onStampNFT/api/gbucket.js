import {
  ChainIDHex,
  SemanticVersion,
  GBucketPrefixes,
  GCloudBucket,
} from "@lootboxfund/helpers";

const encodeURISafe = (stringFragment) =>
  encodeURIComponent(stringFragment).replace(/'/g, "%27").replace(/"/g, "%22");

const saveLocalFileToGBucket = async ({
  alias,
  credentials,
  localFilePath,
  fileName,
  semver,
  chainIdHex,
  prefix,
  bucket,
}) => {
  const { Storage } = require("@google-cloud/storage");
  const storage = new Storage({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
  const filePath = `v/${semver}/${chainIdHex}/${prefix}/${fileName}`;
  const downloadablePath = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
    filePath
  )}?alt=media \n`;
  console.log(
    `⏳ Uploading ${alias} to Cloud Storage Bucket as ${downloadablePath}`
  );
  await storage.bucket(bucket).upload(localFilePath, {
    destination: filePath,
  });
  console.log(`
  
  ✅ File uploaded
  
  `);
};

module.exports.saveLocalFileToGBucket = saveLocalFileToGBucket;
