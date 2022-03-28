import { defineAction } from "ironpipe";
import { ABIGenericInterface, ChainIDHex } from "@wormgraph/helpers";
import { SemanticVersion, GBucketPrefixesEnum } from "@wormgraph/manifest";
import { indexGBucketRoute, saveFileToGBucket } from "../../api/gbucket";
import { Manifest } from "../../manifest";
const manifest = Manifest.default;

console.log(
  `Deploying Action ${manifest.pipedream.actions.onUploadABI.slug} (aka ${manifest.pipedream.actions.onUploadABI.alias})`
);
console.log(
  `Version ${manifest.pipedream.actions.onUploadABI.pipedreamSemver}`
);

const action = defineAction({
  key: manifest.pipedream.actions.onUploadABI.slug,
  description: `
    Saves an ABI.json to GCloud
  `,
  name: manifest.pipedream.actions.onUploadABI.alias,
  version: manifest.pipedream.actions.onUploadABI.pipedreamSemver,
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
    interface ABIWithMetadata {
      metadata: {
        bucket: string;
        semver: SemanticVersion;
        chainIdHex: ChainIDHex;
        alias: string;
      };
      abi: ABIGenericInterface;
    }
    const { abi, metadata } = (this as any).webhookTrigger as ABIWithMetadata;

    console.log(`
    
        ----- abi
    
    `);
    console.log(abi);

    console.log(`
    
        ----- metadata
    
    `);
    console.log(metadata);

    // save the abi.json to gbucket
    await saveFileToGBucket({
      alias: `Saving ABI for ${metadata.alias}`,
      credentials,
      fileName: `${metadata.alias}.json`,
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum.abi,
      bucket: storageBucket.id,
      data: JSON.stringify(abi),
    });

    // index the rest of the guildtokens
    await indexGBucketRoute({
      alias: `Index ABIs triggered by upload of ${metadata.alias} ABI`,
      credentials,
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum.abi,
      bucket: storageBucket.id,
    });

    return;
  },
});

export = action;
