import dotenv from "dotenv";
dotenv.config();
import { AutotaskClient } from "defender-autotask-client";
import { constants } from "./constants";

const creds = {
  apiKey: process.env.DEFENDER_API_KEY || "",
  apiSecret: process.env.DEFENDER_API_SECRET || "",
};
const autoTaskClient = new AutotaskClient(creds);

const main = async () => {
  try {
    console.log(`
  
  --- ⏳ Uploading auto task template()...
  
  `);
    const x = await autoTaskClient.updateCodeFromFolder(
      constants.AUTO_TASK_ID,
      `${process.env.DEFENDER_PATH_TO_LIB_FOLDER}/lib/tasks/${constants.FOLDER_NAME}`
    );
    console.log(x);
    console.log(`
  
  --- ✅ Uploaded auto task template
  
  `);
  } catch (e) {
    console.log(e);
  }
};

main();
