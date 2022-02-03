/**
 * 
 * Fire below from OpenZeppelin AutoTask
 * 
const axios = require("axios");
const ethers = require("ethers");

exports.handler = async function(event) {
   // const logs = event.request.body.transaction.logs;
  	const transaction = event.request.body.transaction
   let abi = [
      "event Transfer(address indexed from, address indexed to, uint256 amount)"
    ];
    
    const decryptedLogs = [];
    // const iface = new ethers.utils.Interface(abi);
    // logs.forEach((log) => {
    //  const x = iface.parseLog(log);
    //  decryptedLogs.push(x);
    // });
    await axios.post(
      "https://enq29lu51itmtc4.m.pipedream.net",
      transaction
    );
}
 * 
 * 
 */

import ethers from "ethers";

console.log(`

----- Full Event Data

`);
const transaction = event.body;

const readEVMLogs = (logs) => {
  const abi = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
  ];
  const iface = new ethers.utils.Interface(abi);
  const decodedLogs = logs
    .map((log) => {
      try {
        return iface.decodeEventLog("Transfer", log.data, log.topics);
      } catch (e) {
        return;
      }
    })
    .filter((d) => d);
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
