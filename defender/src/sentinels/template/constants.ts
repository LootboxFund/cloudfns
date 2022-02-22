// @ts-ignore-next-line
import { abi } from "../../abi/DAI.json";
// import { Manifest } from "../../index";
// const manifest = Manifest.default;

export const constants = {
  NAME: "manifest.openZeppelin.sentinels.onCreateLootbox.alias",
  CHAIN_ALIAS: "manifest.openZeppelin.sentinels.onCreateLootbox.ozChainSlug",
  AUTO_TASK_ID: "manifest.openZeppelin.sentinels.onCreateLootbox.autoTaskHandlerID",
  SENTINAL_WATCH_ADDRESS: "manifest.openZeppelin.sentinels.onCreateLootbox.contractWatchAddress",
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: "Transfer(address,address,uint256)",
    },
  ],
  PIPEDREAM_WEBHOOK: "https://___________________.m.pipedream.net",
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
