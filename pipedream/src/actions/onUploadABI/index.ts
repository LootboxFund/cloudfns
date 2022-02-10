import { defineAction } from "ironpipe";
import { indexGBucketRoute, saveFileToGBucket } from "../../api/gbucket";
import { SemanticVersion } from "../../types/semvar.types";
import { ABIGenericInterface, ChainIDHex } from "../../types/base.types";

const action = defineAction({
  name: "onUploadABI",
  description: `
    Saves an ABI.json to GCloud
  `,
  key: "onUploadABI",
  version: "0.0.3",
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
    interface ABIWithMetadata {
      metadata: {
        bucket: string;
        semvar: SemanticVersion;
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
      semvar: "0.1.0-demo",
      chainIdHex: "0x61",
      prefix: "abi",
      bucket: "guildfx-exchange.appspot.com",
      data: JSON.stringify(abi),
    });

    // index the rest of the guildtokens
    await indexGBucketRoute({
      alias: `Index ABIs triggered by upload of ${metadata.alias} ABI`,
      credentials,
      semvar: "0.1.0-demo",
      chainIdHex: "0x61",
      prefix: "abi",
      bucket: "guildfx-exchange.appspot.com",
    });

    return;
  },
});

export = action;
