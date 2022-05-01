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
      ...BLOCKCHAINS[ChainSlugs.BSC_TESTNET],
    },
    {
      ...BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET],
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
          address: "______________________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "______________________________" as Address,
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
        id: "______________________________" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: "0.4.0-demo",
        slug: OZAutoTaskSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        id: "______________________________" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: "0.4.0-demo",
        slug: OZAutoTaskSlugs.onCreateLootboxEscrow,
      },
    },
    sentinels: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "______________________________" as OZSentinelID,
          alias: "Instant Lootbox onCreate",
          semver: "0.4.0-demo",
          slug: OZSentinelSlugs.onCreateLootboxInstant,
          ozChainSlug: OZChainSlugs.BSC_TESTNET,
          contractWatchAddress: "______________________________" as Address,
        },
        onCreateLootboxEscrow: {
          id: "2d61148b-def7-4f78-bffc-70f9eca5e7a5" as OZSentinelID,
          alias: "Escrow Lootbox onCreate",
          semver: "0.4.0-demo",
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.BSC_TESTNET,
          contractWatchAddress: "______________________________" as Address,
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
        pipedreamID: "dc_RWuRA3d" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://d1b2b949e807ad6885c0905f37bedf2c.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        alias: "onCreateLootboxEscrow",
        pipedreamID: "dc_OLu0V3p" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://39cb0fae6d13ef1a1e77e19d3b174341.m.pipedream.net",
        slug: PipedreamSourceSlugs.onCreateLootboxEscrow,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "dc_MDukVpl" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://eee545ce433d88321fd2d3b00554e5f6.m.pipedream.net",
        slug: PipedreamSourceSlugs.onUploadABI,
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: "onCreateLootboxInstant",
        pipedreamID: "sc_5Zia00y" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        alias: "onCreateLootboxEscrow",
        pipedreamID: "sc_6QinxxV" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: PipedreamActionSlugs.onCreateLootboxEscrow,
      },
      onUploadABI: {
        alias: "onUploadABI",
        pipedreamID: "sc_WGiOGGM" as PipedreamActionID,
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
          address: "______________________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "______________________________" as Address,
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
