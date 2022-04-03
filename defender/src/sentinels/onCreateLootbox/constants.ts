import { Manifest } from "../../manifest";
const manifest = Manifest.default;
import { abi } from "../../abi/LootboxInstantFactory.json";
import { ExternalCreateSubscriberRequest } from "defender-sentinel-client/lib/models/subscriber";

export const constants = {
  NAME: manifest.openZeppelin.sentinels.onCreateLootbox.alias,
  CHAIN_ALIAS: manifest.openZeppelin.sentinels.onCreateLootbox.ozChainSlug,
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateLootbox.id,
  SENTINAL_WATCH_ADDRESS:
    manifest.openZeppelin.sentinels.onCreateLootbox.contractWatchAddress,
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: `LootboxCreated(string,address,address,address,uint256,uint256,string)`,
    },
  ],
};

export const sentinel: ExternalCreateSubscriberRequest = {
  network: constants.CHAIN_ALIAS,
  // optional
  confirmLevel: 1, // if not set, we pick the blockwatcher for the chosen network with the lowest offset
  name: constants.NAME,
  addresses: [constants.SENTINAL_WATCH_ADDRESS],
  type: "BLOCK",
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
