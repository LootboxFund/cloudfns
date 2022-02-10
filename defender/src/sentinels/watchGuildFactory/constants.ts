// @ts-ignore-next-line
import { abi } from "../../abi/GuildFactory.json";

export const constants = {
  NAME: "Watch GuildFactory",
  CHAIN_ALIAS: "rinkeby",
  AUTO_TASK_ID: "85134511-d6c5-4953-91a9-60fceb35c0a7",
  SENTINAL_WATCH_ADDRESS: "0xa73b86A33D187221139721d9d0aDD15503ccF11f",
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: `GuildCreated(address,string,string,address,address,address,address)`,
    },
  ],
  PIPEDREAM_WEBHOOK: "https://3984ba81f5670bb7803b6cc3e440dc0a.m.pipedream.net",
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
  // autotaskCondition: undefined,
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
