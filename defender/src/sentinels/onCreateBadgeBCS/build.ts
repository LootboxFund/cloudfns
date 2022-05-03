/**
 * This file is only used to deploy the onCreateLootbox autotask locally
 *
 * Dependencies that it uses (i.e. ../../services/secrets) dont get included in the bundle
 */

import dotenv from "dotenv";
dotenv.config();

import { SentinelClient } from "defender-sentinel-client";
import { constants, sentinel } from "./constants";

const getLocalDefenderApiCredentials = () => ({
  apiKey: process.env.BCS_DEFENDER_API_KEY || "",
  apiSecret: process.env.BCS_DEFENDER_API_SECRET || "",
});

const main = async () => {
  const credentials = await getLocalDefenderApiCredentials();

  if (!credentials) {
    return;
  }

  const sentinelClient = new SentinelClient(credentials);

  try {
    console.log(`
  
  --- ⏳ Deploying the BCS Badge sentinel...
  
  `);
    console.log(`

--- watchOnBadgeBCS sentinel ---
AutoTask ID: ${constants.AUTO_TASK_ID}
Address: ${constants.SENTINAL_WATCH_ADDRESS}

`);
    const x = await sentinelClient.create(sentinel);
    console.log(x);
  } catch (e) {
    console.log(e);
  }
};

main();
