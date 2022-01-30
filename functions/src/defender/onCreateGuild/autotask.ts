require("dotenv").config();
const { AutotaskClient } = require("defender-autotask-client");

const AUTO_TASK_ID = process.env.DEFENDER_AUTOTASK_ON_GUILD_CREATE;

const creds = {
  apiKey: process.env.DEFENDER_API_KEY,
  apiSecret: process.env.DEFENDER_API_SECRET,
};
const client = new AutotaskClient(creds);

export const uploadAutoTask = async () => {
  return await client.updateCodeFromFolder(
    AUTO_TASK_ID,
    `${process.env.DEFENDER_PATH_TO_LIB_FOLDER}/functions/lib/defender/onCreateGuild`
  );
};
