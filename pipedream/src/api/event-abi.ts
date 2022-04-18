import { ABIUtilRepresenation } from "../manifest/types.helpers";

export const InstantLootboxCreated: ABIUtilRepresenation = {
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

export const InstantEscrowCreated: ABIUtilRepresenation = {
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
