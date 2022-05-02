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
  GlobalMainfest_v0_4_0_prod,
  MultiSigSlugs,
  OZAutoTaskSlugs,
  OZSentinelSlugs,
} from "./types.manifest";

const PIPEDREAM_SEMVER = "0.4.0-prod";
const PIPEDREAM_SEMVER_SLUG = "0-4-0-prod";

export const snapshot: GlobalMainfest_v0_4_0_prod = {
  alias: "0.4.0-prod",
  description: `
    Production version of Lootbox.
    This is the first production version of lootbox, supporting BSC and polygon.
  `,
  chains: [
    {
      ...BLOCKCHAINS[ChainSlugs.BSC_MAINNET],
    },
    {
      ...BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET],
    },
  ],
  date: new Date("Sun May 01 2022 11:17:55 GMT-0400 (Eastern Daylight Time)"),
  semver: {
    major: 0,
    minor: 4,
    patch: 0,
    prerelease: ["prod"],
    build: [],
    id: "0.4.0-prod",
  },
  openZeppelin: {
    alias: "0.4.0-prod",
    multiSigs: {
      [BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex]: {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0x0a284530Eb51033D363648281BDe68F581188Df1" as Address,
          signers: [
            "0xE0eC4d917a9E6754801Ed503582399D8cBa91858" as Address,
            "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be" as Address,
          ],
          chainHexID: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex,
          threshold: 2,
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
          threshold: 2,
          slug: MultiSigSlugs.LootboxDAO_Treasury,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex]: {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0x0d928c9baE570f5F526F1785874cA99523bEd4cA" as Address,
          signers: [
            "0xE0eC4d917a9E6754801Ed503582399D8cBa91858" as Address,
            "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be" as Address,
          ],
          chainHexID: BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex,
          threshold: 2,
          slug: MultiSigSlugs.LootboxDAO,
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "0x67Ad5E1b4e7CC0458C3c7bBC8Fa6292b78425aAe" as Address,
          signers: [
            "0xE0eC4d917a9E6754801Ed503582399D8cBa91858" as Address,
            "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be" as Address,
          ],
          chainHexID: BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex,
          threshold: 2,
          slug: MultiSigSlugs.LootboxDAO_Treasury,
        },
      },
    },
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "______________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "______________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "______________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "______________________" as Address,
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
        id: "______________________" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: "0.4.0-prod",
        slug: OZAutoTaskSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        id: "______________________" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: "0.4.0-prod",
        slug: OZAutoTaskSlugs.onCreateLootboxEscrow,
      },
    },
    sentinels: {
      [BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "5______________________" as OZSentinelID,
          alias: "Instant Lootbox onCreate",
          semver: "0.4.0-prod",
          slug: OZSentinelSlugs.onCreateLootboxInstant,
          ozChainSlug: OZChainSlugs.BSC_MAINNET,
          contractWatchAddress: "______________________" as Address,
        },
        onCreateLootboxEscrow: {
          id: "______________________" as OZSentinelID,
          alias: "Escrow Lootbox onCreate",
          semver: "0.4.0-prod",
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.BSC_MAINNET,
          contractWatchAddress: "______________________" as Address,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "______________________" as OZSentinelID,
          alias: "Instant Lootbox onCreate",
          semver: "0.4.0-prod",
          slug: OZSentinelSlugs.onCreateLootboxInstant,
          ozChainSlug: OZChainSlugs.POLYGON_MAINNET,
          contractWatchAddress: "______________________" as Address,
        },
        onCreateLootboxEscrow: {
          id: "______________________" as OZSentinelID,
          alias: "Escrow Lootbox onCreate",
          semver: "0.4.0-prod",
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.POLYGON_MAINNET,
          contractWatchAddress: "______________________" as Address,
        },
      },
    },
    semver: "0.4.0-prod",
  },
  pipedream: {
    alias: PIPEDREAM_SEMVER,
    email: "0_4_0_prod@lootbox.fyi",
    sources: {
      onCreateLootboxInstant: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxInstant`, // Used as PD name
        pipedreamID: "______________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint: "https://______________________.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onCreateLootboxInstant}`, // Used as PD key
      },
      onCreateLootboxEscrow: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxEscrow`, // Used as PD name
        pipedreamID: "______________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint: "https://______________________.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onCreateLootboxEscrow}`, // Used as PD key
      },
      onUploadABI: {
        alias: `[${PIPEDREAM_SEMVER}] onUploadABI`, // Used as PD name
        pipedreamID: "______________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint: "https://______________________.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onUploadABI}`, // Used as PD key
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxInstant`, // Used as PD name
        pipedreamID: "______________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onCreateLootboxInstant}`, // Used as PD key
      },
      onCreateLootboxEscrow: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxEscrow`, // Used as PD name
        pipedreamID: "______________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onCreateLootboxEscrow}`, // Used as PD key
      },
      onUploadABI: {
        alias: `[${PIPEDREAM_SEMVER}] onUploadABI`, // Used as PD name
        pipedreamID: "______________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onUploadABI}`, // Used as PD key
      },
    },
    semver: PIPEDREAM_SEMVER,
  },
  cloudRun: {
    alias: "string",
    semver: "0.4.0-prod",
    containers: {
      stampNewLootbox: {
        slug: CloudRunContainerSlugs.stampNewLootbox,
        fullRoute: "https://______________________.a.run.app/stamp/new/lootbox",
      },
    },
  },
  googleCloud: {
    alias: "0.4.0-prod",
    projectID: "lootbox-fund-prod",
    semver: "0.4.0-prod",
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
    alias: "0.4.0-prod",
    semver: "0.4.0-prod",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.4.0-prod",
        slug: WidgetSlugs.fundraiserPage,
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.4.0-prod",
        slug: WidgetSlugs.createLootbox,
      },
      manageLootbox: {
        alias: "manageLootbox",
        semver: "0.4.0-prod",
        slug: WidgetSlugs.manageLootbox,
      },
    },
    webflow: {
      alias: "0.4.0-prod",
      semver: "0.4.0-prod",
      email: "support@guildfx.exchange",
      lootboxUrl: "https://www.lootbox.fund/buy",
      createPage: "https://www.lootbox.fund/create",
      managePage: "https://www.lootbox.fund/manage",
      myFundraisersPage: "https://www.lootbox.fund/my-fundraisers",
      myCollectionsPage: "https://www.lootbox.fund/my-collections",
    },
  },
  lootbox: {
    alias: "0.4.0-prod",
    semver: "0.4.0-prod",
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "______________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "______________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_MAINNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "______________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "______________________" as Address,
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
    appId: "1:2446790853:web:822e90291c6553a78ea0ac",
  },
};

export default snapshot;
