import { defineAction } from "ironpipe";
import { ABIUtilRepresenation } from "../../types";
import manifest from "../../manifest/manifest";

const action = defineAction({
  name: manifest.pipedream.actions.defineEventABIs.alias,
  description:
    "Define the ABI of on-chain events that get emitted by smart contracts",
  key: manifest.pipedream.actions.defineEventABIs.slug,
  // version: manifest.pipedream.actions.defineEventABIs.pipedreamSemver,
  version: "0.1.7",
  type: "action",
  props: {},
  async run() {
    return {
      ERC20: [Transfer, Approval],
      LootboxInstantFactory: [InstantLootboxCreated],
      LootboxEscrowFactory: [InstantEscrowCreated],
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

const InstantLootboxCreated: ABIUtilRepresenation = {
  abi: `
event LootboxCreated(
  string lootboxName,
  address indexed lootbox,
  address indexed issuer,
  address indexed treasury,
  uint256 maxSharesSold,
  uint256 sharePriceUSD,
  string _data
)
`,
  keys: [
    "lootboxName",
    "lootbox",
    "issuer",
    "treasury",
    "maxSharesSold",
    "sharePriceUSD",
    "_data",
  ],
};

const InstantEscrowCreated: ABIUtilRepresenation = {
  abi: `
event LootboxCreated(
  string lootboxName,
  address indexed lootbox,
  address indexed issuer,
  address indexed treasury,
  uint256 targetSharesSold,
  uint256 maxSharesSold,
  uint256 sharePriceUSD,
  string _data
)
`,
  keys: [
    "lootboxName",
    "lootbox",
    "issuer",
    "treasury",
    "targetSharesSold",
    "maxSharesSold",
    "sharePriceUSD",
    "_data",
  ],
};

export = action;
