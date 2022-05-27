// Much of this file is duplicated from helpers
// Since we cant use private packages, we are resorting to this
// hacky bullshit for now

export type ChainIDHex = string;
export type Url = string;
export type ChainIDDecimal = string;
export type ExternalAddress = string & { readonly _: unique symbol };
export type ContractAddress = string & { readonly _: unique symbol };
export type Address = ExternalAddress | ContractAddress;
export type ABIUtilRepresenation = {
  abi: string;
  keys: string[];
};
export type ABIGenericInterface = any;
export enum OZChainSlugs {
  BSC_TESTNET = "bsctest",
  BSC_MAINNET = "bsc",
  POLYGON_TESTNET = "polygon",
  POLYGON_MAINNET = "mumbai",
}
export type BucketType = "abi" | "data" | "stamp" | "constants" | "widgets";

export type SecretName =
  | "OZ_DEFENDER_API_KEY"
  | "OZ_DEFENDER_API_SECRET"
  | "PD_ABI_UPLOADER_SECRET"
  | "JWT_ON_CREATE_LOOTBOX";

/** Versions for GSM secrets*/
export type SecretVersion = number | string;

/** Secrets in Openzepellin Defender Autotasks */
export type OZSecretName = "JWT_ON_CREATE_LOOTBOX";

export type BucketId = string;

export enum ChainSlugs {
  ETH_MAINNET = "ETH_MAINNET",
  BSC_TESTNET = "BSC_TESTNET",
  BSC_MAINNET = "BSC_MAINNET",
  POLYGON_TESTNET = "POLYGON_TESTNET",
  POLYGON_MAINNET = "POLYGON_MAINNET",
  UNKNOWN = "UNKNOWN",
}

export type ChainInfo = {
  chainIdHex: ChainIDHex;
  chainIdDecimal: ChainIDDecimal;
  chainName: string;
  displayName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: Url[];
  blockExplorerUrls: Url[];
  currentNetworkLogo: string;
  slug: ChainSlugs;
  priceFeedUSD: ContractAddress;
};

export const BLOCKCHAINS: Record<ChainSlugs, ChainInfo> = {
  ETH_MAINNET: {
    chainIdHex: "0x1",
    chainIdDecimal: "1",
    chainName: "Ethereum Mainnet",
    displayName: "ETH Mainnet",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
    blockExplorerUrls: ["https://etherscan.io"],
    currentNetworkLogo:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    slug: ChainSlugs.ETH_MAINNET,
    priceFeedUSD:
      "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as ContractAddress,
  },
  BSC_MAINNET: {
    chainIdHex: "0x38",
    chainIdDecimal: "56",
    chainName: "Binance Smart Chain",
    displayName: "BSC Mainnet",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com/"],
    currentNetworkLogo:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    slug: ChainSlugs.BSC_MAINNET,
    priceFeedUSD:
      "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee" as ContractAddress,
  },
  BSC_TESTNET: {
    slug: ChainSlugs.BSC_TESTNET,
    chainIdHex: "0x61",
    chainIdDecimal: "97",
    chainName: "Binance Smart Chain (Testnet)",
    displayName: "BSC Testnet",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
    currentNetworkLogo:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    priceFeedUSD:
      "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526" as ContractAddress,
  },
  POLYGON_TESTNET: {
    slug: ChainSlugs.POLYGON_TESTNET,
    chainIdHex: "0x13881",
    chainIdDecimal: "80001",
    chainName: "Polygon Mumbai (Testnet)",
    displayName: "Mumbai",
    nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://rpc-mumbai.matic.today"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    currentNetworkLogo:
      "https://firebasestorage.googleapis.com/v0/b/guildfx-exchange.appspot.com/o/assets%2Ftokens%2FMATIC.png?alt=media",
    priceFeedUSD:
      "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada" as ContractAddress,
  },
  POLYGON_MAINNET: {
    slug: ChainSlugs.POLYGON_MAINNET,
    chainIdHex: "0x89",
    chainIdDecimal: "137",
    chainName: "Polygon (Mainnet)",
    displayName: "Polygon Mainnet",
    nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
    currentNetworkLogo:
      "https://firebasestorage.googleapis.com/v0/b/guildfx-exchange.appspot.com/o/assets%2Ftokens%2FMATIC.png?alt=media",
    priceFeedUSD:
      "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0" as ContractAddress,
  },
  UNKNOWN: {
    slug: ChainSlugs.POLYGON_MAINNET,
    chainIdHex: "0x",
    chainIdDecimal: "0",
    chainName: "Unknown Network",
    displayName: "Unknown Network",
    nativeCurrency: { name: "", symbol: "", decimals: 18 },
    rpcUrls: [],
    blockExplorerUrls: [],
    currentNetworkLogo: "",
    priceFeedUSD: "0x0" as ContractAddress,
  },
};

export interface LootboxCustomSchema {
  version: string;
  chain: {
    address: ContractAddress;
    title: string;
    chainIdHex: string;
    chainIdDecimal: string;
    chainName: string;
  };
  lootbox: {
    name: string;
    description: string;
    image: Url;
    backgroundColor: string;
    backgroundImage: Url;
    badgeImage: Url;
    targetPaybackDate: number; // Unix timestamp (new Date().valueOf())
    createdAt: number; // Unix timestamp (new Date().valueOf())
    fundraisingTarget: string;
    fundraisingTargetMax: string;
    basisPointsReturnTarget: string;
    returnAmountTarget: string;
    pricePerShare: string;
    lootboxThemeColor: string;
    transactionHash: string;
    blockNumber: string;
  };
  socials: {
    twitter: string;
    email: string;
    instagram: string;
    tiktok: string;
    facebook: string;
    discord: string;
    youtube: string;
    snapchat: string;
    twitch: string;
    web: string;
  };
}

/**
 * Base level metadata should be opensea compatible (see https://docs.opensea.io/docs/metadata-standards for more details)
 * Custom lootbox metadata is nested in lootboxCustomSchema field
 */
export interface ILootboxMetadata {
  /** points to stamp image - opensea compatible */
  image: string;
  /** points to lootbox page on lootbox.fund - opensea compatible */
  external_url: string;
  /** description of the lootbox - opensea compatible */
  description: string;
  /** name of the lootbox - opensea compatible */
  name: string;
  /** hex color, must be a six-character hexadecimal without a pre-pended # - opensea compatible */
  background_color: string;
  /** A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA */
  animation_url?: string;
  /** A URL to a YouTube video - opensea compatible */
  youtube_url?: string;
  lootboxCustomSchema: LootboxCustomSchema; // Used in lootbox custom code etc
}

interface OpenSeaAttributes {
  trait_type: string | number;
  value: string;
  display_type?: string;
}

export interface ITicketMetadata {
  image: string; // the stamp
  external_url: string;
  description: string;
  name: string;
  background_color: string;
  animation_url: string;
  youtube_url: string;
  attributes?: OpenSeaAttributes[];
  lootboxCustomSchema: {
    version: string;
    chain: {
      /** lootbox address */
      address: string;
      chainIdHex: string;
      chainName: string;
      chainIdDecimal: string;
    };
    lootbox: {
      ticketNumber: number;
      backgroundImage: string;
      image: string;
      backgroundColor: string;
      badgeImage?: string;
      sharesInTicket: string;
    };
  };
}

export interface LootboxDatabaseSchema {
  address: Address;
  factory: Address;

  name: string; // warning this is duped in metadata
  chainIdHex: ChainIDHex; // warning this is duped in metadata
  variant: "escrow" | "instant";

  // Emitted in lootbox created event
  issuer: Address;
  treasury: Address;
  targetSharesSold: string;
  maxSharesSold: string;

  // From Block Trigger Event
  timestamps: {
    lootboxCreatedAt: number;
    lootboxIndexedAt: number;
  };

  // Metadata
  metadataDownloadUrl: string;
  metadata: ILootboxMetadata;
}

export const convertHexToDecimal = (hex: string): string => {
  return parseInt(hex, 16).toString();
};
