import { defineAction } from "ironpipe";
import { ABIUtilRepresenation } from "../../types";

export default defineAction({
  name: "Define on-chain Event ABIs",
  description:
    "Define the ABI of on-chain events that get emitted by GuildFX smart contracts",
  key: "defineEventABIs",
  version: "0.0.3",
  type: "action",
  props: {},
  async run() {
    return {
      GuildFactory: [GuildCreated],
      CrowdSaleFactory: [CrowdSaleCreated],
      ERC20: [Transfer, Approval],
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
