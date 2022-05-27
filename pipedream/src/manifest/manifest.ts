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
  GlobalMainfest_v0_5_1_demo,
  MultiSigSlugs,
  OZAutoTaskSlugs,
  OZSentinelSlugs,
} from "./types.manifest";

const PIPEDREAM_SEMVER = "0.5.0-prod";
const PIPEDREAM_SEMVER_SLUG = "0-5-0-prod";
const OPEN_ZEPPELIN_SEMVER = "0.5.0-prod";

export const snapshot: GlobalMainfest_v0_5_1_demo = {
  alias: "0.5.1-demo",
  description: `
    Demo version of Lootbox.
  `,
  chains: [
    {
      ...BLOCKCHAINS[ChainSlugs.BSC_TESTNET],
    },
    {
      ...BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET],
    },
  ],
  date: new Date("Fri May 27 2022 00:43:07 GMT-0400 (Eastern Daylight Time)"),
  semver: {
    major: 0,
    minor: 5,
    patch: 1,
    prerelease: ["demo"],
    build: [],
    id: "0.5.1-demo",
  },
  openZeppelin: {
    alias: OPEN_ZEPPELIN_SEMVER,
    multiSigs: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0xb9a608a29979421461838047BDe9166Cd7ea647f" as Address,
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "0x228586A4564B999a7CB673581d7055EcbB9287F3" as Address,
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0xae069b7d5dfe85CCf056170af7a65F6374588776" as Address,
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "0xC2e94223edf8470f32fa318D53564ABe283960B2" as Address,
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288" as Address],
          chainHexID: BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex,
          threshold: 1,
          slug: MultiSigSlugs.LootboxDAO,
        },
      },
    },
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "0x14a507AB92590B1Bc59a7C78B478A67c42ca2907" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "0xD2EF0986722EcFED99d236Cb20B7D5d0C7950551" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "0xba0bF6C93AdED14c19Fe13F39e2b67A6070121F2" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "0x309CC071d4f99a301CeBed7F3F5995f406aA4d9a" as Address,
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
        id: "3648e27f-35c2-44dc-a1d3-321507c28e5e" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: OPEN_ZEPPELIN_SEMVER,
        slug: OZAutoTaskSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        id: "f628cb51-9560-4030-8697-2cdadd8889a5" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: OPEN_ZEPPELIN_SEMVER,
        slug: OZAutoTaskSlugs.onCreateLootboxEscrow,
      },
    },
    sentinels: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "f00e3ce7-8b18-47a2-b1a7-334a751a8877" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Instant Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER, // NOT USED
          slug: OZSentinelSlugs.onCreateLootboxInstant, // NOT USED
          ozChainSlug: OZChainSlugs.BSC_TESTNET,
          contractWatchAddress:
            "0x14a507AB92590B1Bc59a7C78B478A67c42ca2907" as Address,
        },
        onCreateLootboxEscrow: {
          id: "0920daa4-5599-4cde-a8a7-0232921337d2" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Escrow Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.BSC_TESTNET,
          contractWatchAddress:
            "0xD2EF0986722EcFED99d236Cb20B7D5d0C7950551" as Address,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "dca3b4ab-6594-49fe-b1fe-f159f1012d83" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Instant Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxInstant,
          ozChainSlug: OZChainSlugs.POLYGON_TESTNET,
          contractWatchAddress:
            "0xba0bF6C93AdED14c19Fe13F39e2b67A6070121F2" as Address,
        },
        onCreateLootboxEscrow: {
          id: "332b23f7-f738-4dd7-9364-431661d09c8c" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Escrow Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.POLYGON_TESTNET,
          contractWatchAddress:
            "0x309CC071d4f99a301CeBed7F3F5995f406aA4d9a" as Address,
        },
      },
    },
    semver: OPEN_ZEPPELIN_SEMVER,
  },
  pipedream: {
    alias: PIPEDREAM_SEMVER,
    email: "0_4_0_demo_newton@lootbox.fund",
    sources: {
      onCreateLootboxInstant: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxInstant`, // Used as PD name
        pipedreamID: "dc_0duDpNB" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://d341b8d298a90b4dfda88804c2448cc5.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onCreateLootboxInstant}`, // Used as PD key
      },
      onCreateLootboxEscrow: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxEscrow`, // Used as PD name
        pipedreamID: "dc_4OuZaDA" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://c99497ac67bd2ab303a71a0059cccd8f.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onCreateLootboxEscrow}`, // Used as PD key
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxInstant`, // Used as PD name
        pipedreamID: "sc_v4iqVbE" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onCreateLootboxInstant}`, // Used as PD key
      },
      onCreateLootboxEscrow: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxEscrow`, // Used as PD name
        pipedreamID: "sc_EgiEd2Q" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onCreateLootboxEscrow}`, // Used as PD key
      },
    },
    semver: PIPEDREAM_SEMVER,
  },
  cloudRun: {
    alias: "string",
    semver: "0.5.0-demo",
    containers: {
      stampNewLootbox: {
        slug: CloudRunContainerSlugs.stampNewLootbox,
        fullRoute:
          "https://stamp-nft-0-5-0-demo-wpkp2xisuq-ue.a.run.app/stamp/new/lootbox",
      },
      stampNewTicket: {
        slug: CloudRunContainerSlugs.stampNewTicket,
        fullRoute:
          "https://stamp-nft-0-5-0-demo-wpkp2xisuq-ue.a.run.app/stamp/new/ticket",
      },
    },
  },
  googleCloud: {
    alias: "0.5.1-demo",
    projectID: "lootbox-fund-staging",
    semver: "0.5.1-demo",
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
      data: { id: "lootbox-data-staging" },
      constants: { id: "lootbox-constants-staging" },
      widgets: { id: "lootbox-widgets-staging" },
    },
  },
  secretManager: {
    secrets: [
      {
        name: "OZ_DEFENDER_API_KEY",
        version: 3,
      },
      {
        name: "OZ_DEFENDER_API_SECRET",
        version: 3,
      },
      {
        name: "PD_ABI_UPLOADER_SECRET",
        version: 3,
      },
      {
        name: "JWT_ON_CREATE_LOOTBOX",
        version: 3,
      },
    ],
  },
  microfrontends: {
    alias: "0.5.1-demo",
    semver: "0.5.1-demo",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.5.1-demo",
        slug: WidgetSlugs.fundraiserPage,
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.5.1-demo",
        slug: WidgetSlugs.createLootbox,
      },
      manageLootbox: {
        alias: "manageLootbox",
        semver: "0.5.1-demo",
        slug: WidgetSlugs.manageLootbox,
      },
    },
    webflow: {
      alias: "0.5.1-demo",
      semver: "0.5.1-demo",
      email: "support@lootbox.fund",
      lootboxUrl: "https://www.lootbox.fund/demo/0-5-1-demo/buy",
      createPage: "https://www.lootbox.fund/demo/0-5-1-demo/create",
      managePage: "https://www.lootbox.fund/demo/0-5-1-demo/manage",
      myFundraisersPage:
        "https://www.lootbox.fund/demo/0-5-1-demo/my-fundraisers",
      myCollectionsPage:
        "https://www.lootbox.fund/demo/0-5-1-demo/my-collections",
    },
  },
  lootbox: {
    alias: "0.5.0-demo",
    semver: "0.5.0-demo",
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "0x14a507AB92590B1Bc59a7C78B478A67c42ca2907" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "0xD2EF0986722EcFED99d236Cb20B7D5d0C7950551" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "0xba0bF6C93AdED14c19Fe13F39e2b67A6070121F2" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "0x309CC071d4f99a301CeBed7F3F5995f406aA4d9a" as Address,
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
