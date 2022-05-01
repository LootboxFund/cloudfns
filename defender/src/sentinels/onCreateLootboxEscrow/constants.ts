import { Manifest } from "../../manifest";
const manifest = Manifest.default;
import { abi } from "../../abi/LootboxEscrowFactory.json";
import { ExternalCreateSubscriberRequest } from "defender-sentinel-client/lib/models/subscriber";

export const constants = {
  AUTO_TASK_ID: manifest.openZeppelin.autoTasks.onCreateLootboxEscrow.id,
  ABI: abi,
  EVENT_SIGNATURES: [
    {
      eventSignature: `LootboxCreated(string,address,address,address,uint256,uint256,string)`,
    },
  ],
};

export const sentinels: ExternalCreateSubscriberRequest[] = Object.entries(
  manifest.openZeppelin.sentinels
).map(([_slug, sentinel]) => {
  const rawSentinel = { ...sentinel.onCreateLootboxEscrow };
  return {
    name: rawSentinel.alias,
    network: rawSentinel.ozChainSlug,
    addresses: [rawSentinel.contractWatchAddress],
    abi: JSON.stringify(constants.ABI),
    // optional
    autotaskTrigger: constants.AUTO_TASK_ID,
    // optional
    confirmLevel: 1, // if not set, we pick the blockwatcher for the chosen network with the lowest offset
    type: "BLOCK",
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
    // alertThreshold: {
    //   amount: 2,
    //   windowSeconds: 3600,
    // },
    // optional
    alertTimeoutMs: 0,
    notificationChannels: [],
  };
});
