import { ChainIDHex } from "../types";
import manifest from '../manifest/manifest'
import { encodeURISafe } from "./helpers";

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
