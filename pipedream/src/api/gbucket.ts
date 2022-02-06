import { ChainIDHex, SemanticVersion, TerraSemvar } from "../types";
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
  semvar: SemanticVersion;
  chainIdHex: ChainIDHex;
  prefix: TerraSemvar["gcloud"]["prefixes"];
  bucket: TerraSemvar["gcloud"]["bucketName"];
}
export const saveFileToGBucket = async ({
  alias,
  credentials,
  fileName,
  data,
  semvar,
  chainIdHex,
  prefix,
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
  const filePath = `v/${semvar}/${chainIdHex}/${prefix}/${fileName}`;
  const downloadablePath = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
    filePath
  )}?alt=media \n`;
  console.log(
    `⏳ Uploading ${alias} to Cloud Storage Bucket as ${downloadablePath}`
  );
  await storage.bucket(bucket).file(filePath).save(data);
  await storage.bucket(bucket).file(filePath).makePublic();
  console.log(`✅ Uploaded \n`);
  return downloadablePath;
};

export const indexGBucketRoute = async ({
  alias,
  credentials,
  semvar,
  chainIdHex,
  prefix,
  bucket,
}: Omit<GBucketSaveFragProps, "fileName" | "data">) => {
  require("@dylburger/umask")();
  const { Storage } = require("@google-cloud/storage");
  const storage = new Storage({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
  const filePath = `v/${semvar}/${chainIdHex}/${prefix}/index.json`;
  const downloadablePath = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
    filePath
  )}?alt=media \n`;

  // Lists files in the bucket, filtered by a prefix
  const options = {
    prefix: `v/${semvar}/${chainIdHex}/${prefix}/`,
    delimiter: "/",
  };
  const result = await storage.bucket(bucket).getFiles(options);
  const routes: any[] = [];
  result[0]
    .filter(
      (f: any) =>
        f.name.indexOf("index.json") === -1 &&
        f.name.indexOf("defaults.json") === -1
    )
    .forEach((file: any) => {
      console.log(file.name);
      routes.push(file.name);
    });
  console.log(
    `⏳ Uploading ${alias} to Cloud Storage Bucket as ${downloadablePath} \n`
  );
  await storage.bucket(bucket).file(filePath).save(JSON.stringify(routes));
  await storage.bucket(bucket).file(filePath).makePublic();
  console.log(`✅ Uploaded \n`);
};
