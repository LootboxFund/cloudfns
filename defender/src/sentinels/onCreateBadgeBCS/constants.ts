import { abi } from "../../abi/BadgeFactoryBCS.json";
import { ExternalCreateSubscriberRequest } from "defender-sentinel-client/lib/models/subscriber";

export const constants = {
  AUTO_TASK_ID: "_______",
  ABI: abi,
  NAME: "Badge BlockchainSpace",
  NETWORK: "matic",
  SENTINAL_WATCH_ADDRESS: "________",
  EVENT_SIGNATURES: [
    {
      eventSignature: `BadgeCreated(string,address,address,string)`,
    },
  ],
};

export const sentinel: ExternalCreateSubscriberRequest = {
  network: constants.NETWORK,
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
