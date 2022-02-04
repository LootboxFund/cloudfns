const axios = require("axios");
const ethers = require("ethers");

exports.handler = async function (event) {
  const logs = event.request.body.transaction.logs;
  let abi = [
    "event Transfer(address indexed from, address indexed to, uint256 amount)",
  ];
  const decryptedLogs = [];
  const iface = new ethers.utils.Interface(abi);
  logs.forEach((log) => {
    const x = iface.parseLog(log);
    decryptedLogs.push(x);
  });
  await axios.post(
    "https://89f633ef6cb67740697f3c0885695a46.m.pipedream.net",
    decryptedLogs
  );
};

const axios = require("axios");
const ethers = require("ethers");

exports.handler = async function (event) {
  const transaction = event.request.body.transaction;
  await axios.post("https://enq29lu51itmtc4.m.pipedream.net", transaction);
};
