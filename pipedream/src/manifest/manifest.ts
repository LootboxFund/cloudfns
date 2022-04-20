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
  GlobalMainfest_v0_3_1_demo,
  MultiSigSlugs,
  OZAutoTaskSlugs,
  OZSentinelSlugs,
} from "./types.manifest";

export const snapshot: GlobalMainfest_v0_3_1_demo = {
  alias: "0.3.1-demo",
  description: `
    Demo version of Lootbox.
    This is a demo version of lootbox hosted on BSC testnet.
  `,
  chain: {
    chainIDHex: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
    chainName: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainName,
    priceFeedUSD: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].priceFeedUSD,
  },
  date: new Date("Tue Apr 19 2022 21:36:13 GMT+0700 (Indochina Time)"),
  semver: {
    major: 0,
    minor: 3,
    patch: 1,
    prerelease: ["demo"],
    build: [],
    id: "0.3.1-demo",
  },
  openZeppelin: {
    alias: "0.3.1-demo",
    multiSigs: {
      LootboxDAO: {
        alias: "LootboxDAO",
        address: "0x0a284530Eb51033D363648281BDe68F581188Df1" as Address,
        signers: [
          "0x5cf72D125e8be3eD2311E50cbbbc4d09C746516e" as Address,
          "0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address,
        ],
        chainHexID: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
        threshold: 1,
        slug: MultiSigSlugs.LootboxDAO,
      },
      LootboxDAO_Treasury: {
        alias: "LootboxDAO Treasury",
        address: "0x0a284530Eb51033D363648281BDe68F581188Df1" as Address,
        signers: [
          "0x5cf72D125e8be3eD2311E50cbbbc4d09C746516e" as Address,
          "0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address,
        ],
        chainHexID: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
        threshold: 1,
        slug: MultiSigSlugs.LootboxDAO,
      },
    },
    contracts: {
      LootboxInstantFactory: {
        address: "___________" as Address,
        slug: ContractSlugs.LootboxInstantFactory,
      },
      LootboxEscrowFactory: {
        address: "___________" as Address,
        slug: ContractSlugs.LootboxEscrowFactory,
      },
    },
    secrets: [
      {
        name: "JWT_ON_CREATE_LOOTBOX", // Secret JWT signer
      },
    ],
    autoTasks: {
      onCreateLootboxInstant: {
        id: "___________" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: "0.3.1-demo",
        slug: OZAutoTaskSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        id: "___________" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: "0.3.1-demo",
        slug: OZAutoTaskSlugs.onCreateLootboxEscrow,
      },
    },
    sentinels: {
      onCreateLootboxInstant: {
        id: "___________" as OZSentinelID,
        alias: "Instant Lootbox onCreate",
        semver: "0.3.1-demo",
        slug: OZSentinelSlugs.onCreateLootboxInstant,
        ozChainSlug: OZChainSlugs.BSC_TESTNET,
        contractWatchAddress: "___________" as Address,
      },
      onCreateLootboxEscrow: {
        id: "___________" as OZSentinelID,
        alias: "Escrow Lootbox onCreate",
        semver: "0.3.1-demo",
        slug: OZSentinelSlugs.onCreateLootboxEscrow,
        ozChainSlug: OZChainSlugs.BSC_TESTNET,
        contractWatchAddress: "___________" as Address,
      },
    },
    semver: "0.3.1-demo",
  },
  pipedream: {
    alias: "0.3.1-demo",
    email: "0_3_1_demo@lootbox.fyi",
    sources: {
      onCreateLootboxInstant: {
        alias: "onCreateLootboxInstant",
        pipedreamID: "___________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint: "https://___________.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        alias: "onCreateLootboxEscrow",
        pipedreamID: "___________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint: "https://___________.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateLootboxEscrow,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "dc_a6uZYNk" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://4f2ccd74b95b10539d53a0f28ae5a85f.m.pipedream.net",
        slug: PipedreamSourceSlugs.onUploadABI,
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: "onCreateLootboxInstant",
        pipedreamID: "___________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        alias: "onCreateLootboxEscrow",
        pipedreamID: "___________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateLootboxEscrow,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "___________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onUploadABI,
      },
    },
    semver: "0.3.1-demo",
  },
  cloudRun: {
    alias: "string",
    semver: "0.3.1-demo",
    containers: {
      stampNewLootbox: {
        slug: CloudRunContainerSlugs.stampNewLootbox,
        fullRoute: "https://___________.a.run.app/stamp/new/lootbox",
      },
    },
  },
  googleCloud: {
    alias: "0.3.1-demo",
    projectID: "lootbox-fund-staging",
    semver: "0.3.1-demo",
  },
  storage: {
    downloadUrl: "https://storage.googleapis.com",
    buckets: {
      abi: {
        id: "lootbox-abi-staging",
      },
      stamp: {
        id: "lootbox-stamp-staging",
      },
      assets: { id: "lootbox-assets-staging" },
      data: { id: "lootbox-data-staging" },
      constants: { id: "lootbox-constants-staging" },
      widgets: { id: "lootbox-widgets-staging" },
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
        version: 2,
      },
      {
        name: "JWT_ON_CREATE_LOOTBOX",
        version: 2,
      },
    ],
  },
  microfrontends: {
    alias: "0.3.1-demo",
    semver: "0.3.1-demo",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.3.1-demo",
        slug: WidgetSlugs.fundraiserPage,
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.3.1-demo",
        slug: WidgetSlugs.createLootbox,
      },
      manageLootbox: {
        alias: "manageLootbox",
        semver: "0.3.1-demo",
        slug: WidgetSlugs.manageLootbox,
      },
    },
    webflow: {
      alias: "0.3.1-demo",
      semver: "0.3.1-demo",
      email: "support@guildfx.exchange",
      lootboxUrl: "https://lootbox.fund/buy",
    },
  },
  lootbox: {
    alias: "0.3.1-demo",
    semver: "0.3.1-demo",
    contracts: {
      LootboxInstantFactory: {
        address: "___________" as Address,
        slug: ContractSlugs.LootboxInstantFactory,
      },
      LootboxEscrowFactory: {
        address: "___________" as Address,
        slug: ContractSlugs.LootboxEscrowFactory,
      },
    },
  },
  firebase: {
    apiKey: "AIzaSyB8NCUR9bmlBSSkjW313FWeuStrdzcfXLg",
    authDomain: "lootbox-fund-staging.firebaseapp.com",
    projectId: "lootbox-fund-staging",
    storageBucket: "lootbox-fund-staging.appspot.com",
    messagingSenderId: "874567421974",
    appId: "1:874567421974:web:cad45dbef9102978dca537",
  },
};

export default snapshot;
