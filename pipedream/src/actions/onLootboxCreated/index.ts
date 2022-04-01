import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { saveFileToGBucket } from "../../api/gbucket";

import { decodeEVMLogs } from "../../api/evm";
import {
  Address,
  ABIUtilRepresenation,
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
  // version: manifest.pipedream.actions.onLootboxCreated.pipedreamSemver,
  version: "0.14.2",
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
    const { lootboxData, lootboxStamp } = manifest.storage.buckets;

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
          chainIdHex: manifest.chain.chainIDHex,
          bucket: lootboxData.id,
          data: JSON.stringify({
            address: ev.lootbox,
            title: ev.lootboxName,
            chainIdHex: manifest.chain.chainIDHex,
            chainIdDecimal: convertHexToDecimal(manifest.chain.chainIDHex),
          }),
        });
      })
    );

    // Lootbox NFT ticket image
    const filePath = `${manifest.chain.chainIDHex}/${lootboxAddr}.png`;
    const downloadablePath = `${manifest.storage.downloadUrl}/${
      lootboxStamp.id
    }/${encodeURISafe(filePath)}?alt=media`;

    return {
      json: savedFragmentJSON,
      name: lootboxName,
      publicUrl: `${manifest.microfrontends.webflow.lootboxUrl}?lootbox=${lootboxAddr}`,
      image: downloadablePath,
    };
  },
});

export = action;
