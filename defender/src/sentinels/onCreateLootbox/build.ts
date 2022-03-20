import dotenv from "dotenv";
dotenv.config();

import { SentinelClient } from "defender-sentinel-client";
import { constants, sentinel } from "./constants";

const creds = {
  apiKey: process.env.DEFENDER_API_KEY || "",
  apiSecret: process.env.DEFENDER_API_SECRET || "",
};
const sentinelClient = new SentinelClient(creds);

const main = async () => {
  try {
    console.log(`
  
  --- ⏳ Deploying the sentinel...
  
  `);
    console.log(`

--- watchOnCreateLootbox sentinel ---
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
