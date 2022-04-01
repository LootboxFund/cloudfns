import { ChainIDHex } from "@wormgraph/helpers";
import { latest as Manifest, GBucketPrefixes } from "@wormgraph/manifest";
import { encodeURISafe } from "./helpers";

const manifest = Manifest.snapshot;

type GBucketCreds = {
  project_id: string;
  client_email: string;
  private_key: string;
};
interface GBucketSaveFragProps {
  alias: string;
  credentials: GBucketCreds;
  fileName: string;
  data: any;
  chainIdHex: ChainIDHex;
  bucket: string;
}
interface GBucketSaveLocalProps {
  alias: string;
  localFilePath: string;
  credentials: GBucketCreds;
  fileName: string;
  chainIdHex: ChainIDHex;
  prefix: GBucketPrefixes;
  bucket: string;
}

export const saveLocalFileToGBucket = async ({
  alias,
  credentials,
  localFilePath,
  fileName,
  chainIdHex,
  prefix,
  bucket,
}: GBucketSaveLocalProps) => {
  const { Storage } = require("@google-cloud/storage");
  const storage = new Storage({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
  const filePath = `${prefix}/${chainIdHex}/${fileName}`;
  const downloadablePath = `${
    manifest.storage.downloadUrl
  }/${bucket}/o/${encodeURISafe(filePath)}?alt=media \n`;
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

export const saveFileToGBucket = async ({
  alias,
  credentials,
  fileName,
  data,
  chainIdHex,
  bucket,
}: GBucketSaveFragProps) => {
  require("@dylburger/umask")();
  const { Storage } = require("@google-cloud/storage");
  const storage = new Storage({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
  const filePath = `${chainIdHex}/${fileName}`;
  const downloadablePath = `${
    manifest.storage.downloadUrl
  }/${bucket}/o/${encodeURISafe(filePath)}?alt=media \n`;
  console.log(
    `⏳ Uploading ${alias} to Cloud Storage Bucket as ${downloadablePath}`
  );
  await storage.bucket(bucket).file(filePath).save(data);
  await storage.bucket(bucket).file(filePath).makePublic();
  console.log(`✅ Uploaded \n`);
  return downloadablePath;
};
