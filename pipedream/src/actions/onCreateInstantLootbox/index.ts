import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { saveFileToGBucket } from "../../api/gbucket";

import { decodeEVMLogs } from "../../api/evm";
import {
  Address,
  ABIUtilRepresenation,
  convertHexToDecimal,
} from "../../types";
import { BigNumber } from "ethers";
import manifest from "../../manifest/manifest";
import { encodeURISafe } from "../../api/helpers";

interface Event_LootboxCreated {
  lootboxName: string;
  lootbox: Address;
  issuer: Address;
  treasury: Address;
  maxSharesSold: BigNumber;
  sharePriceUSD: BigNumber;
  _data: string;
}

const action = defineAction({
  name: manifest.pipedream.actions.onCreateLootbox.alias,
  description: `
    Pipeline for handling LootboxCreated event
    0. Parse the EVM logs
    1. Save lootbox/address.json to GBucket for FE to consume
    2. Save lootbox/address.txt to GBucket for OZ to consume
    3. Save lootbox/index.json to GBucket for FE to consume
    4. Forward parsed data down pipe
  `,
  key: manifest.pipedream.actions.onCreateLootbox.slug,
  // version: manifest.pipedream.actions.onCreateLootbox.pipedreamSemver,
  version: "0.2.0",
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
      // {{steps.defineEventABIs.$return_value.LootboxInstantFactory}}
      type: "object",
    },
  },
  async run() {
    const { data: bucketData, stamp: bucketStamp } = manifest.storage.buckets;

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

    // save the lootbox.json to gbucket
    const savedFragmentJSON = await Promise.all(
      decodedLogs.map(async (ev) => {
        if (!ev.lootbox || !ev._data || !ev.lootboxName) {
          console.log("invalid event", ev.lootbox, ev.lootboxName, ev._data);
          return;
        }

        lootboxName = ev.lootboxName;
        lootboxAddr = ev.lootbox;

        let lootboxURI;
        try {
          lootboxURI = JSON.parse(ev._data);
        } catch (err) {
          console.error("Could not parse lootbox URI", err);
          lootboxURI = {};
        }

        // We need to add some data to the URI file
        // This causes weaker typing - be sure to coordinate this
        // with the frontend @widgets repo
        lootboxURI.address = ev.lootbox;
        lootboxURI.lootbox = {
          ...lootboxURI.lootbox,
          address: ev.lootbox,
          transactionHash: transaction.transactionHash,
          blockNumber: transaction.blockNumber,
        };

        return saveFileToGBucket({
          alias: `JSON for Instant Lootbox ${ev.lootbox} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.lootbox}.json`,
          chainIdHex: manifest.chain.chainIDHex,
          bucket: bucketData.id,
          data: JSON.stringify({
            address: ev.lootbox,
            title: ev.lootboxName,
            chainIdHex: manifest.chain.chainIDHex,
            chainIdDecimal: convertHexToDecimal(manifest.chain.chainIDHex),
            data: lootboxURI,
          }),
        });
      })
    );

    // Lootbox NFT ticket image
    const filePath = `${manifest.chain.chainIDHex}/${lootboxAddr}.png`;
    const downloadablePath = `${manifest.storage.downloadUrl}/${
      bucketStamp.id
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
