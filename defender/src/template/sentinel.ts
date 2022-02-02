import dotenv from "dotenv";
dotenv.config();

// @ts-ignore-next-line
import DaiABI from "../abi/DAI.json";

import { SentinelClient } from "defender-sentinel-client";

const AUTO_TASK_ID = process.env.DEFENDER_AUTOTASK_DEBUGGER || "";

const creds = {
  apiKey: process.env.DEFENDER_API_KEY || "",
  apiSecret: process.env.DEFENDER_API_SECRET || "",
};
const client = new SentinelClient(creds);

const sentinel = {
  network: "bsctest",
  // optional
  confirmLevel: 1, // if not set, we pick the blockwatcher for the chosen network with the lowest offset
  name: "templateSentinel",
  address: process.env.ADDR_DEBUGGER_SANBOX || "",
  abi: JSON.stringify(DaiABI.abi),
  // optional
  paused: false,
  // optional
  eventConditions: [
    {
      eventSignature: "Transfer(address,address,uint256)",
    },
  ],
  // optional
  functionConditions: [],
  // optional
  txCondition: 'status == "success"',
  // optional
  autotaskCondition: AUTO_TASK_ID,
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

export const createSentinel = async () => {
  console.log(`

--- template sentinel ---
AutoTask ID: ${AUTO_TASK_ID}
Address: ${process.env.ADDR_GUILD_FACTORY}

`);
  const x = await client.create(sentinel);
  console.log(x);
  return;
};
