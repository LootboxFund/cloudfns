import { ChainIDHex, GBucketPrefixes, GCloudBucket } from "@wormgraph/helpers";
import { SemanticVersion } from "@wormgraph/manifest";
import { manifest } from "../../manifest";
const { Storage } = require("@google-cloud/storage");

const encodeURISafe = (stringFragment: string) =>
  encodeURIComponent(stringFragment).replace(/'/g, "%27").replace(/"/g, "%22");

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
  const storage = new Storage();
  const filePath = `${prefix}/${chainIdHex}/${fileName}`;
  const downloadablePath = `${
    manifest.storage.downloadUrl
  }/${bucket}/o/${encodeURISafe(filePath)}?alt=media`;
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
