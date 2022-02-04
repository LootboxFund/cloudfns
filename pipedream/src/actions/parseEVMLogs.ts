/**
 * Fire below from OpenZeppelin AutoTask
 *
 */

import ethers from "ethers";
import { BlockTriggerEvent, EthLog } from "defender-autotask-utils";
import { filterMap } from "../api/tsUtil";

const x = async (event: any) => {
  const chainEvent: BlockTriggerEvent = event.body.transaction;
  const transaction = chainEvent.transaction;

  const readEVMLogs = (logs: EthLog[]) => {
    const abi = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
    ];
    const iface = new ethers.utils.Interface(abi);
    const decodedLogs = filterMap(logs, (log) => {
      try {
        return iface.decodeEventLog("Transfer", log.data, log.topics);
      } catch (e) {
        return;
      }
    });
    console.log(`
  
    ----- Decoded Logs
  
    `);
    console.log(decodedLogs);
    return decodedLogs;
  };

  readEVMLogs(transaction.logs);

  $respond({
    status: 200,
    event,
  });

  return;
};
