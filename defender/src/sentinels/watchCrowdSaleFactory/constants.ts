// @ts-ignore-next-line
import { abi } from "../../abi/CrowdSaleFactory.json";

export const constants = {
  NAME: "Watch CrowdSale Factory",
  CHAIN_ALIAS: "rinkeby",
  AUTO_TASK_ID: "097950fa-6dce-4009-8280-19b9ed74fe0e",
  SENTINAL_WATCH_ADDRESS: "0xafdAAFc812fC1145cE04f800400ebbcaD4283257",
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: `CrowdSaleCreated(address,address,address,address,address,uint256,address)`,
    },
  ],
  PIPEDREAM_WEBHOOK: "https://enq29lu51itmtc4.m.pipedream.net",
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
