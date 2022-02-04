import axios from "axios";
import { AutotaskEvent, SentinelTriggerEvent } from "defender-autotask-utils";

// Entrypoint for the Autotask
exports.handler = async function (event: AutotaskEvent) {
  if (event.request && event.request.body) {
    const transaction = event.request.body as SentinelTriggerEvent;
    await axios.post("https://enq29lu51itmtc4.m.pipedream.net", transaction);
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
