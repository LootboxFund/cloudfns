import { defineAction } from "ironpipe";
import { ITicketMetadata } from "@wormgraph/helpers";
import { indexGBucketRoute, saveFileToGBucket } from "../../api/gbucket";
import { Manifest, GBucketPrefixesEnum } from "../../manifest";
const manifest = Manifest.default;

console.log(
  `Deploying Action ${manifest.pipedream.actions.onLootboxURI.slug} (aka ${manifest.pipedream.actions.onLootboxURI.alias})`
);
console.log(
  `Version ${manifest.pipedream.actions.onLootboxURI.pipedreamSemver}`
);

const action = defineAction({
  name: manifest.pipedream.actions.onLootboxURI.alias,
  description: `
    Saves a Lootbox URI.json to GCloud
  `,
  key: manifest.pipedream.actions.onLootboxURI.slug,
  version: manifest.pipedream.actions.onLootboxURI.pipedreamSemver,
  type: "action",
  props: {
    googleCloud: {
      type: "app",
      app: "google_cloud",
    },
    webhookTrigger: {
      // {{steps.trigger.event}}
      type: "object",
    },
  },
  async run() {
    const storageBucket = manifest.storage.buckets.find(
      (bucket) => bucket.bucketType === "appspot"
    );

    if (!storageBucket) {
      console.log("Storage bucket not configured in manifest... exiting");
      return;
    }
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
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum["lootbox-uri"],
      bucket: storageBucket.id,
      data: JSON.stringify(lootboxURIData),
    });

    // index the rest of the guildtokens
    await indexGBucketRoute({
      alias: `Index URIs triggered by upload of ${lootboxURIData.address} URI`,
      credentials,
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum["lootbox-uri"],
      bucket: storageBucket.id,
    });

    return;
  },
});

export = action;
