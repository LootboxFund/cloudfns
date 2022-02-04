// @ts-ignore-next-line
import ABI from "../../abi/DAI.json";

export const constants = {
  NAME: "templateSentinal",
  CHAIN_ALIAS: "bsctest",
  AUTO_TASK_ID: "_________________",
  AUTO_TASK_NAME: "templateSentinal",
  SENTINAL_WATCH_ADDRESS: "_________________",
  ABI,
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
