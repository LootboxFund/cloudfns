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
  GlobalMainfest_v0_4_0_demo,
  MultiSigSlugs,
  OZAutoTaskSlugs,
  OZSentinelSlugs,
} from "./types.manifest";

export const snapshot: GlobalMainfest_v0_4_0_demo = {
  alias: "0.4.0-demo",
  description: `
    Demo version of Lootbox.
    This is a demo version of lootbox hosted on BSC testnet.
  `,
  chains: [
    {
      chainIDHex: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
      chainName: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainName,
      priceFeedUSD: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].priceFeedUSD,
    },
    {
      chainIDHex: BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex,
      chainName: BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainName,
      priceFeedUSD: BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].priceFeedUSD,
    },
  ],
  date: new Date("Tue Apr 26 2022 07:25:51 GMT-0400 (Eastern Daylight Time)"),
  semver: {
    major: 0,
    minor: 3,
    patch: 1,
    prerelease: ["demo"],
    build: [],
    id: "0.4.0-demo",
  },
  openZeppelin: {
    alias: "0.4.0-demo",
    multiSigs: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
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
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0xA471dfd91666EA3EC4a0975f6c30AA1C79c6791D" as Address,
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "0x6897CD98857dBf3E3d54aaB250a85B5aBBAE7b9D" as Address,
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.BSC_MAINNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
      },
    },
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "0x968914263FFd5A6F364fE2Cf677E34dFeeCC4CA0" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "0x9B47B9F816eb15139240087e2Ddd833fE0974F47" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
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
    secrets: [
      {
        name: "JWT_ON_CREATE_LOOTBOX", // Secret JWT signer
      },
    ],
    autoTasks: {
      onCreateLootboxInstant: {
        id: "e840296b-e734-40ee-bc6f-38b936691d0e" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: "0.4.0-demo",
        slug: OZAutoTaskSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        id: "bd91c2ce-efb7-4ccc-9cee-bf695e324e8c" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: "0.4.0-demo",
        slug: OZAutoTaskSlugs.onCreateLootboxEscrow,
      },
    },
    sentinels: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "a3953775-e841-4d5c-ab13-62683e9744b4" as OZSentinelID,
          alias: "Instant Lootbox onCreate",
          semver: "0.4.0-demo",
          slug: OZSentinelSlugs.onCreateLootboxInstant,
          ozChainSlug: OZChainSlugs.BSC_TESTNET,
          contractWatchAddress:
            "0x968914263FFd5A6F364fE2Cf677E34dFeeCC4CA0" as Address,
        },
        onCreateLootboxEscrow: {
          id: "2d61148b-def7-4f78-bffc-70f9eca5e7a5" as OZSentinelID,
          alias: "Escrow Lootbox onCreate",
          semver: "0.4.0-demo",
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.BSC_TESTNET,
          contractWatchAddress:
            "0x9B47B9F816eb15139240087e2Ddd833fE0974F47" as Address,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "______________________________" as OZSentinelID,
          alias: "Instant Lootbox onCreate",
          semver: "0.4.0-demo",
          slug: OZSentinelSlugs.onCreateLootboxInstant,
          ozChainSlug: OZChainSlugs.POLYGON_TESTNET,
          contractWatchAddress: "______________________________" as Address,
        },
        onCreateLootboxEscrow: {
          id: "______________________________" as OZSentinelID,
          alias: "Escrow Lootbox onCreate",
          semver: "0.4.0-demo",
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.POLYGON_TESTNET,
          contractWatchAddress: "______________________________" as Address,
        },
      },
    },
    semver: "0.4.0-demo",
  },
  pipedream: {
    alias: "0.4.0-demo",
    email: "0_4_0_demo@lootbox.fyi",
    sources: {
      onCreateLootboxInstant: {
        alias: "onCreateLootboxInstant",
        pipedreamID: "dc_K0uDAE4" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://6ea20d8a104d2e57d237f580c8d9ceed.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        alias: "onCreateLootboxEscrow",
        pipedreamID: "dc_Nquy3Ya" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://93381ebecb73be2451eb54f095b12bc0.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateLootboxEscrow,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "dc_jkuvQR4" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://4820d2adc40d83cd74b83de58eb6ef09.m.pipedream.net",
        slug: PipedreamSourceSlugs.onUploadABI,
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: "onCreateLootboxInstant",
        pipedreamID: "sc_pMijzVV" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        alias: "onCreateLootboxEscrow",
        pipedreamID: "sc_B5iQEWw" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateLootboxEscrow,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "sc_B5iQE8Y" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onUploadABI,
      },
    },
    semver: "0.4.0-demo",
  },
  cloudRun: {
    alias: "string",
    semver: "0.4.0-demo",
    containers: {
      stampNewLootbox: {
        slug: CloudRunContainerSlugs.stampNewLootbox,
        fullRoute:
          "https://stamp-nft-wpkp2xisuq-ue.a.run.app/stamp/new/lootbox",
      },
    },
  },
  googleCloud: {
    alias: "0.4.0-demo",
    projectID: "lootbox-fund-staging",
    semver: "0.4.0-demo",
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
    alias: "0.4.0-demo",
    semver: "0.4.0-demo",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.4.0-demo",
        slug: WidgetSlugs.fundraiserPage,
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.4.0-demo",
        slug: WidgetSlugs.createLootbox,
      },
      manageLootbox: {
        alias: "manageLootbox",
        semver: "0.4.0-demo",
        slug: WidgetSlugs.manageLootbox,
      },
    },
    webflow: {
      alias: "0.4.0-demo",
      semver: "0.4.0-demo",
      email: "support@guildfx.exchange",
      lootboxUrl: "https://www.lootbox.fund/demo/0-4-0-demo/buy",
    },
  },
  lootbox: {
    alias: "0.4.0-demo",
    semver: "0.4.0-demo",
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "0x968914263FFd5A6F364fE2Cf677E34dFeeCC4CA0" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "0x9B47B9F816eb15139240087e2Ddd833fE0974F47" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
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
