import {
    Address,
    ChainIDHex,
    ChainInfo,
    Collection,
    LootboxID,
    LootboxMintSignatureNonce,
    LootboxMintWhitelistID,
    LootboxStatus_Firestore,
    LootboxTournamentSnapshotID,
    LootboxTournamentSnapshot_Firestore,
    LootboxTournamentStatus_Firestore,
    LootboxVariant_Firestore,
    Lootbox_Firestore,
    MintWhitelistSignature_Firestore,
    TournamentID,
    UserID,
} from "@wormgraph/helpers";
import { DocumentReference, FieldValue, Query, Timestamp } from "firebase-admin/firestore";
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
    symbol: string;
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
        symbol: payload.symbol,
        runningCompletedClaims: 0,
        timestamps: {
            createdAt: Timestamp.now().toMillis(),
            updatedAt: Timestamp.now().toMillis(),
            deletedAt: null,
        },
    };

    await lootboxRef.set(lootboxPayload);

    return lootboxPayload;
};

interface CreateLootboxTournamentSnapshot {
    tournamentID: TournamentID;
    lootboxAddress: Address;
    lootboxID: LootboxID;
    creatorID: UserID;
    lootboxCreatorID: UserID;
    description: string;
    name: string;
    stampImage: string;
}
export const createLootboxTournamentSnapshot = async (
    payload: CreateLootboxTournamentSnapshot
): Promise<LootboxTournamentSnapshot_Firestore> => {
    const doc = db
        .collection(Collection.Tournament)
        .doc(payload.tournamentID)
        .collection(Collection.LootboxTournamentSnapshot)
        .doc() as DocumentReference<LootboxTournamentSnapshot_Firestore>;

    const request: LootboxTournamentSnapshot_Firestore = {
        id: doc.id as LootboxTournamentSnapshotID,
        tournamentID: payload.tournamentID as TournamentID,
        address: payload.lootboxAddress,
        lootboxID: payload.lootboxID,
        creatorID: payload.creatorID,
        lootboxCreatorID: payload.lootboxCreatorID,
        description: payload.description,
        name: payload.name,
        stampImage: payload.stampImage,
        impressionPriority: 0,
        status: LootboxTournamentStatus_Firestore.active,
        timestamps: {
            createdAt: Timestamp.now().toMillis(),
            updatedAt: Timestamp.now().toMillis(),
            deletedAt: null,
        },
    };

    await doc.set(request);

    return request;
};

export const incrementLootboxRunningClaims = async (lootboxID: LootboxID): Promise<void> => {
    const lootboxRef = db.collection(Collection.Lootbox).doc(lootboxID) as DocumentReference<Lootbox_Firestore>;

    const updateReq: Partial<Lootbox_Firestore> = {
        runningCompletedClaims: FieldValue.increment(1) as unknown as number,
    };

    await lootboxRef.update(updateReq);
};

interface CreateMintWhitelistSignatureRequest {
    signature: string;
    signer: Address;
    whitelistedAddress: Address;
    lootboxId: LootboxID;
    lootboxAddress: Address;
    nonce: LootboxMintSignatureNonce;
}
export const createMintWhitelistSignature = async ({
    signature,
    signer,
    whitelistedAddress,
    lootboxId,
    lootboxAddress,
    nonce,
}: CreateMintWhitelistSignatureRequest): Promise<MintWhitelistSignature_Firestore> => {
    const signatureRef = db
        .collection(Collection.Lootbox)
        .doc(lootboxId)
        .collection(Collection.MintWhiteList)
        .doc() as DocumentReference<MintWhitelistSignature_Firestore>;

    const signatureDocument: MintWhitelistSignature_Firestore = {
        id: signatureRef.id as LootboxMintWhitelistID,
        isRedeemed: false,
        lootboxAddress,
        whitelistedAddress,
        signature,
        signer,
        nonce,
        createdAt: Timestamp.now().toMillis(),
        updatedAt: Timestamp.now().toMillis(),
        deletedAt: null,
    };

    await signatureRef.set(signatureDocument);

    return signatureDocument;
};
