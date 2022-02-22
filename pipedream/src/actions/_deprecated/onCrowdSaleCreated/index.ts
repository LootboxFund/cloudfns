import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { indexGBucketRoute, saveFileToGBucket } from "../../../api/gbucket";
import { ABIUtilRepresenation, Event_CrowdSaleCreated } from "../../../types";
import { decodeEVMLogs } from "../../../api/evm";

const action = defineAction({
  name: "onCrowdSaleCreated",
  description: `
    Pipeline for handling CrowdSaleCreated event
    0. Parse the EVM logs
    1. Save crowdsales/address.json to GBucket for FE to consume
    2. Save crowdsales/address.txt to GBucket for OZ to consume
    3. Save crowdsales/index.json to GBucket for FE to consume
    4. Forward parsed data down pipe
  `,
  key: "onCrowdSaleCreated",
  version: "0.0.11",
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
    const decodedLogs = decodeEVMLogs<Event_CrowdSaleCreated>({
      eventName: "CrowdSaleCreated",
      logs: transaction.logs,
      abiReps,
    });
    console.log(decodedLogs);

    // save the crowdsale.json to gbucket
    const savedCrowdSaleJSONFragments = await Promise.all(
      decodedLogs.map(async (ev) => {
        return saveFileToGBucket({
          alias: `JSON for crowdsale ${ev.crowdsaleAddress} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.crowdsaleAddress}.json`,
          semver: "0.1.0-demo",
          chainIdHex: "0x61",
          prefix: "crowdsales",
          bucket: "guildfx-exchange.appspot.com",
          data: JSON.stringify({
            address: ev.crowdsaleAddress,
            tokenAddress: ev.guildToken,
            chainIdHex: "0x61",
            chainIdDecimal: "97",
          }),
        });
      })
    );

    // save the crowdsale.txt to gbucket
    const savedCrowdSaleTXTFragments = await Promise.all(
      decodedLogs.map(async (ev) => {
        const note = `
        Get ready to fundraise!
        Your Guild Crowdsale has been created. Add its address below to your OpenZeppelin Defender:
        
        CrowdSale Address: ${
          ev.crowdsaleAddress
        } (import this contract address to OZ Defender)

        Guild Token Address: ${ev.guildToken} (whats for sale)
        Starting Price: ${ev.startingPrice}

        DAO Address: ${ev.dao} (make sure this is controlled by you)
        DEV Address: ${ev.developer}
        Treasury Address: ${ev.treasury}
        Deployer Address: ${ev.deployer}
        Timestamp: ${new Date().toISOString()}
        `;
        return await saveFileToGBucket({
          alias: `TXT for crowdsale ${ev.crowdsaleAddress} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.crowdsaleAddress}.txt`,
          semver: "0.1.0-demo",
          chainIdHex: "0x61",
          prefix: "crowdsales",
          bucket: "guildfx-exchange.appspot.com",
          data: note,
        });
      })
    );
    // index the rest of the crowdsales
    await indexGBucketRoute({
      alias: `CrowdSale Index triggered by tx hash ${transaction.transactionHash}`,
      credentials,
      semver: "0.1.0-demo",
      chainIdHex: "0x61",
      prefix: "crowdsales",
      bucket: "guildfx-exchange.appspot.com",
    });
    return {
      crowdsaleJSON: savedCrowdSaleJSONFragments,
      crowdsaleTxt: savedCrowdSaleTXTFragments,
    };
  },
});

export = action;
