import { Address, BLOCKCHAINS, ChainSlugs } from "./types.helpers";
import { OZChainSlugs } from "./types.helpers";
import {
  CloudRunContainerSlugs,
  OZAutoTaskID,
  OZSentinelID,
  PipedreamActionID,
  PipedreamActionSlugs,
  PipedreamSourceID,
  PipedreamSourceSlugs,
  WidgetSlugs,
  ContractSlugs,
  GlobalMainfest_v0_5_0_prod,
  MultiSigSlugs,
  OZAutoTaskSlugs,
  OZSentinelSlugs,
} from "./types.manifest";

const PIPEDREAM_SEMVER = "0.5.0-prod";
const PIPEDREAM_SEMVER_SLUG = "0-5-0-prod";
const OPEN_ZEPPELIN_SEMVER = "0.5.0-prod";

export const snapshot: GlobalMainfest_v0_5_0_prod = {
  alias: "0.5.0-prod",
  description: `
    Production version of Lootbox. Supporting Polygon & BSC.
  `,
  chains: [
    {
      ...BLOCKCHAINS[ChainSlugs.BSC_MAINNET],
    },
    {
      ...BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET],
    },
  ],
  date: new Date("Sun May 22 2022 12:57:31 GMT-0400 (Eastern Daylight Time)"),
  semver: {
    major: 0,
    minor: 5,
    patch: 0,
    prerelease: ["prod"],
    build: [],
    id: "0.5.0-prod",
  },
  openZeppelin: {
    alias: OPEN_ZEPPELIN_SEMVER,
    multiSigs: {
      [BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex]: {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "____________________" as Address,
          signers: ["____________________" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "____________________" as Address,
          signers: ["____________________" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex]: {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "____________________" as Address,
          signers: ["____________________" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "____________________" as Address,
          signers: ["____________________" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
      },
    },
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "____________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "____________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "____________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "____________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
    },
    secrets: [
      {
        name: "JWT_ON_CREATE_LOOTBOX", // Secret JWT signer
      },
    ],
    autoTasks: {
      onCreateLootboxInstant: {
        id: "____________________" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: OPEN_ZEPPELIN_SEMVER,
        slug: OZAutoTaskSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        id: "____________________" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: OPEN_ZEPPELIN_SEMVER,
        slug: OZAutoTaskSlugs.onCreateLootboxEscrow,
      },
    },
    sentinels: {
      [BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "____________________" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Instant Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER, // NOT USED
          slug: OZSentinelSlugs.onCreateLootboxInstant, // NOT USED
          ozChainSlug: OZChainSlugs.BSC_MAINNET,
          contractWatchAddress: "____________________" as Address,
        },
        onCreateLootboxEscrow: {
          id: "____________________" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Escrow Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.BSC_MAINNET,
          contractWatchAddress: "____________________" as Address,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "____________________" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Instant Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxInstant,
          ozChainSlug: OZChainSlugs.POLYGON_MAINNET,
          contractWatchAddress: "____________________" as Address,
        },
        onCreateLootboxEscrow: {
          id: "____________________" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Escrow Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.POLYGON_MAINNET,
          contractWatchAddress: "____________________" as Address,
        },
      },
    },
    semver: OPEN_ZEPPELIN_SEMVER,
  },
  pipedream: {
    alias: PIPEDREAM_SEMVER,
    email: "0xnewton@lootbox.fund",
    sources: {
      onCreateLootboxInstant: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxInstant`, // Used as PD name
        pipedreamID: "____________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint: "https://____________________.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onCreateLootboxInstant}`, // Used as PD key
      },
      onCreateLootboxEscrow: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxEscrow`, // Used as PD name
        pipedreamID: "____________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint: "https://____________________.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onCreateLootboxEscrow}`, // Used as PD key
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxInstant`, // Used as PD name
        pipedreamID: "____________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onCreateLootboxInstant}`, // Used as PD key
      },
      onCreateLootboxEscrow: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxEscrow`, // Used as PD name
        pipedreamID: "____________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onCreateLootboxEscrow}`, // Used as PD key
      },
    },
    semver: PIPEDREAM_SEMVER,
  },
  cloudRun: {
    alias: "string",
    semver: "0.5.0-prod",
    containers: {
      stampNewLootbox: {
        slug: CloudRunContainerSlugs.stampNewLootbox,
        fullRoute: "https://____________________.a.run.app/stamp/new/lootbox",
      },
      stampNewTicket: {
        slug: CloudRunContainerSlugs.stampNewTicket,
        fullRoute: "https://____________________.a.run.app/stamp/new/ticket",
      },
    },
  },
  googleCloud: {
    alias: "0.5.0-prod",
    projectID: "lootbox-fund-prod",
    semver: "0.5.0-prod",
  },
  storage: {
    downloadUrl: "https://storage.googleapis.com",
    buckets: {
      abi: {
        id: "lootbox-abi-prod",
      },
      stamp: {
        id: "lootbox-stamp-prod",
      },
      data: { id: "lootbox-data-prod" },
      constants: { id: "lootbox-constants-prod" },
      widgets: { id: "lootbox-widgets-prod" },
    },
  },
  secretManager: {
    secrets: [
      {
        name: "OZ_DEFENDER_API_KEY",
        version: 2,
      },
      {
        name: "OZ_DEFENDER_API_SECRET",
        version: 2,
      },
      {
        name: "PD_ABI_UPLOADER_SECRET",
        version: 1,
      },
      {
        name: "JWT_ON_CREATE_LOOTBOX",
        version: 1,
      },
    ],
  },
  microfrontends: {
    alias: "0.5.0-prod",
    semver: "0.5.0-prod",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.5.0-prod",
        slug: WidgetSlugs.fundraiserPage,
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.5.0-prod",
        slug: WidgetSlugs.createLootbox,
      },
      manageLootbox: {
        alias: "manageLootbox",
        semver: "0.5.0-prod",
        slug: WidgetSlugs.manageLootbox,
      },
    },
    webflow: {
      alias: "0.5.0-prod",
      semver: "0.5.0-prod",
      email: "support@lootbox.fund",
      lootboxUrl: "https://www.lootbox.fund/buy",
      createPage: "https://www.lootbox.fund/create",
      managePage: "https://www.lootbox.fund/manage",
      myFundraisersPage: "https://www.lootbox.fund/my-fundraisers",
      myCollectionsPage: "https://www.lootbox.fund/my-collections",
    },
  },
  lootbox: {
    alias: "0.5.0-prod",
    semver: "0.5.0-prod",
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "____________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "____________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "____________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "____________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
    },
  },
  firebase: {
    apiKey: "AIzaSyBWx_NB1ztvNMayG5VWBjYz3xtgPLoXH8c",
    authDomain: "lootbox-fund-prod.firebaseapp.com",
    projectId: "lootbox-fund-prod",
    storageBucket: "lootbox-fund-prod.appspot.com",
    messagingSenderId: "2446790853",
    appId: "1:2446790853:web:a32422e70eed6ffe8ea0ac",
  },
};

export default snapshot;
