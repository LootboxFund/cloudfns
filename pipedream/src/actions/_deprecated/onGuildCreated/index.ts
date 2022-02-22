import { BlockTriggerEvent } from "defender-autotask-utils";
import { defineAction } from "ironpipe";
import { indexGBucketRoute, saveFileToGBucket } from "../../../api/gbucket";
import { generateRandomLogo } from "../../../api/helpers";
import { ABIUtilRepresenation } from "../../../types";
import { decodeEVMLogs } from "../../../api/evm";
import { Address } from '@lootboxfund/helpers';


interface Event_GuildCreated {
  contractAddress: Address;
  guildTokenName: string;
  guildTokenSymbol: string;
  dao: Address;
  developer: Address;
  creator: Address;
  guildFactory: Address;
}

const action = defineAction({
  name: "onGuildCreated",
  description: `
    Pipeline for handling GuildCreated event
    0. Parse the EVM logs
    1. Save tokens/address.json to GBucket for FE to consume
    2. Save tokens/address.txt to GBucket for OZ to consume
    3. Save tokens/index.json to GBucket for FE to consume
    4. Forward parsed data down pipe
  `,
  key: "onGuildCreated",
  version: "0.0.14",
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
    const decodedLogs = decodeEVMLogs<Event_GuildCreated>({
      eventName: "GuildCreated",
      logs: transaction.logs,
      abiReps,
    });
    console.log(decodedLogs);

    // save the guildtoken.json to gbucket
    const savedTokenFragments = await Promise.all(
      decodedLogs.map(async (ev) => {
        return saveFileToGBucket({
          alias: `JSON for guild token ${ev.contractAddress} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.contractAddress}.json`,
          semver: "0.1.0-demo",
          chainIdHex: "0x61",
          prefix: "tokens",
          bucket: "guildfx-exchange.appspot.com",
          data: JSON.stringify({
            address: ev.contractAddress,
            decimals: 18,
            name: ev.guildTokenName,
            symbol: ev.guildTokenSymbol,
            chainIdHex: "0x61",
            chainIdDecimal: "97",
            logoURI: generateRandomLogo(),
            priceOracle: "",
          }),
        });
      })
    );

    // save the guild.txt to gbucket
    const savedGuildFragments = await Promise.all(
      decodedLogs.map(async (ev) => {
        const note = `
          Welcome to GuildFX!
          Your Guild token has been created. Add its address below to your OpenZeppelin Defender:

          ${ev.guildTokenName} | ${ev.guildTokenSymbol}
          Token Address: ${
            ev.contractAddress
          } (import this contract address to OZ Defender)

          DAO Address: ${ev.dao}
          Developer Address: ${ev.developer}
          Created By Factory: ${ev.guildFactory}
          Created By EOA: ${ev.creator}
          Timestamp: ${new Date().toISOString()}
        `;
        return await saveFileToGBucket({
          alias: `TXT for guild token ${ev.contractAddress} triggered by tx hash ${transaction.transactionHash}`,
          credentials,
          fileName: `${ev.contractAddress}.txt`,
          semver: "0.1.0-demo",
          chainIdHex: "0x61",
          prefix: "tokens",
          bucket: "guildfx-exchange.appspot.com",
          data: note,
        });
      })
    );
    // index the rest of the guildtokens
    await indexGBucketRoute({
      alias: `Index guild tokens triggered by tx hash ${transaction.transactionHash}`,
      credentials,
      semver: "0.1.0-demo",
      chainIdHex: "0x61",
      prefix: "tokens",
      bucket: "guildfx-exchange.appspot.com",
    });
    return {
      token: savedTokenFragments,
      guild: savedGuildFragments,
    };
  },
});

export = action;
