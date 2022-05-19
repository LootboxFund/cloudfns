import { ChainIDHex } from "../manifest/types.helpers";
import manifest from "../manifest/manifest";
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
  bucket: string;
}

export const saveFileToGBucket = async ({
  alias,
  credentials,
  fileName,
  data,
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
  const downloadablePath = `${
    manifest.storage.downloadUrl
  }/${bucket}/${encodeURISafe(fileName)}?alt=media \n`;
  console.log(
    `⏳ Uploading ${alias} to Cloud Storage Bucket as ${downloadablePath}`
  );
  await storage.bucket(bucket).file(fileName).save(data);
  await storage.bucket(bucket).file(fileName).makePublic();
  console.log(`✅ Uploaded \n`);
  return downloadablePath;
};
