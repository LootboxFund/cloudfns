/**
 * This file is only used to deploy autotasks locally
 *
 * Dependencies that it uses (i.e. ../../services/secrets) dont get included in the autotask bundle atm
 */

import dotenv from "dotenv";
dotenv.config();

import { SentinelClient } from "defender-sentinel-client";
import { constants, sentinel } from "./constants";
import { getDefenderApiCredentials } from "../../services/secrets"; // This file is not actually bundled into the autotask

const main = async () => {
  const credentials = await getDefenderApiCredentials();

  if (!credentials) {
    return;
  }

  const sentinelClient = new SentinelClient(credentials);

  try {
    console.log(`
  
  --- ⏳ Deploying the sentinel...
  
  `);
    console.log(`

--- template sentinel ---
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
