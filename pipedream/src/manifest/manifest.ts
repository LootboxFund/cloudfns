import { Address, BLOCKCHAINS, ChainSlugs } from "../types";
import { OZChainSlugs } from "../types";
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
  GlobalMainfest_v0_2_8_sandbox,
  MultiSigSlugs,
  OZAutoTaskSlugs,
  OZSentinelSlugs,
} from "./types";

export const snapshot: GlobalMainfest_v0_2_8_sandbox = {
  alias: "0.2.8-sandbox",
  description: `
    Demo version of Lootbox.
    This is the second version deployed as "V2" for sandbox purposes.
    Hosted on BSC Testnet.
  `,
  chain: {
    chainIDHex: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
    chainName: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainName,
    priceFeedUSD: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].priceFeedUSD,
  },
  date: new Date("Sat Apr 02 2022 20:02:19 GMT-0700 (Pacific Daylight Time)"),
  semver: {
    major: 0,
    minor: 2,
    patch: 8,
    prerelease: ["sandbox"],
    build: [],
    id: "0.2.8-sandbox",
  },
  openZeppelin: {
    alias: "0.2.8-sandbox",
    multiSigs: {
      LootboxDAO: {
        alias: "LootboxDAO",
        address: "0x0C32E0Bf4cfD9331284AF325022D81026DC13e17" as Address,
        signers: [
          "0x374bF0Eead419389041b4b7912ac653708d291e0" as Address,
          "0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address,
        ],
        chainHexID: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
        threshold: 1,
        slug: MultiSigSlugs.LootboxDAO,
      },
      LootboxDAO_Treasury: {
        alias: "LootboxDAO Treasury",
        address: "0x82eFBb5A2039dE590828779FD6c3480C0b20FF56" as Address,
        signers: [
          "0x374bF0Eead419389041b4b7912ac653708d291e0" as Address,
          "0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address,
        ],
        chainHexID: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
        threshold: 1,
        slug: MultiSigSlugs.LootboxDAO,
      },
    },
    contracts: {
      LootboxInstantFactory: {
        address: "0x592259e57ADdeEec97Cf1d8A286b977461522345" as Address,
        slug: ContractSlugs.LootboxInstantFactory,
      },
      LootboxEscrowFactory: {
        address: "0x39CA3ff30Ff69e33C00f7823F0aDc0C1417E5E80" as Address,
        slug: ContractSlugs.LootboxEscrowFactory,
      },
    },
    secrets: [
      {
        name: "JWT_ON_CREATE_LOOTBOX", // Secret JWT signer
      },
    ],
    autoTasks: {
      onCreateInstantLootbox: {
        id: "______________________________" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: "0.3.0-prod",
        slug: OZAutoTaskSlugs.onCreateInstantLootbox,
      },
      onCreateEscrowLootbox: {
        id: "______________________________" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: "0.3.0-prod",
        slug: OZAutoTaskSlugs.onCreateEscrowLootbox,
      },
    },
    sentinels: {
      onCreateLootboxInstant: {
        id: "____" as OZSentinelID,
        alias: "Instant Lootbox onCreate",
        semver: "0.2.8-sandbox",
        slug: OZSentinelSlugs.onCreateLootboxInstant,
        ozChainSlug: OZChainSlugs.BSC_TESTNET,
        contractWatchAddress:
          "0xbc7280E8dba198B76a8aFc50C36542d96f2FEb59" as Address,
      },
      onCreateLootboxEscrow: {
        id: "___" as OZSentinelID,
        alias: "Escrow Lootbox onCreate",
        semver: "0.2.8-sandbox",
        slug: OZSentinelSlugs.onCreateLootboxEscrow,
        ozChainSlug: OZChainSlugs.BSC_TESTNET,
        contractWatchAddress:
          "0x5AdA44C7C78f0bD017B77F0829e2a9CB62572123" as Address,
      },
    },
    semver: "0.2.8-sandbox",
  },
  pipedream: {
    alias: "0.2.8-sandbox",
    email: "0_2_8_sandbox_0xnewton@lootbox.fyi",
    sources: {
      onCreateInstantLootbox: {
        alias: "onCreateInstantLootbox",
        pipedreamID: "______________________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://______________________________.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateInstantLootbox,
      },
      onCreateEscrowLootbox: {
        alias: "onCreateLootbox",
        pipedreamID: "______________________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://______________________________.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateEscrowLootbox,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "dc_DvuQJzP" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://94fafde54fa78b9ed1cbb0970c54e36a.m.pipedream.net",
        slug: PipedreamSourceSlugs.onUploadABI,
      },
    },
    actions: {
      defineEventABIs: {
        alias: "defineEventABIs",
        pipedreamID: "sc_4EigKBz" as PipedreamActionID,
        pipedreamSemver: "0.1.2",
        slug: PipedreamActionSlugs.defineEventABIs,
      },
      onCreateInstantLootbox: {
        alias: "onCreateInstantLootbox",
        pipedreamID: "sc_bniklRJ" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateInstantLootbox,
      },
      onCreateEscrowLootbox: {
        alias: "onCreateEscrowLootbox",
        pipedreamID: "sc_bniklRJ" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateEscrowLootbox,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "sc_eqiDZ33" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onUploadABI,
      },
    },
    semver: "0.2.8-sandbox",
  },
  cloudRun: {
    alias: "string",
    semver: "0.2.8-sandbox",
    containers: {
      stampNewLootbox: {
        slug: CloudRunContainerSlugs.stampNewLootbox,
        fullRoute:
          "https://stamp-nft-wpkp2xisuq-ue.a.run.app/stamp/new/lootbox",
      },
    },
  },
  googleCloud: {
    alias: "0.2.8-sandbox",
    projectID: "lootbox-fund-staging",
    semver: "0.2.8-sandbox",
  },
  storage: {
    downloadUrl: "https://storage.googleapis.com/storage/v1/b",
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
    alias: "0.2.8-sandbox",
    semver: "0.2.8-sandbox",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.2.8-sandbox",
        slug: WidgetSlugs.fundraiserPage,
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.2.8-sandbox",
        slug: WidgetSlugs.createLootbox,
      },
    },
    webflow: {
      alias: "0.2.8-sandbox",
      semver: "0.2.8-sandbox",
      email: "support@guildfx.exchange",
      lootboxUrl: "____________________________________",
    },
  },
  lootbox: {
    alias: "0.2.8-sandbox",
    semver: "0.2.8-sandbox",
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
};

export default snapshot;
