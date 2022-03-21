import { defineAction } from "ironpipe";
import { indexGBucketRoute, saveFileToGBucket } from "../../api/gbucket";
import { GBucketPrefixesEnum } from "@wormgraph/helpers";
import { ABIGenericInterface, ChainIDHex } from "@wormgraph/helpers";
import { Manifest } from "../../manifest";
import { SemanticVersion } from "@wormgraph/manifest";
const manifest = Manifest.default;

const action = defineAction({
  key: manifest.pipedream.actions.onUploadABI.slug,
  description: `
    Saves an ABI.json to GCloud
  `,
  name: manifest.pipedream.actions.onUploadABI.alias,
  version: "0.0.7",
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
      semver: manifest.googleCloud.bucket.folderSemver,
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum.abi,
      bucket: manifest.googleCloud.bucket.id,
      data: JSON.stringify(abi),
    });

    // index the rest of the guildtokens
    await indexGBucketRoute({
      alias: `Index ABIs triggered by upload of ${metadata.alias} ABI`,
      credentials,
      semver: manifest.googleCloud.bucket.folderSemver,
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum.abi,
      bucket: manifest.googleCloud.bucket.id,
    });

    return;
  },
});

export = action;
