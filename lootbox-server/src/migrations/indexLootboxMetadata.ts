/**
 * Migration script to index every lootbox JSON metadata file we have for a lootbox in cloud storage into our
 * firestore database. Run in your nodejs environment.
 *
 * You'll have to install @google-cloud/storage
 * > $ yarn add -D @google-cloud/storage
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default-login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * You might need to temporarily grant your account firestore write permission.
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/indexLootboxMetadata.ts [env]
 *
 * [env]    `prod` | `staging`
 */
import * as admin from "firebase-admin";
import { Storage } from "@google-cloud/storage";
import {
  Address,
  ContractAddress,
  ITicketMetadata,
  ITicketMetadataDeprecated,
} from "@wormgraph/helpers";
import {
  Lootbox,
  LootboxMetadata,
  LootboxVariant,
} from "../graphql/generated/types";
import { getLootboxByAddress } from "../api/firestore";

const storage = new Storage();

interface Config {
  bucketName: string;
  chains: string[];
}

interface ExtendedTicketMetadataDeprecated {
  data: ITicketMetadataDeprecated;
}

const _scriptData: { prod: Config; staging: Config } = {
  prod: {
    bucketName: "lootbox-data-prod",
    chains: ["0x38", "0x89"], // BSC & Polygon
  },
  staging: {
    bucketName: "lootbox-data-staging",
    chains: ["0x61", "0x13881"], // BSC Testnet & Mumbai
  },
};

/**
 * Main function run in this script
 * 1. gets json metadata files from cloud storage
 * 2. parses json metadata files into Lootbox database schema
 *      We have a couple different structures of metadata files. So we need to handle them slightly differently
 * 3. creates lootbox metadata document in firestore
 *
 * Function processes each lootbox sequentially.
 */
const run = async () => {
  const env = process.argv[2];

  if (!env) {
    throw new Error("Environment specified");
  }

  const config = _scriptData[env] as Config;

  if (!config) {
    throw new Error("No config for env");
  }

  console.log(`
  
      Running migration script...
  
          Bucket: ${config.bucketName}
          Chains: ${config.chains.join(", ")}
  
      `);

  await sleep();

  // Lists files in the bucket
  let [files] = await storage.bucket(config.bucketName).getFiles();

  //   files = files.slice(0, 10);

  for (let idx = 0; idx < files.length; idx++) {
    console.log("\nreading ", idx);
    const file = files[idx];

    const buffer = await new Promise<string>((res) => {
      var archivo = file.createReadStream();
      var buf = "";
      archivo
        .on("data", function (d) {
          buf += d;
        })
        .on("end", function () {
          res(buf);
        });
    });

    let data: Lootbox;

    try {
      const fileData = JSON.parse(buffer) as
        | LootboxMetadata
        | ExtendedTicketMetadataDeprecated
        | ITicketMetadata;

      // @ts-ignore
      if (fileData?.lootboxCustomSchema?.lootbox?.ticketNumber != undefined) {
        // This is a ticket metadata file not lootbox. Lets skip it
        console.log("skipping suspected ticket", file.name);
        continue;
      }
      const metadata = parseLootboxMetadata(
        fileData as LootboxMetadata | ExtendedTicketMetadataDeprecated
      );
      data = parseDBDocument(file.publicUrl(), metadata);
    } catch (err) {
      console.error("Error stringifying JSON", err);
      continue;
    }

    // check if document exists.

    console.log("metadata parsed!");

    if (!data.address) {
      console.error("NO ADDRESS");
      continue;
    }

    const document = await getLootboxByAddress(data.address as Address);

    if (!!document) {
      console.log("already indexed... skipping.");
      continue;
    }

    console.log("writing to firestore...");

    // UNCOMMENT THIS TO WRITE TO FIRESTORE
    const docRef = await admin.firestore().collection("lootbox").add(data);

    console.log("wrote document ", docRef.id);
  }
};

const sleep = async (ms: number = 3000) => {
  // Just to confirm output above in terminal
  await new Promise((res) => {
    setTimeout(res, ms);
  });
  return;
};

const parseDBDocument = (
  jsonPublicPath: string,
  metadata: LootboxMetadata
): Lootbox => {
  const lootboxDatabaseSchema: Lootbox = {
    address: metadata.lootboxCustomSchema?.chain?.address || "",
    factory: metadata.lootboxCustomSchema?.lootbox?.factory || "",
    // factoryAddress || "",
    name: metadata.lootboxCustomSchema?.lootbox?.name || "",
    chainIdHex: metadata.lootboxCustomSchema?.chain.chainIdHex || "",
    issuer: "#BACKFILL",
    treasury: "#BACKFILL",
    targetSharesSold:
      metadata.lootboxCustomSchema?.lootbox?.fundraisingTarget || "",
    maxSharesSold:
      metadata.lootboxCustomSchema?.lootbox?.fundraisingTargetMax || "",
    timestamps: {
      createdAt:
        metadata.lootboxCustomSchema?.lootbox?.createdAt ||
        new Date().valueOf(),
      indexedAt: new Date().valueOf(),
      updatedAt: new Date().valueOf(),
    },
    metadata,
    metadataDownloadUrl: jsonPublicPath,
    variant: "#BACKFILL" as LootboxVariant,
    // @ts-ignore - this is not in the typing, but we add it to track backfilled documents
    __backfilledAt: new Date().valueOf(),
  };

  return lootboxDatabaseSchema;
};

const parseLootboxMetadata = (
  metadata: LootboxMetadata | ExtendedTicketMetadataDeprecated
): LootboxMetadata => {
  // @ts-ignore - because of the extended metadata
  if (metadata?.data != null) {
    // Deprecated metadata structure - needed for backwards compatibility
    const castedMetada = metadata as ExtendedTicketMetadataDeprecated;
    const coercedMetadata: LootboxMetadata = {
      external_url: "", // Not used in FE
      description: castedMetada?.data?.description || "",
      name: castedMetada?.data?.name || "",
      background_color: castedMetada?.data?.backgroundColor || "",
      image: castedMetada?.data?.image || "",
      animation_url: "",
      youtube_url: "",
      lootboxCustomSchema: {
        version: "0",
        chain: {
          address: castedMetada?.data?.address || ("" as ContractAddress),
          title: "",
          chainIdHex: castedMetada?.data?.lootbox?.chainIdHex || "",
          chainIdDecimal: castedMetada?.data?.lootbox?.chainIdDecimal || "",
          chainName: castedMetada?.data?.lootbox?.chainName || "",
        },
        lootbox: {
          name: castedMetada?.data?.name || "",
          description: castedMetada?.data?.description || "",
          image: castedMetada?.data?.image || "",
          backgroundColor: castedMetada?.data?.backgroundColor || "",
          backgroundImage: castedMetada?.data?.backgroundImage || "",
          badgeImage: castedMetada?.data?.badgeImage || "",
          targetPaybackDate:
            castedMetada?.data?.lootbox?.targetPaybackDate || 0,
          createdAt: castedMetada?.data?.lootbox?.createdAt || 0,
          fundraisingTarget:
            castedMetada?.data?.lootbox?.fundraisingTarget || "",
          fundraisingTargetMax:
            castedMetada?.data?.lootbox?.fundraisingTargetMax || "",
          basisPointsReturnTarget:
            castedMetada?.data?.lootbox?.basisPointsReturnTarget || "",
          returnAmountTarget:
            castedMetada?.data?.lootbox?.returnAmountTarget || "",
          pricePerShare: castedMetada?.data?.lootbox?.pricePerShare || "",
          lootboxThemeColor:
            castedMetada?.data?.lootbox?.lootboxThemeColor || "",
          transactionHash: castedMetada?.data?.lootbox?.transactionHash || "",
          blockNumber: castedMetada?.data?.lootbox?.blockNumber || "",
          factory: "",
        },
        socials: {
          twitter: castedMetada?.data?.socials?.twitter || "",
          email: castedMetada?.data?.socials?.email || "",
          instagram: castedMetada?.data?.socials?.instagram || "",
          tiktok: castedMetada?.data?.socials?.tiktok || "",
          facebook: castedMetada?.data?.socials?.facebook || "",
          discord: castedMetada?.data?.socials?.discord || "",
          youtube: castedMetada?.data?.socials?.youtube || "",
          snapchat: castedMetada?.data?.socials?.snapchat || "",
          twitch: castedMetada?.data?.socials?.twitch || "",
          web: castedMetada?.data?.socials?.web || "",
        },
      },
    };
    return coercedMetadata;
  } else {
    // New metadata structure
    return metadata as LootboxMetadata;
  }
};

run().catch(console.error);
