import {
  ChainIDHex,
  GBucketPrefixes,
  GCloudBucket,
} from "@lootboxfund/helpers";
import { SemanticVersion } from "@lootboxfund/manifest";
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
  semver: SemanticVersion;
  chainIdHex: ChainIDHex;
  prefix: GBucketPrefixes;
  bucket: GCloudBucket;
}
interface GBucketSaveLocalProps {
  alias: string;
  localFilePath: string;
  credentials: GBucketCreds;
  fileName: string;
  semver: SemanticVersion;
  chainIdHex: ChainIDHex;
  prefix: GBucketPrefixes;
  bucket: GCloudBucket;
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
  const filePath = `v/${chainIdHex}/${prefix}/${fileName}`;
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

export const saveFileToGBucket = async ({
  alias,
  credentials,
  fileName,
  data,
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
  const filePath = `v/${chainIdHex}/${prefix}/${fileName}`;
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
  const filePath = `v/${chainIdHex}/${prefix}/index.json`;
  const downloadablePath = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
    filePath
  )}?alt=media \n`;

  // Lists files in the bucket, filtered by a prefix
  const options = {
    prefix: `v/${chainIdHex}/${prefix}/`,
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
