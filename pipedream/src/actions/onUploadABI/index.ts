import { defineAction } from "ironpipe";
import { ABIGenericInterface, ChainIDHex, SemanticVersion } from "../../types";
import { saveFileToGBucket } from "../../api/gbucket";
import manifest from "../../manifest.json";

const action = defineAction({
  key: manifest.pipedream.actions.onUploadABI.slug,
  description: `
    Saves an ABI.json to GCloud
  `,
  name: manifest.pipedream.actions.onUploadABI.alias,
  // version: manifest.pipedream.actions.onUploadABI.pipedreamSemver,
  version: "0.1.4",
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
    const bucket = manifest.storage.buckets.abi;

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
      bucket: bucket.id,
      data: JSON.stringify(abi),
    });

    return;
  },
});

export = action;
