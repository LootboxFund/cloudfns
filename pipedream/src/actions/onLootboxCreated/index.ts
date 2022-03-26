import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { indexGBucketRoute, saveFileToGBucket } from "../../api/gbucket";

import { decodeEVMLogs } from "../../api/evm";
import {
  Address,
  ABIUtilRepresenation,
  GBucketPrefixesEnum,
  convertHexToDecimal,
} from "@wormgraph/helpers";
import { BigNumber } from "ethers";
import { Manifest } from "../../manifest";
import { encodeURISafe } from "../../api/helpers";
const manifest = Manifest.default;

interface Event_LootboxCreated {
  lootboxName: string;
  lootbox: Address;
  issuer: Address;
  treasury: Address;
  maxSharesSold: BigNumber;
  sharePriceUSD: BigNumber;
}

const action = defineAction({
  name: manifest.pipedream.actions.onLootboxCreated.alias,
  description: `
    Pipeline for handling LootboxCreated event
    0. Parse the EVM logs
    1. Save lootbox/address.json to GBucket for FE to consume
    2. Save lootbox/address.txt to GBucket for OZ to consume
    3. Save lootbox/index.json to GBucket for FE to consume
    4. Forward parsed data down pipe
  `,
  key: manifest.pipedream.actions.onLootboxCreated.slug,
  version: "0.0.18",
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
    eventABI: {
      // {{steps.defineEventABIs.$return_value.LootboxFactory}}
      type: "object",
    },
  },
  async run() {
    const credentials = JSON.parse((this as any).googleCloud.$auth.key_json);
    const abiReps = (this as any).eventABI as ABIUtilRepresenation[];
    const { transaction } = (this as any).webhookTrigger as BlockTriggerEvent;
    console.log(`
    
        ----- transaction
    
    `);
    console.log(transaction);

    // decode events from the EVM logs
    const decodedLogs = decodeEVMLogs<Event_LootboxCreated>({
      eventName: "LootboxCreated",
      logs: transaction.logs,
      abiReps,
    });
    console.log(decodedLogs);

    let lootboxName = "";
    let lootboxAddr = "";

    // save the crowdsale.json to gbucket
    const savedFragmentJSON = await Promise.all(
      decodedLogs.map(async (ev) => {
        lootboxName = ev.lootboxName;
        lootboxAddr = ev.lootbox;
        return saveFileToGBucket({
          alias: `JSON for Lootbox ${ev.lootbox} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.lootbox}.json`,
          semver: manifest.googleCloud.bucket.folderSemver,
          chainIdHex: manifest.chain.chainIDHex,
          prefix: GBucketPrefixesEnum.lootbox,
          bucket: manifest.googleCloud.bucket.id,
          data: JSON.stringify({
            address: ev.lootbox,
            title: ev.lootboxName,
            chainIdHex: manifest.chain.chainIDHex,
            chainIdDecimal: convertHexToDecimal(manifest.chain.chainIDHex),
          }),
        });
      })
    );

    // save the crowdsale.txt to gbucket
    const savedFragmentTXT = await Promise.all(
      decodedLogs.map(async (ev) => {
        const note = `
        Your Lootbox has been created!
        Add its address below to your OpenZeppelin Defender:
        
        ${ev.lootboxName} \n
        Address: ${ev.lootbox} (import this contract address to OZ Defender) \n

        lootboxName:      ${ev.lootboxName} \n
        lootbox:          ${ev.lootbox} \n  
        issuer:           ${ev.issuer} \n
        treasury:         ${ev.treasury} \n
        maxSharesSold:    ${ev.maxSharesSold} \n
        sharePriceUSD:    ${ev.sharePriceUSD} \n

        current time: ${new Date().toISOString()}
        `;
        return await saveFileToGBucket({
          alias: `TXT for Lootbox ${ev.lootbox} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.lootbox}.txt`,
          semver: manifest.googleCloud.bucket.folderSemver,
          chainIdHex: manifest.chain.chainIDHex,
          prefix: GBucketPrefixesEnum.lootbox,
          bucket: manifest.googleCloud.bucket.id,
          data: note,
        });
      })
    );
    // index the rest of the crowdsales
    await indexGBucketRoute({
      alias: `Lootbox Index triggered by tx hash ${transaction.transactionHash}`,
      credentials,
      semver: manifest.googleCloud.bucket.folderSemver,
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum.lootbox,
      bucket: manifest.googleCloud.bucket.id,
    });
    // Lootbox NFT ticket image
    const filePath = `v/${manifest.chain.chainIDHex}/nft-ticket-stamp/${lootboxAddr}.png`;
    const downloadablePath = `https://firebasestorage.googleapis.com/v0/b/${
      manifest.googleCloud.bucket.id
    }/o/${encodeURISafe(filePath)}?alt=media`;
    return {
      json: savedFragmentJSON,
      txt: savedFragmentTXT,
      name: lootboxName,
      publicUrl: `https://www.lootbox.fund/demo/0-2-3-demo/lootbox?lootbox=${lootboxAddr}`,
      image: downloadablePath,
    };
  },
});

export = action;