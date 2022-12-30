/**
 * Migration script to index every lootbox JSON metadata file we have for a lootbox in cloud storage into our
 * firestore database. Run in your nodejs environment.
 *
 * You'll have to install @google-cloud/storage
 * > $ yarn add -D @google-cloud/storage
 *
 * You'll have to authenticate with before running the script:
 * > $ gcloud auth application-default-login
 * > $ gcloud config set project lootbox-fund-staging
 *
 * You might need to temporarily grant your account firestore write permission.
 *
 * to run:
 * npx ts-node --script-mode ./src/migrations/tallyAllThisShit.ts [addr]
 *
 *
 * npx ts-node --script-mode ./src/migrations/tallyAllThisShit.ts
 *
 * [env]    `prod` | `staging`
 */
import {
  ChainIDHex,
  ChainSlugs,
  Claim_Firestore,
  Collection,
  Tournament_Firestore,
} from "@wormgraph/helpers";
import { CollectionReference, Query } from "firebase-admin/firestore";
import { db } from "../api/firebase";
import { Affiliate_Firestore } from "../api/firestore/affiliate.type";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BLOCKCHAINS } from "@wormgraph/helpers";
import { Contract, ethers } from "ethers";

interface ContractType {
  address: string;
  chain: ChainSlugs;
}

const lootboxFactoriesStaging: ContractType[] = [
  {
    address: "0x1A74D7d1705437DA695A9182256677eE56842d65",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x2EF7614e1dC04baFc7A4803Ba44aC204d7BDa5F9",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x216b8419eAF8c896095E356648A59bB8b8DF2C5C",
    chain: ChainSlugs.BSC_TESTNET,
  },
  // 0.2.5-demo
  {
    address: "0x64f6Bf983ed393832986FB59735ec5440D3B44Db",
    chain: ChainSlugs.BSC_TESTNET,
  },
  // 0.2.6-demo
  {
    address: "0xfB60F243de225B275958e76DAe8bC4160B57c939",
    chain: ChainSlugs.BSC_TESTNET,
  },
  // 0.2.7-demo
  {
    address: "0xA8891B4A16d40f612c6a4dc36C45c9D2c1e351F2",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x8F09827d21b3a4be56C1a374DDFd202a9D056256",
    chain: ChainSlugs.BSC_TESTNET,
  },
  // 0.2.8-demo
  {
    address: "0xbc7280E8dba198B76a8aFc50C36542d96f2FEb59",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x5AdA44C7C78f0bD017B77F0829e2a9CB62572123",
    chain: ChainSlugs.BSC_TESTNET,
  },
  // 0.3.1-demo
  {
    address: "0x968914263FFd5A6F364fE2Cf677E34dFeeCC4CA0",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x9B47B9F816eb15139240087e2Ddd833fE0974F47",
    chain: ChainSlugs.BSC_TESTNET,
  },
  // 0.4.0-demo
  {
    address: "0x2247C0fa5AE5F35ccAee7D7cE70E3a008dC72D8D",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0xc1a0c4C2b2bf8F657D1220A25dc98C4848a8d395",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0xfBDa2130998Fc8542F0C75F9bCB6E14902CC6871",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
  {
    address: "0x6FdfC2652838a53e124f89455bCDA593096d6483",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
  // 0.5.0-demo
  {
    address: "0x14a507AB92590B1Bc59a7C78B478A67c42ca2907",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0xD2EF0986722EcFED99d236Cb20B7D5d0C7950551",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0xba0bF6C93AdED14c19Fe13F39e2b67A6070121F2",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
  {
    address: "0x309CC071d4f99a301CeBed7F3F5995f406aA4d9a",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
  // 0.6.0-demo
  {
    address: "0x439369964f854c10C120d5df6375Ab5CF8d0Eb8c",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0xCB16ebA6DfF25D8F4DfE720a81E0534AF54Ff0Ca",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x9D66d9B2Ef0e32FcF382776D35Eb8f1be6389644",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
  {
    address: "0x2f0EA0b9c0b42F4e6a1755177880005B223F4F51",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
  // 0.6.3-demo
  {
    address: "0x21d626966f9c51152255814baB104ce735515446",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0xA089C606F0FD8d37EB01D354b9Fc0cB53C4605d3",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x62a93308BBB2425D2eC95f614bbbDf42C81Bb5a1",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
  {
    address: "0xabb3e04fCCFb71B52de17691F65878F4d5820630",
    chain: ChainSlugs.POLYGON_TESTNET,
  },

  // 0.7.0-demo
  {
    address: "0x12316889Bd36a46c1F5934EB579E7f578f67879a",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x54559cE0c3d46e94f80c6254aa5cEA8D64E93994",
    chain: ChainSlugs.POLYGON_TESTNET,
  },

  // 0.7.1-demo
  {
    address: "0x93807c399C7016dE2E33B96de95e682A6E6b9347",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x144Bbd9b8c3F4760C3Cc2204817996c38A52Af97",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
  // 0.7.2-demo
  {
    address: "0xD606e88ADcCF4aD695Bc3b2e92E775AbFF5b8B1B",
    chain: ChainSlugs.POLYGON_TESTNET,
  },

  // 0.7.5-demo
  {
    address: "0xc40FD83A4939B363501F7942360d3cE2312d2e53",
    chain: ChainSlugs.BSC_TESTNET,
  },
  {
    address: "0x01e4f496C2eBA3E868785E5cF87A0037D9a765Dc",
    chain: ChainSlugs.POLYGON_TESTNET,
  },
];
const lootboxFactoriesProd: ContractType[] = [
  // 0.3.0-prod
  {
    address: "0x32E2D811d2A676F3DDB56B149d5b28E55Fa9a3d9",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xB9EF3A633d5dB213680D5b43475939187227F25A",
    chain: ChainSlugs.BSC_MAINNET,
  },
  // 0.4.0-prod
  {
    address: "0xC3570D669898FCd5F668284106D06984c1120814",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xD74bD380179159AC6f226FaAAb5096e20f15b0B7",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xa70053a8D3b31b661CA329D9673341625C8564d0",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  {
    address: "0xcB2CcfeBcb876c161b1cB68c50442D16549cBAEf",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  // 0.5.0-prod
  {
    address: "0x93D2523cFA435c25fda15bc0994f309f661239Cd",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xFb6c1634dfeB793D43Eb5A0116651fe967c20446",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xf8bA10c23Af7C644e96FC03EFaB3bA3c466232A1",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  {
    address: "0x26c5af4e8322cdB28Be19a23ec79f97Ae9A52540",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  // 0.6.0-prod
  {
    address: "0x2d42627555b7e69365fF186a00B4B0361a617BF7",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xF3d7A43ddbaF6E5a4b128585cf5dEaDa0ED405e1",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0x6B39b159eCB60C08a42D7D5d6De18cE804221E52",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  {
    address: "0x55E8c0Df4750cD3b12C2237c50fd49253c839dc6",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  // 0.6.1-prod
  {
    address: "0x025B8Aa89D7e5A70a94aF5CB364f9B82597A487D",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0x6B39b159eCB60C08a42D7D5d6De18cE804221E52",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0x5e6eE4445E373C96f8F1043BA60C985A4935C4be",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  {
    address: "0x37914A8A424530620dc551A52f84016C7c309144",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  // 0.6.3-prod
  {
    address: "0x9FB5Ab989e91b8104B0ca67e3551F7Ba509c14c1",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xECc9f534C60a20729c15513e556740B6d68980Ea",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0x9b491ffF30C2dc56440db1fe0bA2685aFed1f86F",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  {
    address: "0x320120a1e048933CcaAd73DE93e5f8C7bFeE8B7c",
    chain: ChainSlugs.POLYGON_MAINNET,
  },

  // 0.6.4-prod
  {
    address: "0x09BE2ebFf5D2cb6ce8cB40e85fcEbf8e0365b1bA",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0x64BC3806518a2f8235260B4b6F83AE0CF4546C1d",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xE60f34C208E6632A6EbE454152C6ab28a1980420",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  {
    address: "0x4421B3D495C65F9484a0091bE20DB68ad63E32c0",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  // 0.7.0-prod
  {
    address: "0x60c672ce48e65160905983ef7Aca827Ff909658a",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0x98C168035a1EFE91Ce7e368A73C0fb784a87c98b",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  // 0.7.1-prod
  {
    address: "0x7AF2c519aaDB2153413d79F1427bA499A13484ff",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xAb73bCF5180cD45DD8BE3a4297A573B2d6dADad5",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  // 0.7.2-prod
  {
    address: "0x7AF2c519aaDB2153413d79F1427bA499A13484ff",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0xAb73bCF5180cD45DD8BE3a4297A573B2d6dADad5",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
  // 0.7.5-prod
  {
    address: "0x2fD3C84E898DF0a3F64432B3fbaDb30EeC0E65A5",
    chain: ChainSlugs.BSC_MAINNET,
  },
  {
    address: "0x4CB401fA068ffEaDDAf5C3a0dD2f2615858e774B",
    chain: ChainSlugs.POLYGON_MAINNET,
  },
];

const run = async () => {
  // const tournaments: Tournament_Firestore[] = [];
  // const collectionRef = db.collection(
  //   Collection.Tournament
  // ) as CollectionReference<Tournament_Firestore>;

  // const collectionSnapshot = await collectionRef.get();

  // for (let doc of collectionSnapshot.docs) {
  //   const data = doc.data();
  //   tournaments.push(data);
  // }

  // const organizers: Affiliate_Firestore[] = [];
  // const organizersCollectionRef = db.collection(
  //   Collection.Affiliate
  // ) as CollectionReference<Affiliate_Firestore>;

  // const organizersCollectionSnapshot = await organizersCollectionRef.get();

  // for (let doc of organizersCollectionSnapshot.docs) {
  //   const data = doc.data();
  //   organizers.push(data);
  // }

  // // web2 stuff
  // console.log("found tournaments:  ", tournaments.length);
  // console.log("found organizers:   ", organizers.length);

  // web3 stuff....
  const allFactories = [
    ...lootboxFactoriesStaging,
    ...lootboxFactoriesProd,
  ].map((a) => {
    return {
      address: ethers.utils.getAddress(a.address),
      chain: a.chain,
    };
  });

  let totalLootboxCount = 0;
  let totalTicketCount = 0;
  let i = 1;
  for (let { address, chain } of allFactories) {
    console.log(`\n\nprocessing ${i} of ${allFactories.length}`);
    const rpc = BLOCKCHAINS[chain].rpcUrls[0];
    const ABI = [
      {
        inputs: [],
        name: "viewLootboxes",
        outputs: [
          {
            internalType: "bytes32[]",
            name: "",
            type: "bytes32[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];
    const provider = new JsonRpcProvider(rpc);
    const contract = new Contract(address, ABI, provider);
    const _lootboxes: string[] = await contract.viewLootboxes();
    const lootboxes = _lootboxes.map((a) => {
      return {
        address: ethers.utils.getAddress("0x" + a.slice(26)),
        chain,
      };
    });
    totalLootboxCount = totalLootboxCount + lootboxes.length;

    for (let { address, chain } of lootboxes) {
      const rpc = BLOCKCHAINS[chain].rpcUrls[0];
      const ABI = [
        {
          inputs: [],
          name: "ticketIdCounter",
          outputs: [
            {
              internalType: "uint256",
              name: "_value",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ];
      const provider = new JsonRpcProvider(rpc);
      const contract = new Contract(address, ABI, provider);
      const ticketIdCounter = await contract.ticketIdCounter();
      const nTickets = ticketIdCounter.toNumber();
      totalTicketCount = totalTicketCount + nTickets;
    }

    console.log("Running Lootbox Count: ", totalLootboxCount);
    console.log("Running Ticket Count:  ", totalTicketCount);

    i++;
  }

  console.log("\n\nTotal Tallied Web3 Data \n");
  console.log("Total Lootbox Count: ", totalLootboxCount);
  console.log("Total Ticket Count:  ", totalTicketCount);
};

run().catch(console.error);
