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
  bucket: BucketId;
}

interface GBucketSaveFragProps {
  alias: string;
  fileName: string;
  data: string;
  bucket: string;
}

export const saveLocalFileToGBucket = async ({
  alias,
  localFilePath,
  fileName,
  bucket,
}: GBucketSaveLocalProps) => {
  const storage = new Storage();
  const filePath = `${fileName}`;
  const downloadablePath = `${
    manifest.storage.downloadUrl
  }/${bucket}/${encodeURISafe(filePath)}?alt=media`;
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

export const saveTicketMetadataToGBucket = async ({
  alias,
  fileName,
  data,
  bucket,
}: GBucketSaveFragProps) => {
  const storage = new Storage();
  console.log(
    `⏳ Uploading ${alias} to Cloud Storage Bucket as ${fileName} in bucket ${bucket}`
  );
  await storage.bucket(bucket).file(fileName).save(data);
  await storage.bucket(bucket).file(fileName).makePublic();
  console.log(`✅ Uploaded \n`);
  return "download_path";
};
