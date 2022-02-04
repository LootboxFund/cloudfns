// @ts-ignore-next-line
import ABI from "../../abi/DAI.json";

export const constants = {
  NAME: "Watch GuildFactory",
  CHAIN_ALIAS: "rinkeby",
  AUTO_TASK_ID: "a7f13376-0e3f-45a1-823f-b1dc25a6429f",
  SENTINAL_WATCH_ADDRESS: "0x828195351362F5781d08Ec15Ad1122aFf298F7bb",
  ABI,
  EVENT_SIGNATURES: [
    {
      eventSignature:
        "CrowdSaleCreated(address,address,address,address,address,uint256,address)",
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
  autotaskCondition: constants.AUTO_TASK_ID,
  // optional
  autotaskTrigger: undefined,
  // optional
  // alertThreshold: {
  //   amount: 2,
  //   windowSeconds: 3600,
  // },
  // optional
  alertTimeoutMs: 0,
  notificationChannels: [],
};
