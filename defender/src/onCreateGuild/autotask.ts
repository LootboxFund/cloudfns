require("dotenv").config();
const { AutotaskClient } = require("defender-autotask-client");

const AUTO_TASK_ID = process.env.DEFENDER_AUTOTASK_ON_CREATE_GUILD;

const creds = {
  apiKey: process.env.DEFENDER_API_KEY,
  apiSecret: process.env.DEFENDER_API_SECRET,
};
const client = new AutotaskClient(creds);

export const uploadAutoTask = async () => {
  console.log(`
  
  --- ⏳ Uploading auto task onCreateGuild...
  
  `);
  const x = await client.updateCodeFromFolder(
    AUTO_TASK_ID,
    `${process.env.DEFENDER_PATH_TO_LIB_FOLDER}/lib/onCreateGuild`
  );
  console.log(x);
  console.log(`
  
  --- ✅ Uploaded auto task onCreateGuild
  
  `);
  return;
};
