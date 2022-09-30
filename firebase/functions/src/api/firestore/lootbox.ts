import {
    Address,
    ChainIDHex,
    ChainInfo,
    Collection,
    LootboxID,
    LootboxStatus_Firestore,
    LootboxVariant_Firestore,
    Lootbox_Firestore,
    UserID,
} from "@wormgraph/helpers";
import { DocumentReference, Query, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";

export const getLootbox = async (id: LootboxID): Promise<Lootbox_Firestore | undefined> => {
    const lootboxRef = db.collection(Collection.Lootbox).doc(id) as DocumentReference<Lootbox_Firestore>;

    const lootboxSnapshot = await lootboxRef.get();

    if (!lootboxSnapshot.exists) {
        return undefined;
    } else {
        return lootboxSnapshot.data() as Lootbox_Firestore | undefined;
    }
};

export const getLootboxByChainAddress = async (
    address: Address,
    chain: ChainIDHex
): Promise<Lootbox_Firestore | undefined> => {
    const lootboxRef = db
        .collection(Collection.Lootbox)
        .where("address", "==", address)
        .where("chainIdHex", "==", chain)
        .limit(1) as Query<Lootbox_Firestore>;

    const lootboxSnapshot = await lootboxRef.get();

    if (lootboxSnapshot.empty) {
        return undefined;
    } else {
        return lootboxSnapshot.docs[0].data() as Lootbox_Firestore | undefined;
    }
};

interface CreateLootboxPayload {
    address: Address;
    factory: Address;
    creatorID: UserID;
    creatorAddress: Address;
    transactionHash: string;
    blockNumber: string;
    stampImage: string;
    logo: string;
    name: string;
    description: string;
    maxTickets: number;
    baseTokenURI: string;
    backgroundImage: string;
    nftBountyValue: string;
    themeColor: string;
    joinCommunityUrl?: string;
}
export const createLootbox = async (payload: CreateLootboxPayload, chain: ChainInfo): Promise<Lootbox_Firestore> => {
    const lootboxRef = db.collection(Collection.Lootbox).doc() as DocumentReference<Lootbox_Firestore>;

    const lootboxPayload: Lootbox_Firestore = {
        id: lootboxRef.id as LootboxID,
        address: payload.address,
        factory: payload.factory,
        creatorID: payload.creatorID,
        creatorAddress: payload.creatorAddress,
        variant: LootboxVariant_Firestore.cosmic,
        chainIdHex: chain.chainIdHex,
        chainIdDecimal: chain.chainIdDecimal,
        chainName: chain.chainName,
        transactionHash: payload.transactionHash,
        blockNumber: payload.blockNumber,
        baseTokenURI: payload.baseTokenURI,
        stampImage: payload.stampImage,
        logo: payload.logo,
        name: payload.name,
        description: payload.description,
        nftBountyValue: payload.nftBountyValue,
        joinCommunityUrl: payload.joinCommunityUrl || "",
        status: LootboxStatus_Firestore.active,
        maxTickets: payload.maxTickets,
        backgroundImage: payload.backgroundImage,
        themeColor: payload.themeColor,
        timestamps: {
            createdAt: Timestamp.now().toMillis(),
            updatedAt: Timestamp.now().toMillis(),
            deletedAt: null,
        },
    };

    await lootboxRef.set(lootboxPayload);

    return lootboxPayload;
};
