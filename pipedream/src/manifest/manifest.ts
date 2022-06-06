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
  GlobalMainfest_v0_6_0_demo,
  MultiSigSlugs,
  OZAutoTaskSlugs,
  OZSentinelSlugs,
} from "./types.manifest";

const PIPEDREAM_SEMVER = "0.6.0-demo";
const PIPEDREAM_SEMVER_SLUG = "0-6-0-demo";
const OPEN_ZEPPELIN_SEMVER = "0.6.0-demo";

export const snapshot: GlobalMainfest_v0_6_0_demo = {
  alias: "0.6.0-demo",
  description: `
    Demo version of Lootbox with Web2 + Bulk Minting!
  `,
  chains: [
    {
      ...BLOCKCHAINS[ChainSlugs.BSC_TESTNET],
    },
    {
      ...BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET],
    },
  ],
  date: new Date("Sun Jun 05 2022 19:26:21 GMT-0400 (Eastern Daylight Time"),
  semver: {
    major: 0,
    minor: 6,
    patch: 0,
    prerelease: ["demo"],
    build: [],
    id: "0.6.0-demo",
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
          address: "__________________________________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "__________________________________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "__________________________________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "__________________________________________" as Address,
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
        id: "__________________________________________" as OZAutoTaskID,
        alias: "On creation of an Instant Lootbox",
        semver: OPEN_ZEPPELIN_SEMVER,
        slug: OZAutoTaskSlugs.onCreateLootboxInstant,
      },
      onCreateLootboxEscrow: {
        id: "__________________________________________" as OZAutoTaskID,
        alias: "On creation of an Escrow Lootbox",
        semver: OPEN_ZEPPELIN_SEMVER,
        slug: OZAutoTaskSlugs.onCreateLootboxEscrow,
      },
    },
    sentinels: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "_________________________________________" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Instant Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER, // NOT USED
          slug: OZSentinelSlugs.onCreateLootboxInstant, // NOT USED
          ozChainSlug: OZChainSlugs.BSC_TESTNET,
          contractWatchAddress:
            "__________________________________________" as Address,
        },
        onCreateLootboxEscrow: {
          id: "__________________________________________" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Escrow Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.BSC_TESTNET,
          contractWatchAddress:
            "__________________________________________" as Address,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        onCreateLootboxInstant: {
          id: "__________________________________________" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Instant Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxInstant,
          ozChainSlug: OZChainSlugs.POLYGON_TESTNET,
          contractWatchAddress:
            "__________________________________________" as Address,
        },
        onCreateLootboxEscrow: {
          id: "_________________________________________" as OZSentinelID,
          alias: `[${OPEN_ZEPPELIN_SEMVER}] Escrow Lootbox onCreate`,
          semver: OPEN_ZEPPELIN_SEMVER,
          slug: OZSentinelSlugs.onCreateLootboxEscrow,
          ozChainSlug: OZChainSlugs.POLYGON_TESTNET,
          contractWatchAddress:
            "__________________________________________" as Address,
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
        pipedreamID:
          "__________________________________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://__________________________________________.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onCreateLootboxInstant}`, // Used as PD key
      },
      onCreateLootboxEscrow: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxEscrow`, // Used as PD name
        pipedreamID:
          "__________________________________________" as PipedreamSourceID,
        semver: "0.1.0",
        webhookEndpoint:
          "https://__________________________________________.m.pipedream.net",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamSourceSlugs.onCreateLootboxEscrow}`, // Used as PD key
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxInstant`, // Used as PD name
        pipedreamID:
          "__________________________________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onCreateLootboxInstant}`, // Used as PD key
      },
      onCreateLootboxEscrow: {
        alias: `[${PIPEDREAM_SEMVER}] onCreateLootboxEscrow`, // Used as PD name
        pipedreamID:
          "__________________________________________" as PipedreamActionID,
        pipedreamSemver: "0.1.0",
        slug: `${PIPEDREAM_SEMVER_SLUG}-${PipedreamActionSlugs.onCreateLootboxEscrow}`, // Used as PD key
      },
    },
    semver: PIPEDREAM_SEMVER,
  },
  cloudRun: {
    alias: "string",
    semver: "0.6.0-demo",
    containers: {
      stampNewLootbox: {
        slug: CloudRunContainerSlugs.stampNewLootbox,
        fullRoute:
          "https://__________________________________________.a.run.app/stamp/new/lootbox",
      },
      stampNewTicket: {
        slug: CloudRunContainerSlugs.stampNewTicket,
        fullRoute:
          "https://__________________________________________.a.run.app/stamp/new/ticket",
      },
      lootboxServer: {
        slug: CloudRunContainerSlugs.lootboxServer,
        fullRoute: "https://lootbox-server-wpkp2xisuq-ue.a.run.app/graphql",
      },
    },
  },
  googleCloud: {
    alias: "0.6.0-demo",
    projectID: "lootbox-fund-staging",
    semver: "0.6.0-demo",
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
    alias: "0.6.0-demo",
    semver: "0.6.0-demo",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.6.0-demo",
        slug: WidgetSlugs.fundraiserPage,
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.6.0-demo",
        slug: WidgetSlugs.createLootbox,
      },
      manageLootbox: {
        alias: "manageLootbox",
        semver: "0.6.0-demo",
        slug: WidgetSlugs.manageLootbox,
      },
    },
    webflow: {
      alias: "0.6.0-demo",
      semver: "0.6.0-demo",
      email: "support@lootbox.fund",
      lootboxUrl: "https://www.lootbox.fund/demo/0-6-0-demo/buy",
      createPage: "https://www.lootbox.fund/demo/0-6-0-demo/create",
      managePage: "https://www.lootbox.fund/demo/0-6-0-demo/manage",
      loginPage: "https://www.lootbox.fund/demo/0-6-0-demo/login",
      signupPage: "https://www.lootbox.fund/demo/0-6-0-demo/signup",
      myProfilePage: "https://www.lootbox.fund/demo/0-6-0-demo/profile",
      tournamentManagePage:
        "https://www.lootbox.fund/demo/0-6-0-demo/tournament/manage",
      tournamentCreatePage:
        "https://www.lootbox.fund/demo/0-6-0-demo/tournament/create",
      tournamentPublicPage:
        "https://www.lootbox.fund/demo/0-6-0-demo/tournament",
      /** Not in use atm */
      myFundraisersPage:
        "https://www.lootbox.fund/demo/0-6-0-demo/my-fundraisers",
      /** Not in use atm */
      myCollectionsPage:
        "https://www.lootbox.fund/demo/0-6-0-demo/my-collections",
    },
  },
  lootbox: {
    alias: "0.6.0-demo",
    semver: "0.6.0-demo",
    contracts: {
      [BLOCKCHAINS[ChainSlugs.BSC_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "__________________________________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "__________________________________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
          bulkMinterSuperStaff:
            "0x8C402c09d3622dceeb123b086Bd5227189931BEE" as Address,
        },
      },
      [BLOCKCHAINS[ChainSlugs.POLYGON_TESTNET].chainIdHex]: {
        LootboxInstantFactory: {
          address: "__________________________________________" as Address,
          slug: ContractSlugs.LootboxInstantFactory,
        },
        LootboxEscrowFactory: {
          address: "__________________________________________" as Address,
          slug: ContractSlugs.LootboxEscrowFactory,
          bulkMinterSuperStaff:
            "0x8C402c09d3622dceeb123b086Bd5227189931BEE" as Address,
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
