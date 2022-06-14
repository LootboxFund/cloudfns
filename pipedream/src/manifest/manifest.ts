/**
 * Please copy the content of './manifest.json' here
 * (I'm not sure how to use the JSON file with Pipedream)
 */

export default {
  alias: "0.6.1-demo",
  description: "\n    Demo version of Lootbox with Web2 + Bulk Minting!\n  ",
  chains: [
    {
      slug: "BSC_TESTNET",
      chainIdHex: "0x61",
      chainIdDecimal: "97",
      chainName: "Binance Smart Chain (Testnet)",
      displayName: "BSC Testnet",
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
      blockExplorerUrls: ["https://testnet.bscscan.com/"],
      currentNetworkLogo:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      priceFeedUSD: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    },
    {
      slug: "POLYGON_TESTNET",
      chainIdHex: "0x13881",
      chainIdDecimal: "80001",
      chainName: "Polygon Mumbai (Testnet)",
      displayName: "Mumbai",
      nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
      rpcUrls: ["https://rpc-mumbai.matic.today"],
      blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
      currentNetworkLogo:
        "https://firebasestorage.googleapis.com/v0/b/guildfx-exchange.appspot.com/o/assets%2Ftokens%2FMATIC_COLORED.png?alt=media",
      priceFeedUSD: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
    },
  ],
  date: "2022-06-13T21:44:11.000Z",
  semver: {
    major: 0,
    minor: 6,
    patch: 0,
    prerelease: ["demo"],
    build: [],
    id: "0.6.1-demo",
  },
  openZeppelin: {
    alias: "0.6.1-demo",
    multiSigs: {
      "0x61": {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0xb9a608a29979421461838047BDe9166Cd7ea647f",
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288"],
          chainHexID: "0x61",
          threshold: 1,
          slug: "LootboxDAO",
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "0x228586A4564B999a7CB673581d7055EcbB9287F3",
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288"],
          chainHexID: "0x61",
          threshold: 1,
          slug: "LootboxDAO",
        },
      },
      "0x13881": {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0xae069b7d5dfe85CCf056170af7a65F6374588776",
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288"],
          chainHexID: "0x13881",
          threshold: 1,
          slug: "LootboxDAO",
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "0xC2e94223edf8470f32fa318D53564ABe283960B2",
          signers: ["0x2C83b49EdB3f00A38331028e2D8bFA3Cd93B8288"],
          chainHexID: "0x13881",
          threshold: 1,
          slug: "LootboxDAO",
        },
      },
    },
    contracts: {
      "0x61": {
        LootboxInstantFactory: {
          address: "0x439369964f854c10C120d5df6375Ab5CF8d0Eb8c",
          slug: "LootboxInstantFactory",
        },
        LootboxEscrowFactory: {
          address: "0xCB16ebA6DfF25D8F4DfE720a81E0534AF54Ff0Ca",
          slug: "LootboxEscrowFactory",
        },
      },
      "0x13881": {
        LootboxInstantFactory: {
          address: "0x9D66d9B2Ef0e32FcF382776D35Eb8f1be6389644",
          slug: "LootboxInstantFactory",
        },
        LootboxEscrowFactory: {
          address: "0x2f0EA0b9c0b42F4e6a1755177880005B223F4F51",
          slug: "LootboxEscrowFactory",
        },
      },
    },
    secrets: [{ name: "JWT_ON_CREATE_LOOTBOX" }],
    autoTasks: {
      onCreateLootboxInstant: {
        id: "c0b37dd5-42f6-4a3c-aafa-394cb653ef5d",
        alias: "On creation of an Instant Lootbox",
        semver: "0.6.1-demo",
        slug: "onCreateLootboxInstant",
      },
      onCreateLootboxEscrow: {
        id: "fbc26d76-e071-45bd-9380-12a4423ba9ed",
        alias: "On creation of an Escrow Lootbox",
        semver: "0.6.1-demo",
        slug: "onCreateLootboxEscrow",
      },
    },
    sentinels: {
      "0x61": {
        onCreateLootboxInstant: {
          id: "________________________________________",
          alias: "[0.6.1-demo] Instant Lootbox onCreate",
          semver: "0.6.1-demo",
          slug: "onCreateLootboxInstant",
          ozChainSlug: "bsctest",
          contractWatchAddress: "0x439369964f854c10C120d5df6375Ab5CF8d0Eb8c",
        },
        onCreateLootboxEscrow: {
          id: "________________________________________",
          alias: "[0.6.1-demo] Escrow Lootbox onCreate",
          semver: "0.6.1-demo",
          slug: "onCreateLootboxEscrow",
          ozChainSlug: "bsctest",
          contractWatchAddress: "0xCB16ebA6DfF25D8F4DfE720a81E0534AF54Ff0Ca",
        },
      },
      "0x13881": {
        onCreateLootboxInstant: {
          id: "________________________________________",
          alias: "[0.6.1-demo] Instant Lootbox onCreate",
          semver: "0.6.1-demo",
          slug: "onCreateLootboxInstant",
          ozChainSlug: "mumbai",
          contractWatchAddress: "0x9D66d9B2Ef0e32FcF382776D35Eb8f1be6389644",
        },
        onCreateLootboxEscrow: {
          id: "________________________________________",
          alias: "[0.6.1-demo] Escrow Lootbox onCreate",
          semver: "0.6.1-demo",
          slug: "onCreateLootboxEscrow",
          ozChainSlug: "mumbai",
          contractWatchAddress: "0x2f0EA0b9c0b42F4e6a1755177880005B223F4F51",
        },
      },
    },
    semver: "0.6.1-demo",
  },
  pipedream: {
    alias: "0.6.1-demo",
    email: "0_4_0_demo_newton@lootbox.fund",
    sources: {
      onCreateLootboxInstant: {
        alias: "[0.6.1-demo] onCreateLootboxInstant",
        pipedreamID: "dc_wDujEbb",
        semver: "0.1.0",
        webhookEndpoint:
          "https://411f24e564fd04d477334480b9e018ef.m.pipedream.net",
        slug: "0-6-1-demo-onCreateLootboxInstant",
      },
      onCreateLootboxEscrow: {
        alias: "[0.6.1-demo] onCreateLootboxEscrow",
        pipedreamID: "dc_QyueG6p",
        semver: "0.1.0",
        webhookEndpoint:
          "https://1bc8da955f5bf9015e240e5caffcdfb5.m.pipedream.net",
        slug: "0-6-1-demo-onCreateLootboxEscrow",
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: "[0.6.1-demo] onCreateLootboxInstant",
        pipedreamID: "sc_2AiQ4Dp",
        pipedreamSemver: "0.1.0",
        slug: "0-6-1-demo-onCreateLootboxInstant",
      },
      onCreateLootboxEscrow: {
        alias: "[0.6.1-demo] onCreateLootboxEscrow",
        pipedreamID: "sc_YNioEJ0",
        pipedreamSemver: "0.1.0",
        slug: "0-6-1-demo-onCreateLootboxEscrow",
      },
    },
    semver: "0.6.1-demo",
  },
  cloudRun: {
    alias: "string",
    semver: "0.6.1-demo",
    containers: {
      stampNewLootbox: {
        slug: "stampNewLootbox",
        fullRoute:
          "https://stamp-nft-0-6-1-demo-wpkp2xisuq-ue.a.run.app/stamp/new/lootbox",
      },
      stampNewTicket: {
        slug: "stampNewTicket",
        fullRoute:
          "https://stamp-nft-0-6-1-demo-wpkp2xisuq-ue.a.run.app/stamp/new/ticket",
      },
      lootboxServer: {
        slug: "lootboxServer",
        fullRoute: "https://lootbox-server-wpkp2xisuq-ue.a.run.app/graphql",
      },
    },
  },
  googleCloud: {
    alias: "0.6.1-demo",
    projectID: "lootbox-fund-staging",
    semver: "0.6.1-demo",
  },
  storage: {
    downloadUrl: "https://storage.googleapis.com",
    buckets: {
      abi: { id: "lootbox-abi-staging" },
      stamp: { id: "lootbox-stamp-staging" },
      data: { id: "lootbox-data-staging" },
      constants: { id: "lootbox-constants-staging" },
      widgets: { id: "lootbox-widgets-staging" },
    },
  },
  secretManager: {
    secrets: [
      { name: "OZ_DEFENDER_API_KEY", version: 3 },
      { name: "OZ_DEFENDER_API_SECRET", version: 3 },
      { name: "PD_ABI_UPLOADER_SECRET", version: 3 },
      { name: "JWT_ON_CREATE_LOOTBOX", version: 3 },
      { name: "STAMP_SECRET", version: 1 },
    ],
  },
  microfrontends: {
    alias: "0.6.1-demo",
    semver: "0.6.1-demo",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.6.1-demo",
        slug: "fundraiserPage",
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.6.1-demo",
        slug: "createLootbox",
      },
      manageLootbox: {
        alias: "manageLootbox",
        semver: "0.6.1-demo",
        slug: "manageLootbox",
      },
    },
    webflow: {
      alias: "0.6.0-demo",
      semver: "0.6.0-demo",
      email: "support@lootbox.fund",
      lootboxUrl: "https://www.lootbox.fund/demo/0-6-1-demo/buy",
      createPage: "https://www.lootbox.fund/demo/0-6-1-demo/create",
      managePage: "https://www.lootbox.fund/demo/0-6-1-demo/manage",
      authPage: "https://www.lootbox.fund/demo/0-6-1-demo/auth",
      myProfilePage: "https://www.lootbox.fund/demo/0-6-1-demo/profile",
      tournamentManagePage:
        "https://www.lootbox.fund/demo/0-6-1-demo/tournament/manage",
      tournamentCreatePage:
        "https://www.lootbox.fund/demo/0-6-1-demo/tournament/create",
      tournamentPublicPage:
        "https://www.lootbox.fund/demo/0-6-1-demo/tournament",
      myFundraisersPage:
        "https://www.lootbox.fund/demo/0-6-1-demo/my-fundraisers",
      myCollectionsPage:
        "https://www.lootbox.fund/demo/0-6-1-demo/my-collections",
    },
  },
  lootbox: {
    alias: "0.6.1-demo",
    semver: "0.6.1-demo",
    contracts: {
      "0x61": {
        LootboxInstantFactory: {
          address: "0x439369964f854c10C120d5df6375Ab5CF8d0Eb8c",
          slug: "LootboxInstantFactory",
          bulkMinterSuperStaff: "0x8C402c09d3622dceeb123b086Bd5227189931BEE",
        },
        LootboxEscrowFactory: {
          address: "0xCB16ebA6DfF25D8F4DfE720a81E0534AF54Ff0Ca",
          slug: "LootboxEscrowFactory",
          bulkMinterSuperStaff: "0x8C402c09d3622dceeb123b086Bd5227189931BEE",
        },
      },
      "0x13881": {
        LootboxInstantFactory: {
          address: "0x9D66d9B2Ef0e32FcF382776D35Eb8f1be6389644",
          slug: "LootboxInstantFactory",
          bulkMinterSuperStaff: "0x8C402c09d3622dceeb123b086Bd5227189931BEE",
        },
        LootboxEscrowFactory: {
          address: "0x2f0EA0b9c0b42F4e6a1755177880005B223F4F51",
          slug: "LootboxEscrowFactory",
          bulkMinterSuperStaff: "0x8C402c09d3622dceeb123b086Bd5227189931BEE",
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
