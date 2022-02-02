import axios from "axios";
import ethers from "ethers";
import { AutotaskEvent, BlockTriggerEvent } from "defender-autotask-utils";

// Entrypoint for the Autotask
exports.handler = async function (event: AutotaskEvent) {
  if (event.request && event.request.body) {
    const match = event.request.body as BlockTriggerEvent;
    const logs = match.transaction.logs;
    let abi = [
      "event Transfer(address indexed from, address indexed to, uint256 amount)",
    ];
    const decryptedLogs: any[] = [];
    const iface = new ethers.utils.Interface(abi);
    logs.forEach((log) => {
      const x = iface.parseLog(log);
      decryptedLogs.push(x);
    });
    await axios.post(
      "https://89f633ef6cb67740697f3c0885695a46.m.pipedream.net",
      decryptedLogs
    );
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
