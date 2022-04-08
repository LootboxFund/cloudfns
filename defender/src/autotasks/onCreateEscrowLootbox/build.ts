/**
 * This file is only used to deploy the onCreateLootbox autotask locally
 *
 * Dependencies that it uses (i.e. ../../services/secrets) dont get included in the bundle atm
 */

import dotenv from "dotenv";
dotenv.config();

import { AutotaskClient } from "defender-autotask-client";
import { constants } from "./constants";
import { getDefenderApiCredentials } from "../../services/secrets"; // This file is not actually bundled into the autotask

const main = async () => {
  const credentials = await getDefenderApiCredentials();

  if (!credentials) {
    return;
  }

  const autoTaskClient = new AutotaskClient(credentials);

  try {
    const pathToFolder = `${process.env.DEFENDER_PATH_TO_LIB_FOLDER}/lib/autotasks/${constants.FOLDER_NAME}`;
    console.log(`
  
  --- ⏳ Uploading auto task handleFactories()...
  
  ${pathToFolder}
  `);

    const x = await autoTaskClient.updateCodeFromFolder(
      constants.AUTO_TASK_ID,
      pathToFolder
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
