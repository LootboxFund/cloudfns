import dotenv from "dotenv";
dotenv.config();

import { SentinelClient } from "defender-sentinel-client";
import { AutotaskClient } from "defender-autotask-client";
import { constants, sentinel } from "./constants";

const creds = {
  apiKey: process.env.DEFENDER_API_KEY || "",
  apiSecret: process.env.DEFENDER_API_SECRET || "",
};
const sentinelClient = new SentinelClient(creds);
const autoTaskClient = new AutotaskClient(creds);

const main = async () => {
  try {
    console.log(`
  
  --- ⏳ Uploading auto task onCreateGuild...
  
  `);
    const x = await autoTaskClient.updateCodeFromFolder(
      constants.AUTO_TASK_ID,
      `${process.env.DEFENDER_PATH_TO_LIB_FOLDER}/lib/${constants.AUTO_TASK_NAME}`
    );
    console.log(x);
    console.log(`
  
  --- ✅ Uploaded auto task template
  
  `);
  } catch (e) {
    console.log(e);
  }
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
