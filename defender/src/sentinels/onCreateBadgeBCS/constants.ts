import { Manifest } from "../../manifest";
const manifest = Manifest.default;
import { abi } from "../../abi/BadgeFactoryBCS.json";
import { ExternalCreateSubscriberRequest } from "defender-sentinel-client/lib/models/subscriber";

export const constants = {
  NAME: "onCreateBadgeBCS",
  CHAIN_ALIAS: "mumbai",
  AUTO_TASK_ID: "cbe79a32-979b-4adf-bf65-2051f7932f80",
  SENTINAL_WATCH_ADDRESS: "0x58CeB1A7aB895EA125AFB901b9a7B1095B126452",
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: `BadgeCreated(string,address,address,string)`,
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
