// @ts-ignore-next-line
import { abi } from "../../abi/LootboxFactory.json";

      
export const constants = {
  NAME: "Watch Lootbox Factory",
  CHAIN_ALIAS: "bsctest",
  AUTO_TASK_ID: "92575d25-3244-4107-ad03-c71455cd85ca",
  SENTINAL_WATCH_ADDRESS: "0x390cf9617D4c7e07863F3482736D05FC1dC0406E",
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: `LootboxCreated(string,address,address,address,uint256,uint256)`,
    },
  ],
  PIPEDREAM_WEBHOOK: "https://36d700b09bcc4ce31a06ca8b8e62a783.m.pipedream.net",
};

export const sentinel = {
  network: constants.CHAIN_ALIAS,
  // optional
  confirmLevel: 1, // if not set, we pick the blockwatcher for the chosen network with the lowest offset
  name: constants.NAME,
  address: constants.SENTINAL_WATCH_ADDRESS,
  abi: JSON.stringify(constants.ABI),
  // optional
  paused: false,
  // optional
  eventConditions: constants.EVENT_SIGNATURES,
  // optional
  functionConditions: [],
  // optional
  txCondition: 'status == "success"',
  // optional
  autotaskCondition: undefined,
  // optional
  autotaskTrigger: constants.AUTO_TASK_ID,
  // optional
  // alertThreshold: {
  //   amount: 2,
  //   windowSeconds: 3600,
  // },
  // optional
  alertTimeoutMs: 0,
  notificationChannels: [],
};
