import { defineAction } from "ironpipe";
import { ITicketMetadata } from "@wormgraph/helpers";
import { saveFileToGBucket } from "../../api/gbucket";
import { Manifest } from "../../manifest";
const manifest = Manifest.default;

const action = defineAction({
  name: manifest.pipedream.actions.onLootboxURI.alias,
  description: `
    Saves a Lootbox URI.json to GCloud
  `,
  key: manifest.pipedream.actions.onLootboxURI.slug,
  // version: manifest.pipedream.actions.onLootboxURI.pipedreamSemver,
  version: "0.14.1",
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
    const bucket = manifest.storage.buckets.lootboxUri;

    if (!bucket) {
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
      bucket: bucket.id,
      data: JSON.stringify(lootboxURIData),
    });

    return;
  },
});

export = action;
