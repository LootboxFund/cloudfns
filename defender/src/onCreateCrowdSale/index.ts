// const { ethers } = require("ethers");
// const {
//   DefenderRelaySigner,
//   DefenderRelayProvider,
// } = require("defender-relay-client/lib/ethers");
import axios from "axios";
import { AutotaskEvent, BlockTriggerEvent } from "defender-autotask-utils";

// Entrypoint for the Autotask
exports.handler = async function (event: AutotaskEvent) {
  if (event.request && event.request.body) {
    const match = event.request.body as BlockTriggerEvent;
    const logs = match.transaction.logs;
    console.log(match);
    console.log("Hitting the autotask endpoint");
    console.log(event);
    const PIPEDREAM_GBUCKET_CROWDSALE_UPLOADER = "_______________";

    const formattedEvent = {
      semvar: "0.0.1-sandbox",
      chainIdHex: "0x61",
      prefix: "tokens",
      bucket: "guildfx-exchange.appspot.com",
      data: {
        address: "0x________",
        chainIdHex: "0x61",
        chainIdDecimal: "97",
        decimals: 18,
        logoURI:
          "https://wtwp.com/wp-content/uploads/2015/06/placeholder-image.png",
        name: "Hello World",
        priceOracle: "0x________",
        symbol: "SUP",
      },
    };
    try {
      await axios.post(PIPEDREAM_GBUCKET_CROWDSALE_UPLOADER, formattedEvent);
    } catch (e) {
      console.log(e);
    }
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
