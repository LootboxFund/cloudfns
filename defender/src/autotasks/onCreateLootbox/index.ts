import axios from "axios";
import { AutotaskEvent, SentinelTriggerEvent } from "defender-autotask-utils";
import { constants } from "./constants";
import jwt from "jsonwebtoken";

// Entrypoint for the Autotask
exports.handler = async function (event: AutotaskEvent) {
  const token = jwt.sign(
    {
      // 30 second expiration
      exp: Math.floor(Date.now() / 1000) + 30,
    },
    "mysecret"
  );

  const { PD_ONCREATE_LOOTBOX_SECRET } = event.secrets || {};

  if (!PD_ONCREATE_LOOTBOX_SECRET) {
    throw new Error("PD_ONCREATE_LOOTBOX_SECRET not configured");
  }

  if (event.request && event.request.body) {
    const transaction = event.request.body as SentinelTriggerEvent;

    await axios.post(constants.PIPEDREAM_WEBHOOK, transaction, {
      headers: {
        secret: PD_ONCREATE_LOOTBOX_SECRET,
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
