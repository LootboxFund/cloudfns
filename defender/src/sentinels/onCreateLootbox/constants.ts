import { Manifest } from "../../manifest";
const manifest = Manifest.default;
import { abi } from "../../abi/LootboxFactory.json";
      
export const constants = {
  NAME: manifest.openZeppelin.sentinels.onCreateLootbox.alias,
  CHAIN_ALIAS: manifest.openZeppelin.sentinels.onCreateLootbox.ozChainSlug,
  AUTO_TASK_ID: manifest.openZeppelin.sentinels.onCreateLootbox.autoTaskHandlerID,
  SENTINAL_WATCH_ADDRESS: manifest.openZeppelin.sentinels.onCreateLootbox.contractWatchAddress,
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: `LootboxCreated(string,address,address,address,uint256,uint256)`,
    },
  ],
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
