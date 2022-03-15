import { defineAction } from "ironpipe";
import { ABIUtilRepresenation } from "@wormgraph/helpers"

const action = defineAction({
  name: "defineEventABIs",
  description:
    "Define the ABI of on-chain events that get emitted by GuildFX smart contracts",
  key: "defineEventABIs",
  version: "0.0.9",
  type: "action",
  props: {},
  async run() {
    return {
      GuildFactory: [GuildCreated],
      CrowdSaleFactory: [CrowdSaleCreated],
      ERC20: [Transfer, Approval],
      LootboxFactory: [LootboxCreated]
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

const CrowdSaleCreated: ABIUtilRepresenation = {
  abi: `
event CrowdSaleCreated(
  address indexed crowdsaleAddress,
  address indexed guildToken,
  address indexed dao,
  address developer, 
  address treasury,
  uint256 startingPrice,
  address deployer
)
`,
  keys: [
    "crowdsaleAddress",
    "guildToken",
    "dao",
    "developer",
    "treasury",
    "startingPrice",
    "deployer",
  ],
};
const GuildCreated: ABIUtilRepresenation = {
  abi: `
event GuildCreated(
  address indexed contractAddress,
  string guildTokenName,
  string guildTokenSymbol,
  address indexed dao,
  address developer,
  address indexed creator,
  address guildFactory
)
`,
  keys: [
    "contractAddress",
    "guildTokenName",
    "guildTokenSymbol",
    "dao",
    "developer",
    "creator",
    "guildFactory",
  ],
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
    "sharePriceUSD"
  ],
};

export = action;
