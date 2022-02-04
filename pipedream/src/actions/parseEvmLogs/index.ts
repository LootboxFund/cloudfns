/// <reference path="../../api/helpers.ts"/>
import { BlockTriggerEvent } from "defender-autotask-utils";
import { ethers } from "ethers";
import { defineAction } from "ironpipe";
import { ERC20_TransferEvent } from "../../types";

const EventParams = ["from", "to", "value"];

export default {
  name: "Parse EVM Logs",
  description: "Parses OZ Autotask event to find & return EVM event logs",
  key: "parseEVMLogs",
  version: "1.0.31",
  type: "action",
  props: {
    googleCloud: {
      type: "app",
      app: "google_cloud",
    },
    webhookTrigger: {
      type: "object",
    },
  },
  async run() {
    const { transaction } = (this as any).webhookTrigger as BlockTriggerEvent;

    console.log(`
    
        ----- transaction
    
    `);
    console.log(transaction);
    const abi = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
    ];
    const iface = new ethers.utils.Interface(abi);
    const decodedLogs = transaction.logs
      .map((log: any) => {
        try {
          const data = iface.decodeEventLog("Transfer", log.data, log.topics);
          return EventParams.reduce(
            (acc, key) => ({
              ...acc,
              [key]: data[key],
            }),
            {}
          );
        } catch (e) {
          console.log(e);
          return;
        }
      })
      .filter((ev) => ev) as ERC20_TransferEvent[];
    console.log(`
      
        ----- Decoded Logs
      
    `);
    console.log(decodedLogs);
    const { encodeURISafe } = require("../../api/helpers");

    console.log(encodeURISafe(""));
  },
};
