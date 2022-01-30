const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("defender-relay-client/lib/ethers");
const axios = require("axios");

// Entrypoint for the Autotask
exports.handler = async function (event: any) {
  console.log(event);
  // try {
  //   await axios.post("https://enq29lu51itmtc4.m.pipedream.net", event);
  // } catch (e) {
  //   console.log(e);
  // }
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
