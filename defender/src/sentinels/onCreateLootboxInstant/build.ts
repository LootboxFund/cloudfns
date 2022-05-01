/**
 * This file is only used to deploy the onCreateLootbox autotask locally
 *
 * Dependencies that it uses (i.e. ../../services/secrets) dont get included in the bundle
 */

import dotenv from "dotenv";
dotenv.config();

import { SentinelClient } from "defender-sentinel-client";
import { constants, sentinels } from "./constants";
import { getDefenderApiCredentials } from "../../services/secrets"; // This file is not actually bundled into the autotask

const main = async () => {
  const credentials = await getDefenderApiCredentials();

  if (!credentials) {
    return;
  }

  const sentinelClient = new SentinelClient(credentials);

  console.log(`

    --- ⏳ Deploying the sentinel...

  `);

  sentinels.map(async (sentinel) => {
    try {
      console.log(`
  
        --- watchOnCreateLootboxInstant sentinel ---
        ChainID: ${sentinel.network}
        AutoTask ID: ${constants.AUTO_TASK_ID}
        Address: ${sentinel.addresses?.join(", ")}
      
      `);

      const x = await sentinelClient.create(sentinel);
      console.log(x);
    } catch (e) {
      console.log(e);
    }
  });
};

main();
