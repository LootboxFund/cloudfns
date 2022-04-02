import axios from "axios";
import { AutotaskEvent, SentinelTriggerEvent } from "defender-autotask-utils";
import { constants } from "./constants";
import jwt from "jsonwebtoken";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// Entrypoint for the Autotask
exports.handler = async function (event: AutotaskEvent) {
  if (!constants.SECRET_NAME || !constants.SECRET_VERSION) {
    throw new Error("JWT secret not properly configured in manifest");
  }

  const { SA_ON_CREATE_LOOTBOX } = event.secrets || {};

  if (!SA_ON_CREATE_LOOTBOX) {
    throw new Error("SA_ON_CREATE_LOOTBOX not configured");
  }

  const serviceAccountKey = JSON.parse(SA_ON_CREATE_LOOTBOX);

  const gsmClient = new SecretManagerServiceClient({
    projectId: serviceAccountKey.project_id,
    credentials: {
      client_email: serviceAccountKey.client_email,
      private_key: serviceAccountKey.private_key,
    },
  });

  let jwtEncryptionSecret = undefined;

  const [jwtSecretResponse] = await gsmClient.accessSecretVersion({
    name: `projects/${constants.PROJECT_ID}/secrets/${constants.SECRET_NAME}/versions/${constants.SECRET_VERSION}`,
  });

  jwtEncryptionSecret = jwtSecretResponse?.payload?.data?.toString();

  if (!jwtEncryptionSecret) {
    throw new Error("JWT Secret Not Found");
  }

  const token = jwt.sign(
    {
      // 30 second expiration
      exp: Math.floor(Date.now() / 1000) + 30,
    },
    jwtEncryptionSecret
  );

  if (event.request && event.request.body) {
    const transaction = event.request.body as SentinelTriggerEvent;

    await axios.post(constants.PIPEDREAM_WEBHOOK, transaction, {
      headers: {
        authorization: "Bearer " + token,
      },
    });
  }
};

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
  exports
    .handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch((error: Error) => {
      console.error(error);
      process.exit(1);
    });
}
