import axios from "axios";
import { AutotaskEvent, SentinelTriggerEvent } from "defender-autotask-utils";
import { constants } from "./constants";
import jwt from "jsonwebtoken";

// Entrypoint for the Autotask
exports.handler = async function (event: AutotaskEvent) {
  const { JWT_ON_CREATE_LOOTBOX } = event.secrets || {};

  if (!JWT_ON_CREATE_LOOTBOX) {
    throw new Error("JWT_ON_CREATE_LOOTBOX not configured");
  }

  const token = jwt.sign(
    {
      // 30 second expiration
      exp: Math.floor(Date.now() / 1000) + 30,
    },
    JWT_ON_CREATE_LOOTBOX
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
