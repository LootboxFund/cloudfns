import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { indexGBucketRoute, saveFileToGBucket } from "../../api/gbucket";
import { ABIUtilRepresenation, Event_LootboxCreated } from "../../types";
import { decodeEVMLogs } from "../../api/evm";

const action = defineAction({
  name: "onLootboxCreated",
  description: `
    Pipeline for handling LootboxCreated event
    0. Parse the EVM logs
    1. Save lootbox/address.json to GBucket for FE to consume
    2. Save lootbox/address.txt to GBucket for OZ to consume
    3. Save lootbox/index.json to GBucket for FE to consume
    4. Forward parsed data down pipe
  `,
  key: "onLootboxCreated",
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
    eventABI: {
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

    // save the crowdsale.json to gbucket
    const savedFragmentJSON = await Promise.all(
      decodedLogs.map(async (ev) => {
        return saveFileToGBucket({
          alias: `JSON for Lootbox ${ev.lootbox} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.lootbox}.json`,
          semvar: "0.1.0-demo",
          chainIdHex: "0x61",
          prefix: "lootbox",
          bucket: "guildfx-exchange.appspot.com",
          data: JSON.stringify({
            address: ev.lootbox,
            title: ev.lootboxName,
            chainIdHex: "0x61",
            chainIdDecimal: "97",
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
        Address: ${
          ev.lootbox
        } (import this contract address to OZ Defender) \n

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
          semvar: "0.1.0-demo",
          chainIdHex: "0x61",
          prefix: "lootbox",
          bucket: "guildfx-exchange.appspot.com",
          data: note,
        });
      })
    );
    // index the rest of the crowdsales
    await indexGBucketRoute({
      alias: `Lootbox Index triggered by tx hash ${transaction.transactionHash}`,
      credentials,
      semvar: "0.1.0-demo",
      chainIdHex: "0x61",
      prefix: "lootbox",
      bucket: "guildfx-exchange.appspot.com",
    });
    return {
      json: savedFragmentJSON,
      txt: savedFragmentTXT,
    };
  },
});

export = action;
