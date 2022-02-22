// @ts-ignore-next-line
import { abi } from "../../abi/CrowdSaleFactory.json";

export const constants = {
  NAME: "Watch CrowdSale Factory",
  CHAIN_ALIAS: "rinkeby",
  AUTO_TASK_ID: "ff66a3a5-38d0-4dc6-a1a0-1e55a0de656c",
  SENTINAL_WATCH_ADDRESS: "0x74e434Eec316B46b1073A3Ec4490afa391e69d63",
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: `CrowdSaleCreated(address,address,address,address,address,uint256,address)`,
    },
  ],
  PIPEDREAM_WEBHOOK: "https://6758ed811f7df5e347aee0e91edcadbc.m.pipedream.net",
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
