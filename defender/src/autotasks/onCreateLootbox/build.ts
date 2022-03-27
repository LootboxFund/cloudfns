import dotenv from "dotenv";
dotenv.config();
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import manifest from "./manifest.json";
import { AutotaskClient } from "defender-autotask-client";
import { constants } from "./constants";
import { buildSecretsPath } from "../../constants";

// This takes credentials from application
// Authentication should be via DEFAULT_APPLICATION_CREDENTIALS w gcloud cli
const client = new SecretManagerServiceClient();

const main = async () => {
  const apiKeyConfig = manifest.secretManager.secrets.find(
    (secret) => secret.name === "defenderApiKey"
  );
  const apiSecretConfig = manifest.secretManager.secrets.find(
    (secret) => secret.name === "defenderApiSecret"
  );

  if (!apiKeyConfig || !apiSecretConfig) {
    console.error("Credentials not configured in Manifest");
    return;
  }

  const [[defenderApiKeyResponse], [defenderApiSecretResponse]] =
    await Promise.all([
      client.accessSecretVersion({
        name: buildSecretsPath(
          manifest.googleCloud.projectID,
          "defenderApiKey",
          apiKeyConfig.version
        ),
      }),
      client.accessSecretVersion({
        name: buildSecretsPath(
          manifest.googleCloud.projectID,
          "defenderApiSecret",
          apiSecretConfig.version
        ),
      }),
    ]);

  const [apiKey, apiSecret] = [
    defenderApiKeyResponse?.payload?.data?.toString(),
    defenderApiSecretResponse?.payload?.data?.toString(),
  ];

  if (!apiKey || !apiSecret) {
    console.error("Credentials not configured in GCP Secret Manager");
    return;
  }

  const creds = {
    apiKey,
    apiSecret,
  };

  const autoTaskClient = new AutotaskClient(creds);

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
