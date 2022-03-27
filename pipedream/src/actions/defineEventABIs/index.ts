import { defineAction } from "ironpipe";
import { ABIUtilRepresenation } from "@wormgraph/helpers";

import { Manifest } from "../../manifest";
const manifest = Manifest.default;

const action = defineAction({
  name: manifest.pipedream.actions.defineEventABIs.alias,
  description:
    "Define the ABI of on-chain events that get emitted by  smart contracts",
  key: manifest.pipedream.actions.defineEventABIs.slug,
  version: manifest.pipedream.actions.defineEventABIs.pipedreamSemver,
  type: "action",
  props: {},
  async run() {
    return {
      ERC20: [Transfer, Approval],
      LootboxFactory: [LootboxCreated],
    };
  },
});

const Transfer: ABIUtilRepresenation = {
  abi: `
event Transfer(
  address indexed from, 
  address indexed to, 
  uint256 value
)
`,
  keys: ["from", "to", "value"],
};

const Approval: ABIUtilRepresenation = {
  abi: `
event Approval(
  address indexed owner,
  address indexed spender,
  uint256 value
)`,
  keys: ["owner", "spender", "value"],
};

const LootboxCreated: ABIUtilRepresenation = {
  abi: `
event LootboxCreated(
  string lootboxName,
  address indexed lootbox,
  address indexed issuer,
  address indexed treasury,
  uint256 maxSharesSold,
  uint256 sharePriceUSD
)
`,
  keys: [
    "lootboxName",
    "lootbox",
    "issuer",
    "treasury",
    "maxSharesSold",
    "sharePriceUSD",
  ],
};

export = action;
