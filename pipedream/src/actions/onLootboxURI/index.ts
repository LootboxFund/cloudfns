import { defineAction } from "ironpipe";
import { ITicketMetadata, GBucketPrefixesEnum } from "@lootboxfund/helpers";
import { indexGBucketRoute, saveFileToGBucket } from "../../api/gbucket";
import { Manifest } from "../../manifest";
const manifest = Manifest.default;

const action = defineAction({
  name: manifest.pipedream.actions.onLootboxURI.alias,
  description: `
    Saves a Lootbox URI.json to GCloud
  `,
  key: manifest.pipedream.actions.onLootboxURI.slug,
  version: "0.0.13",
  type: "action",
  props: {
    googleCloud: {
      type: "app",
      app: "google_cloud",
    },
    webhookTrigger: {
      type: "object",
    },
  },
  async run() {
    const credentials = JSON.parse((this as any).googleCloud.$auth.key_json);
    const lootboxURIData = (this as any).webhookTrigger as ITicketMetadata;

    console.log(`
    
        ----- Lootbox URI
    
    `);
    console.log(lootboxURIData);

    // save the abi.json to gbucket
    await saveFileToGBucket({
      alias: `Saving ABI for ${lootboxURIData.name}`,
      credentials,
      fileName: `${lootboxURIData.address}.json`,
      semver: "0.2.0-sandbox",
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum["lootbox-uri"],
      bucket: manifest.googleCloud.bucket.id,
      data: JSON.stringify(lootboxURIData),
    });

    // index the rest of the guildtokens
    await indexGBucketRoute({
      alias: `Index URIs triggered by upload of ${lootboxURIData.address} URI`,
      credentials,
      semver: "0.2.0-sandbox",
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum["lootbox-uri"],
      bucket: manifest.googleCloud.bucket.id,
    });

    return;
  },
});

export = action;
