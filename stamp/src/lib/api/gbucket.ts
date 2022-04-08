import { ChainIDHex } from "@wormgraph/helpers";
import { BucketId } from "@wormgraph/manifest";
import { manifest } from "../../manifest";
const { Storage } = require("@google-cloud/storage");

const encodeURISafe = (stringFragment: string) =>
  encodeURIComponent(stringFragment).replace(/'/g, "%27").replace(/"/g, "%22");

interface GBucketSaveLocalProps {
  alias: string;
  localFilePath: string;
  fileName: string;
  chainIdHex: ChainIDHex;
  bucket: BucketId;
}

export const saveLocalFileToGBucket = async ({
  alias,
  localFilePath,
  fileName,
  chainIdHex,
  bucket,
}: GBucketSaveLocalProps) => {
  const storage = new Storage();
  const filePath = `${chainIdHex}/${fileName}`;
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
