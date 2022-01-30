require("dotenv").config();
import { GUILDFACTORY } from "../../constants";
import GuildFactoryABI from "../../abi/GuildFactory.json";

const { SentinelClient } = require("defender-sentinel-client");

const AUTO_TASK_ID = process.env.DEFENDER_AUTOTASK_ON_GUILD_CREATE;

const creds = {
  apiKey: process.env.DEFENDER_API_KEY,
  apiSecret: process.env.DEFENDER_API_SECRET,
};
const client = new SentinelClient(creds);

const sentinel = {
  network: "bsctest",
  // optional
  confirmLevel: 1, // if not set, we pick the blockwatcher for the chosen network with the lowest offset
  name: "onGuildCreated",
  address: GUILDFACTORY,
  abi: JSON.stringify(GuildFactoryABI.abi),
  // optional
  paused: false,
  // optional
  eventConditions: [
    {
      eventSignature:
        "GuildCreated(address,string,string,address,address,address,address)",
    },
  ],
  // optional
  functionConditions: [],
  // optional
  txCondition: "",
  // optional
  autotaskCondition: AUTO_TASK_ID,
  // optional
  autotaskTrigger: undefined,
  // optional
  alertThreshold: {
    amount: 2,
    windowSeconds: 3600,
  },
  // optional
  alertTimeoutMs: 0,
  notificationChannels: [],
};

export const createSentinel = async () => {
  console.log("Creating sentinel...");
  return await client.create(sentinel);
};
