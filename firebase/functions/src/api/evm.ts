// import { ethers } from "ethers";
// import { logger } from "firebase-functions";
// import { Address, LootboxCreatedNonce } from "@wormgraph/helpers";
// import LootboxCosmicFactoryABI from "@wormgraph/helpers/lib/abi/LootboxCosmicFactory.json";

// export const decodeEVMLog = <T>({
//     eventName,
//     log,
//     abi,
//     keys,
// }: {
//     eventName: string;
//     log: any;
//     abi: string;
//     keys: (keyof (T | ethers.utils.Result))[];
// }): T => {
//     const iface = new ethers.utils.Interface(abi);
//     const data = iface.decodeEventLog(eventName, log.data, log.topics);

//     const formattedData = keys.reduce(
//         (acc, key) => ({
//             ...acc,
//             [key]: data[key],
//         }),
//         {}
//     );
//     return formattedData as T;
// };

// interface LootboxCreatedEvent {
//     lootboxName: string;
//     lootbox: Address;
//     issuer: Address;
//     maxTickets: number;
//     nonce: LootboxCreatedNonce;
//     baseTokenURI: string;
// }

// export const decodeLootboxCreatedEvent = (log: any): LootboxCreatedEvent => {
//     logger.info("Decoding lootbox created event", { log });
//     logger.debug("using abi", { LootboxCosmicFactoryABI, stringified: JSON.stringify(LootboxCosmicFactoryABI) });
//     const decodedLog = decodeEVMLog<LootboxCreatedEvent>({
//         eventName: "LootboxCreated",
//         log,
//         abi: JSON.stringify(LootboxCosmicFactoryABI),
//         keys: ["lootboxName", "lootbox", "issuer", "maxTickets", "nonce", "baseTokenURI"],
//     });

//     return decodedLog;
// };
