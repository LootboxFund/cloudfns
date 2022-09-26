import { ethers } from "ethers";
import { Address, LootboxCosmicFactoryABI, LootboxCreatedNonce } from "@wormgraph/helpers";

export const decodeEVMLog = <T>({
    eventName,
    log,
    abi,
    keys,
}: {
    eventName: string;
    log: any;
    abi: any;
    keys: (keyof (T | ethers.utils.Result))[];
}): T => {
    const iface = new ethers.utils.Interface(abi);
    const data = iface.decodeEventLog(eventName, log.data, log.topics);

    const formattedData = keys.reduce(
        (acc, key) => ({
            ...acc,
            [key]: data[key],
        }),
        {}
    );
    return formattedData as T;
};

interface LootboxCreatedEvent {
    lootboxName: string;
    lootbox: Address;
    issuer: Address;
    maxTickets: number;
    nonce: LootboxCreatedNonce;
    baseTokenURI: string;
}

export const decodeLootboxCreatedEvent = (log: any): LootboxCreatedEvent => {
    const decodedLog = <LootboxCreatedEvent>decodeEVMLog({
        eventName: "LootboxCreated",
        log,
        abi: LootboxCosmicFactoryABI,
        keys: ["lootboxName", "lootbox", "issuer", "maxTickets", "nonce", "baseTokenURI"],
    });

    return decodedLog;
};
