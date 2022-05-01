import { ABIUtilRepresenation } from "../manifest/types.helpers";

export const InstantLootboxCreated: ABIUtilRepresenation = {
  abi: `
event LootboxCreated(
  string lootboxName,
  address indexed lootbox,
  address indexed issuer,
  address indexed treasury,
  uint256 targetSharesSold,
  uint256 maxSharesSold,
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
    "_data",
  ],
};

export const EscrowLootboxCreated: ABIUtilRepresenation = {
  abi: `
event LootboxCreated(
  string lootboxName,
  address indexed lootbox,
  address indexed issuer,
  address indexed treasury,
  uint256 targetSharesSold,
  uint256 maxSharesSold,
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
    "_data",
  ],
};
