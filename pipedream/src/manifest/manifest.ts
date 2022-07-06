/**
 * Please copy the content of './manifest.json' here
 * (I'm not sure how to use the JSON file with Pipedream)
 */

export default {
  alias: "0.6.3-prod",
  description:
    "\n    Prod version of Lootbox with Party Basket + Bulk whitelisting!\n  ",
  chains: [
    {
      chainIdHex: "0x38",
      chainIdDecimal: "56",
      chainName: "Binance Smart Chain",
      displayName: "BSC Mainnet",
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpcUrls: ["https://bsc-dataseed.binance.org/"],
      blockExplorerUrls: ["https://bscscan.com/"],
      currentNetworkLogo:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
      slug: "BSC_MAINNET",
      priceFeedUSD: "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee",
    },
    {
      slug: "POLYGON_MAINNET",
      chainIdHex: "0x89",
      chainIdDecimal: "137",
      chainName: "Polygon (Mainnet)",
      displayName: "Polygon Mainnet",
      nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
      rpcUrls: ["https://polygon-rpc.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"],
      currentNetworkLogo:
        "https://firebasestorage.googleapis.com/v0/b/guildfx-exchange.appspot.com/o/assets%2Ftokens%2FMATIC_COLORED.png?alt=media",
      priceFeedUSD: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
    },
  ],
  date: "2022-07-05T22:53:04.000Z",
  semver: {
    major: 0,
    minor: 6,
    patch: 3,
    prerelease: ["prod"],
    build: [],
    id: "0.6.3-prod",
  },
  openZeppelin: {
    alias: "0.6.3-prod",
    multiSigs: {
      "0x38": {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0x0a284530Eb51033D363648281BDe68F581188Df1",
          signers: [
            "0xE0eC4d917a9E6754801Ed503582399D8cBa91858",
            "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
          ],
          chainHexID: "0x38",
          threshold: 2,
          slug: "LootboxDAO",
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "0x96779B26982bcB9684fA2ec2Ae53585266733A03",
          signers: [
            "0xE0eC4d917a9E6754801Ed503582399D8cBa91858",
            "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
          ],
          chainHexID: "0x38",
          threshold: 2,
          slug: "LootboxDAO_Treasury",
        },
      },
      "0x89": {
        LootboxDAO: {
          alias: "LootboxDAO",
          address: "0x0d928c9baE570f5F526F1785874cA99523bEd4cA",
          signers: [
            "0xE0eC4d917a9E6754801Ed503582399D8cBa91858",
            "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
          ],
          chainHexID: "0x89",
          threshold: 2,
          slug: "LootboxDAO",
        },
        LootboxDAO_Treasury: {
          alias: "LootboxDAO Treasury",
          address: "0x67Ad5E1b4e7CC0458C3c7bBC8Fa6292b78425aAe",
          signers: [
            "0xE0eC4d917a9E6754801Ed503582399D8cBa91858",
            "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
          ],
          chainHexID: "0x89",
          threshold: 2,
          slug: "LootboxDAO_Treasury",
        },
      },
    },
    contracts: {
      "0x38": {
        LootboxInstantFactory: {
          address: "__________________________________________",
          slug: "LootboxInstantFactory",
          bulkMinterSuperStaff: "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
        },
        LootboxEscrowFactory: {
          address: "__________________________________________",
          slug: "LootboxEscrowFactory",
          bulkMinterSuperStaff: "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
        },
        PartyBasketFactory: {
          address: "__________________________________________",
          slug: "PartyBasketFactory",
          whitelister: "0xc84a10D6011006ea12FBAa7b9BB91df1d713A667",
        },
      },
      "0x89": {
        LootboxInstantFactory: {
          address: "__________________________________________",
          slug: "LootboxInstantFactory",
          bulkMinterSuperStaff: "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
        },
        LootboxEscrowFactory: {
          address: "__________________________________________",
          slug: "LootboxEscrowFactory",
          bulkMinterSuperStaff: "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
        },
        PartyBasketFactory: {
          address: "__________________________________________",
          slug: "PartyBasketFactory",
          whitelister: "0xc84a10D6011006ea12FBAa7b9BB91df1d713A667",
        },
      },
    },
    secrets: [{ name: "JWT_ON_CREATE_LOOTBOX" }],
    autoTasks: {
      onCreateLootboxInstant: {
        id: "__________________________________________",
        alias: "On creation of an Instant Lootbox",
        semver: "0.6.3-prod",
        slug: "onCreateLootboxInstant",
      },
      onCreateLootboxEscrow: {
        id: "__________________________________________",
        alias: "On creation of an Escrow Lootbox",
        semver: "0.6.3-prod",
        slug: "onCreateLootboxEscrow",
      },
    },
    sentinels: {
      "0x38": {
        onCreateLootboxInstant: {
          id: "__________________________________________",
          alias: "[0.6.3-prod] Instant Lootbox onCreate",
          semver: "0.6.3-prod",
          slug: "onCreateLootboxInstant",
          ozChainSlug: "bsc",
          contractWatchAddress: "__________________________________________",
        },
        onCreateLootboxEscrow: {
          id: "__________________________________________",
          alias: "[0.6.3-prod] Escrow Lootbox onCreate",
          semver: "0.6.3-prod",
          slug: "onCreateLootboxEscrow",
          ozChainSlug: "bsc",
          contractWatchAddress: "__________________________________________",
        },
      },
      "0x89": {
        onCreateLootboxInstant: {
          id: "__________________________________________",
          alias: "[0.6.3-prod] Instant Lootbox onCreate",
          semver: "0.6.3-prod",
          slug: "onCreateLootboxInstant",
          ozChainSlug: "matic",
          contractWatchAddress: "__________________________________________",
        },
        onCreateLootboxEscrow: {
          id: "__________________________________________",
          alias: "[0.6.3-prod] Escrow Lootbox onCreate",
          semver: "0.6.3-prod",
          slug: "onCreateLootboxEscrow",
          ozChainSlug: "matic",
          contractWatchAddress: "__________________________________________",
        },
      },
    },
    semver: "0.6.3-prod",
  },
  pipedream: {
    alias: "0.6.3-prod",
    email: "0xnewton@lootbox.fund",
    sources: {
      onCreateLootboxInstant: {
        alias: "[0.6.3-prod] onCreateLootboxInstant",
        pipedreamID: "__________________________________________",
        semver: "0.1.0",
        webhookEndpoint:
          "https://__________________________________________.m.pipedream.net",
        slug: "0-6-3-prod-onCreateLootboxInstant",
      },
      onCreateLootboxEscrow: {
        alias: "[0.6.3-prod] onCreateLootboxEscrow",
        pipedreamID: "__________________________________________",
        semver: "0.1.0",
        webhookEndpoint:
          "https://__________________________________________.m.pipedream.net",
        slug: "0-6-3-prod-onCreateLootboxEscrow",
      },
    },
    actions: {
      onCreateLootboxInstant: {
        alias: "[0.6.3-prod] onCreateLootboxInstant",
        pipedreamID: "__________________________________________",
        pipedreamSemver: "0.1.0",
        slug: "0-6-3-prod-onCreateLootboxInstant",
      },
      onCreateLootboxEscrow: {
        alias: "[0.6.3-prod] onCreateLootboxEscrow",
        pipedreamID: "__________________________________________",
        pipedreamSemver: "0.1.0",
        slug: "0-6-3-prod-onCreateLootboxEscrow",
      },
    },
    semver: "0.6.3-prod",
  },
  cloudRun: {
    alias: "string",
    semver: "0.6.3-prod",
    containers: {
      stampNewLootbox: {
        slug: "stampNewLootbox",
        fullRoute:
          "https://stamp-nft-0-6-3-prod-qrmywylbhq-ue.a.run.app/stamp/new/lootbox",
      },
      stampNewTicket: {
        slug: "stampNewTicket",
        fullRoute:
          "https://stamp-nft-0-6-3-prod-qrmywylbhq-ue.a.run.app/stamp/new/ticket",
      },
      lootboxServer: {
        slug: "lootboxServer",
        fullRoute: "https://lootbox-server-qrmywylbhq-ue.a.run.app/graphql",
      },
    },
  },
  googleCloud: {
    alias: "0.6.3-prod",
    projectID: "lootbox-fund-prod",
    semver: "0.6.3-prod",
  },
  storage: {
    downloadUrl: "https://storage.googleapis.com",
    buckets: {
      abi: { id: "lootbox-abi-prod" },
      stamp: { id: "lootbox-stamp-prod" },
      data: { id: "lootbox-data-prod" },
      constants: { id: "lootbox-constants-prod" },
      widgets: { id: "lootbox-widgets-prod" },
    },
  },
  secretManager: {
    secrets: [
      { name: "PARTY_BASKET_WHITELISTER_PRIVATE_KEY", version: 1 },
      { name: "OZ_DEFENDER_API_KEY", version: 2 },
      { name: "OZ_DEFENDER_API_SECRET", version: 2 },
      { name: "PD_ABI_UPLOADER_SECRET", version: 1 },
      { name: "JWT_ON_CREATE_LOOTBOX", version: 1 },
      { name: "STAMP_SECRET", version: 1 },
    ],
  },
  microfrontends: {
    alias: "0.6.3-prod",
    semver: "0.6.3-prod",
    widgets: {
      fundraiserPage: {
        alias: "fundraiserPage",
        semver: "0.6.3-prod",
        slug: "fundraiserPage",
      },
      createLootbox: {
        alias: "createLootbox",
        semver: "0.6.3-prod",
        slug: "createLootbox",
      },
      manageLootbox: {
        alias: "manageLootbox",
        semver: "0.6.3-prod",
        slug: "manageLootbox",
      },
    },
    webflow: {
      alias: "0.6.3-prod",
      semver: "0.6.3-prod",
      email: "support@lootbox.fund",
      lootboxUrl: "https://www.lootbox.fund/buy",
      createPage: "https://www.lootbox.fund/create",
      managePage: "https://www.lootbox.fund/manage",
      authPage: "https://www.lootbox.fund/auth",
      myProfilePage: "https://www.lootbox.fund/profile",
      tournamentManagePage: "https://www.lootbox.fund/tournament/manage",
      tournamentCreatePage: "https://www.lootbox.fund/tournament/create",
      tournamentPublicPage: "https://www.lootbox.fund/tournament",
      myFundraisersPage: "https://www.lootbox.fund/my-fundraisers",
      myCollectionsPage: "https://www.lootbox.fund/my-collections",
      battleFeed: "https://www.lootbox.fund/battle-feed",
      basketRedeemPage: "https://www.lootbox.fund/basket/redeem",
      basketManagePage: "https://www.lootbox.fund/basket/manage",
    },
  },
  lootbox: {
    alias: "0.6.3-prod",
    semver: "0.6.3-prod",
    contracts: {
      "0x38": {
        LootboxInstantFactory: {
          address: "__________________________________________",
          slug: "LootboxInstantFactory",
          bulkMinterSuperStaff: "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
        },
        LootboxEscrowFactory: {
          address: "__________________________________________",
          slug: "LootboxEscrowFactory",
          bulkMinterSuperStaff: "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
        },
        PartyBasketFactory: {
          address: "__________________________________________",
          slug: "PartyBasketFactory",
          whitelister: "0xc84a10D6011006ea12FBAa7b9BB91df1d713A667",
        },
      },
      "0x89": {
        LootboxInstantFactory: {
          address: "__________________________________________",
          slug: "LootboxInstantFactory",
          bulkMinterSuperStaff: "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
        },
        LootboxEscrowFactory: {
          address: "__________________________________________",
          slug: "LootboxEscrowFactory",
          bulkMinterSuperStaff: "0xFEe4e44F532688aF5281D14DE3cc0bEaBa73E0Be",
        },
        PartyBasketFactory: {
          address: "__________________________________________",
          slug: "PartyBasketFactory",
          whitelister: "0xc84a10D6011006ea12FBAa7b9BB91df1d713A667",
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
    appId: "1:2446790853:web:e3254f0f0f151f138ea0ac",
  },
};
