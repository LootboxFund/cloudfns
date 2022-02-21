import { defineAction } from "ironpipe";
import { indexGBucketRoute, saveFileToGBucket } from "../../api/gbucket";
import { SemanticVersion } from "../../types/semvar.types";
import { ABIGenericInterface, ChainIDHex } from "../../types/base.types";

const action = defineAction({
  name: "onLootboxURI",
  description: `
    Saves a Lootbox URI.json to GCloud
  `,
  key: "onLootboxURI",
  version: "0.0.1",
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
      semvar: "0.2.0-sandbox",
      chainIdHex: "0x61",
      prefix: "lootbox-uri",
      bucket: "guildfx-exchange.appspot.com",
      data: JSON.stringify(lootboxURIData),
    });

    // index the rest of the guildtokens
    await indexGBucketRoute({
      alias: `Index URIs triggered by upload of ${lootboxURIData.address} URI`,
      credentials,
      semvar: "0.2.0-sandbox",
      chainIdHex: "0x61",
      prefix: "lootbox-uri",
      bucket: "guildfx-exchange.appspot.com",
    });

    return;
  },
});

export = action;


interface ITicketMetadata {
  address: string;
  name: string | undefined
  description: string | undefined
  image: string | undefined
  backgroundColor: string | undefined
  backgroundImage: string | undefined
  lootbox?: {
    address: string
    chainIdHex: string
    chainIdDecimal: string
    chainName: string
    targetPaybackDate: Date
    fundraisingTarget: string
    basisPointsReturnTarget: string
    returnAmountTarget: string
    pricePerShare: string
    lootboxThemeColor: string
    transactionHash: string
    blockNumber: string
  },
  socials?: {
    twitter: string;
    email: string;
    instagram: string;
    tiktok: string;
    facebook: string;
    discord: string;
    youtube: string;
    snapchat: string;
    twitch: string;
    web:string;
  }
}