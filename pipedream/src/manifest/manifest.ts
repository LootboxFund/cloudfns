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
  GlobalMainfest_v0_3_0_prod,
  MultiSigSlugs,
  OZAutoTaskSlugs,
  OZSentinelSlugs,
} from "./types.manifest";

export const snapshot: GlobalMainfest_v0_3_0_prod = {
  alias: "0.3.0-prod",
  description: `
    First production version of Lootbox.
    This is the gensis production version of lootbox hosted on BSC Mainnet.
  `,
  chain: {
    chainIDHex: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex,
    chainName: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainName,
    priceFeedUSD: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].priceFeedUSD,
  },
  date: new Date("Thu Apr 07 2022 22:12:05 GMT-0400 (Eastern Daylight Time)"),
  semver: {
    major: 0,
    minor: 3,
    patch: 0,
    prerelease: ["prod"],
    build: [],
    id: "0.3.0-prod",
  },
  openZeppelin: {
    alias: "0.3.0-prod",
    multiSigs: {
      LootboxDAO: {
        alias: "LootboxDAO",
        address: "0x0a284530Eb51033D363648281BDe68F581188Df1" as Address,
        signers: [
          "0xE0eC4d917a9E6754801Ed503582399D8cBa91858" as Address,
          "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be" as Address,
        ],
        chainHexID: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex,
        threshold: 1,
        slug: MultiSigSlugs.LootboxDAO,
      },
      LootboxDAO_Treasury: {
        alias: "LootboxDAO Treasury",
        address: "0x96779B26982bcB9684fA2ec2Ae53585266733A03" as Address,
        signers: [
          "0xE0eC4d917a9E6754801Ed503582399D8cBa91858" as Address,
          "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be" as Address,
        ],
        chainHexID: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex,
        threshold: 1,
        slug: MultiSigSlugs.LootboxDAO,
      },
    },
    contracts: {
      LootboxInstantFactory: {
        address: "______________________________" as Address,
        slug: ContractSlugs.LootboxInstantFactory,
      },
      LootboxEscrowFactory: {
        address: "______________________________" as Address,
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
        id: "______________________________" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: "0.3.0-prod",
        slug: OZAutoTaskSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        id: "______________________________" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: "0.3.0-prod",
        slug: OZAutoTaskSlugs.onCreateLootboxEscrow,
      },
    },
    sentinels: {
      onCreateLootboxInstant: {
        id: "______________________________" as OZSentinelID,
        alias: "Instant Lootbox onCreate",
        semver: "0.3.0-prod",
        slug: OZSentinelSlugs.onCreateLootboxInstant,
        ozChainSlug: OZChainSlugs.BSC_MAINNET,
        contractWatchAddress: "______________________________" as Address,
      },
      onCreateLootboxEscrow: {
        id: "______________________________" as OZSentinelID,
        alias: "Escrow Lootbox onCreate",
        semver: "0.3.0-prod",
        slug: OZSentinelSlugs.onCreateLootboxEscrow,
        ozChainSlug: OZChainSlugs.BSC_MAINNET,
        contractWatchAddress: "______________________________" as Address,
      },
    },
    semver: "0.3.0-prod",
  },
  pipedream: {
    alias: "0.3.0-prod",
    email: "0_3_0_prod_0xnewton@lootbox.fyi",
    sources: {
      onCreateLootboxInstant: {
        alias: "onCreateLootboxInstant",
        pipedreamID: "______________________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://______________________________.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        alias: "onCreateLootbox",
        pipedreamID: "______________________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://______________________________.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateLootboxEscrow,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "______________________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://______________________________.m.pipedream.net",
        slug: PipedreamSourceSlugs.onUploadABI,
      },
    },
    actions: {
      defineEventABIs: {
        alias: "defineEventABIs",
        pipedreamID: "______________________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.defineEventABIs,
      },
      onCreateLootboxInstant: {
        alias: "onCreateLootboxInstant",
        pipedreamID: "______________________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        alias: "onCreateLootboxEscrow",
        pipedreamID: "______________________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateLootboxEscrow,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "______________________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onUploadABI,
      },
    },
    semver: "0.3.0-prod",
  },
  cloudRun: {
    alias: "string",
    semver: "0.3.0-prod",
    containers: {
      stampNewLootbox: {
        slug: CloudRunContainerSlugs.stampNewLootbox,
        fullRoute: "https://____________.a.run.app/stamp/new/lootbox",
      },
    },
  },
  googleCloud: {
    alias: "0.3.0-prod",
    projectID: "lootbox-fund-prod",
    semver: "0.3.0-prod",
  },
  storage: {
    downloadUrl: "https://storage.googleapis.com/storage/v1/b",
    buckets: {
      abi: {
        id: "lootbox-abi-prod",
      },
      stamp: {
        id: "lootbox-stamp-prod",
      },
      assets: { id: "lootbox-assets-prod" },
      data: { id: "lootbox-data-prod" },
      constants: { id: "lootbox-constants-prod" },
      widgets: { id: "lootbox-widgets-prod" },
    },
  },
  secretManager: {
    secrets: [
      {
        name: "OZ_DEFENDER_API_KEY",
        version: 1,
      },
      {
        name: "OZ_DEFENDER_API_SECRET",
        version: 1,
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
    alias: "0.3.0-prod",
    semver: "0.3.0-prod",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.3.0-prod",
        slug: WidgetSlugs.fundraiserPage,
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.3.0-prod",
        slug: WidgetSlugs.createLootbox,
      },
    },
    webflow: {
      alias: "0.3.0-prod",
      semver: "0.3.0-prod",
      email: "support@guildfx.exchange",
      lootboxUrl: "____________________________________",
    },
  },
  lootbox: {
    alias: "0.3.0-prod",
    semver: "0.3.0-prod",
    contracts: {
      LootboxInstantFactory: {
        address: "____________________________________" as Address,
        slug: ContractSlugs.LootboxInstantFactory,
      },
      LootboxEscrowFactory: {
        address: "____________________________________" as Address,
        slug: ContractSlugs.LootboxEscrowFactory,
      },
    },
  },
  firebase: {
    apiKey: "____________________________________",
    authDomain: "____________________________________",
    projectId: "____________________________________",
    storageBucket: "____________________________________",
    messagingSenderId: "____________________________________",
    appId: "____________________________________",
  },
};

export default snapshot;
