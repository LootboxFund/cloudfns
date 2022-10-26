import {
    Address,
    ChainIDHex,
    Claim_Firestore,
    Collection,
    LootboxID,
    LootboxMintSignatureNonce,
    LootboxMintWhitelistID,
    LootboxTicketID,
    LootboxTicketID_Web3,
    LootboxTicket_Firestore,
    LootboxTournamentSnapshot_Firestore,
    Lootbox_Firestore,
    MintWhitelistSignature_Firestore,
    UserID,
    LootboxTicketDigest,
    ClaimTimestamps_Firestore,
    LootboxVariant_Firestore,
    ChainIDDecimal,
    LootboxCreatedNonce,
    LootboxTimestamps,
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

// interface CreateLootboxPayload {
//     address: Address;
//     factory: Address;
//     creatorID: UserID;
//     creatorAddress: Address;
//     transactionHash: string;
//     blockNumber: string;
//     stampImage: string;
//     logo: string;
//     name: string;
//     description: string;
//     symbol: string;
//     maxTickets: number;
//     baseTokenURI: string;
//     backgroundImage: string;
//     nftBountyValue: string;
//     themeColor: string;
//     joinCommunityUrl?: string;
//     nonce: LootboxCreatedNonce;
// }
// export const createLootbox = async (payload: CreateLootboxPayload, chain: ChainInfo): Promise<Lootbox_Firestore> => {
//     const lootboxRef = db.collection(Collection.Lootbox).doc() as DocumentReference<Lootbox_Firestore>;

//     const lootboxPayload: Lootbox_Firestore = {
//         id: lootboxRef.id as LootboxID,
//         address: payload.address,
//         factory: payload.factory,
//         creatorID: payload.creatorID,
//         creatorAddress: payload.creatorAddress,
//         variant: LootboxVariant_Firestore.cosmic,
//         chainIdHex: chain.chainIdHex,
//         chainIdDecimal: chain.chainIdDecimal,
//         chainName: chain.chainName,
//         transactionHash: payload.transactionHash,
//         blockNumber: payload.blockNumber,
//         baseTokenURI: payload.baseTokenURI,
//         stampImage: payload.stampImage,
//         logo: payload.logo,
//         name: payload.name,
//         description: payload.description,
//         nftBountyValue: payload.nftBountyValue,
//         joinCommunityUrl: payload.joinCommunityUrl || "",
//         status: LootboxStatus_Firestore.active,
//         maxTickets: payload.maxTickets,
//         backgroundImage: payload.backgroundImage,
//         themeColor: payload.themeColor,
//         symbol: payload.symbol,
//         runningCompletedClaims: 0,
//         creationNonce: payload.nonce,
//         members: [],
//         timestamps: {
//             createdAt: Timestamp.now().toMillis(),
//             updatedAt: Timestamp.now().toMillis(),
//             deletedAt: null,
//         },
//     };

//     await lootboxRef.set(lootboxPayload);

//     return lootboxPayload;
// };

// interface CreateLootboxTournamentSnapshot {
//     tournamentID: TournamentID;
//     lootboxAddress: Address;
//     lootboxID: LootboxID;
//     creatorID: UserID;
//     lootboxCreatorID: UserID;
//     description: string;
//     name: string;
//     stampImage: string;
// }
// export const createLootboxTournamentSnapshot = async (
//     payload: CreateLootboxTournamentSnapshot
// ): Promise<LootboxTournamentSnapshot_Firestore> => {
//     const doc = db
//         .collection(Collection.Tournament)
//         .doc(payload.tournamentID)
//         .collection(Collection.LootboxTournamentSnapshot)
//         .doc() as DocumentReference<LootboxTournamentSnapshot_Firestore>;

//     const request: LootboxTournamentSnapshot_Firestore = {
//         id: doc.id as LootboxTournamentSnapshotID,
//         tournamentID: payload.tournamentID as TournamentID,
//         address: payload.lootboxAddress,
//         lootboxID: payload.lootboxID,
//         creatorID: payload.creatorID,
//         lootboxCreatorID: payload.lootboxCreatorID,
//         description: payload.description,
//         name: payload.name,
//         stampImage: payload.stampImage,
//         impressionPriority: 0,
//         status: LootboxTournamentStatus_Firestore.active,
//         timestamps: {
//             createdAt: Timestamp.now().toMillis(),
//             updatedAt: Timestamp.now().toMillis(),
//             deletedAt: null,
//         },
//     };

//     await doc.set(request);

//     return request;
// };

export const incrementLootboxRunningClaims = async (lootboxID: LootboxID): Promise<void> => {
    const lootboxRef = db.collection(Collection.Lootbox).doc(lootboxID) as DocumentReference<Lootbox_Firestore>;

    const updateReq: Partial<Lootbox_Firestore> = {
        runningCompletedClaims: FieldValue.increment(1) as unknown as number,
    };

    await lootboxRef.update(updateReq);
};

interface CreateTicketRequest {
    minterUserID: UserID;
    lootboxID: LootboxID;
    lootboxAddress: Address;
    ticketID: LootboxTicketID_Web3;
    minterAddress: Address;
    mintWhitelistID: LootboxMintWhitelistID;
    stampImage: string;
    metadataURL: string;
    digest: LootboxTicketDigest;
    nonce: LootboxMintSignatureNonce;
    whitelist: MintWhitelistSignature_Firestore;
}

export const finalizeMint = async (payload: CreateTicketRequest): Promise<LootboxTicket_Firestore> => {
    // - updates mintWhitelist.redeemed = true
    // - creates LootboxTicket_Firestore as subcollection under Lootbox

    const batch = db.batch();

    const ticketRef = db
        .collection(Collection.Lootbox)
        .doc(payload.lootboxID)
        .collection(Collection.LootboxTicket)
        .doc() as DocumentReference<LootboxTicket_Firestore>;

    const ticketDocument: LootboxTicket_Firestore = {
        lootboxAddress: payload.lootboxAddress,
        ticketID: payload.ticketID,
        minterAddress: payload.minterAddress,
        mintWhitelistID: payload.mintWhitelistID,
        createdAt: Timestamp.now().toMillis(),
        stampImage: payload.stampImage,
        metadataURL: payload.metadataURL,
        lootboxID: payload.lootboxID,
        minterUserID: payload.minterUserID,
        id: ticketRef.id as LootboxTicketID,
        digest: payload.digest,
        nonce: payload.nonce,
    };

    const whitelistRef = db
        .collection(Collection.Lootbox)
        .doc(payload.lootboxID)
        .collection(Collection.MintWhiteList)
        .doc(payload.mintWhitelistID) as DocumentReference<MintWhitelistSignature_Firestore>;

    const whitelistUpdateReq: Partial<MintWhitelistSignature_Firestore> = {
        isRedeemed: true,
        lootboxTicketID: ticketRef.id as LootboxTicketID,
        whitelistedAt: Timestamp.now().toMillis(),
    };

    // We need to update the claim with ticketID & web3TicketID
    const claimRef = db
        .collection(Collection.Referral)
        .doc(payload.whitelist.referralID)
        .collection(Collection.Claim)
        .doc(payload.whitelist.claimID);

    const timestampName: keyof Claim_Firestore = "timestamps";
    const updatedAtName: keyof ClaimTimestamps_Firestore = "updatedAt";
    const mintedAtName: keyof ClaimTimestamps_Firestore = "mintedAt";

    const claimUpdateReq: Partial<Claim_Firestore> = {
        ticketID: ticketRef.id as LootboxTicketID,
        ticketWeb3ID: payload.ticketID,
        [`${timestampName}.${updatedAtName}`]: Timestamp.now().toMillis(),
        [`${timestampName}.${mintedAtName}`]: Timestamp.now().toMillis(),
    };

    batch.create(ticketRef, ticketDocument);
    batch.update(whitelistRef, whitelistUpdateReq);
    batch.update(claimRef, claimUpdateReq);

    await batch.commit();

    const ticket = await ticketRef.get();
    return ticket.data()!;
};

export const getTicketByDigest = async (
    lootboxID: LootboxID,
    digest: LootboxTicketDigest
): Promise<LootboxTicket_Firestore | undefined> => {
    const ref = db
        .collection(Collection.Lootbox)
        .doc(lootboxID)
        .collection(Collection.LootboxTicket)
        .where("digest", "==", digest)
        .limit(1) as Query<LootboxTicket_Firestore>;

    const query = await ref.get();

    if (query.empty) {
        return undefined;
    }

    const doc = query.docs[0];
    return doc.data();
};

export const getWhitelistByDigest = async (
    lootboxID: LootboxID,
    digest: LootboxTicketDigest
): Promise<MintWhitelistSignature_Firestore | undefined> => {
    const ref = db
        .collection(Collection.Lootbox)
        .doc(lootboxID)
        .collection(Collection.MintWhiteList)
        .where("digest", "==", digest)
        .limit(1) as Query<MintWhitelistSignature_Firestore>;

    const query = await ref.get();

    if (query.empty) {
        return undefined;
    } else {
        return query.docs[0].data();
    }
};

export const getTicketByWeb3ID = async (
    lootboxID: LootboxID,
    ticketID: LootboxTicketID_Web3
): Promise<LootboxTicket_Firestore | undefined> => {
    const ticketRef = db
        .collection(Collection.Lootbox)
        .doc(lootboxID)
        .collection(Collection.LootboxTicket)
        .where("ticketID", "==", ticketID)
        .limit(1) as Query<LootboxTicket_Firestore>;

    const ticketSnapshot = await ticketRef.get();

    if (ticketSnapshot.empty) {
        return undefined;
    }

    return ticketSnapshot.docs[0].data();
};

export const getAllLootboxTournamentSnapshotRefs = async (
    lootboxID: LootboxID
): Promise<DocumentReference<LootboxTournamentSnapshot_Firestore>[]> => {
    const lootboxIDFieldName: keyof LootboxTournamentSnapshot_Firestore = "lootboxID";
    const collectionRef = db
        .collectionGroup(Collection.LootboxTournamentSnapshot)
        .where(lootboxIDFieldName, "==", lootboxID) as Query<LootboxTournamentSnapshot_Firestore>;

    const snapshot = await collectionRef.get();

    return snapshot.docs.map((doc) => doc.ref);
};

interface AssociateWeb3LootboxPayload {
    address: Address;
    factory: Address;
    creatorAddress: Address;
    chainIdHex: ChainIDHex;
    variant: LootboxVariant_Firestore;
    chainIdDecimal: ChainIDDecimal;
    chainName: string;
    symbol: string;
    transactionHash: string;
    blockNumber: string;
    baseTokenURI: string;
    creationNonce: LootboxCreatedNonce;
}

export const associateWeb3Lootbox = async (
    lootboxID: LootboxID,
    payload: AssociateWeb3LootboxPayload
): Promise<Lootbox_Firestore> => {
    const lootboxRef = db.collection(Collection.Lootbox).doc(lootboxID) as DocumentReference<Lootbox_Firestore>;
    const timestampsFieldName: keyof Lootbox_Firestore = "timestamps";
    const deployedAtFieldName: keyof LootboxTimestamps = "deployedAt";
    const updateReq: Partial<Lootbox_Firestore> = {
        address: payload.address,
        factory: payload.factory,
        creatorAddress: payload.creatorAddress,
        chainIdHex: payload.chainIdHex,
        variant: payload.variant,
        chainIdDecimal: payload.chainIdDecimal,
        chainName: payload.chainName,
        symbol: payload.symbol,
        transactionHash: payload.transactionHash,
        blockNumber: payload.blockNumber,
        baseTokenURI: payload.baseTokenURI,
        creationNonce: payload.creationNonce,
        isContractDeployed: true,
        [`${timestampsFieldName}.${deployedAtFieldName}`]: Timestamp.now().toMillis(),
    };

    await lootboxRef.update(updateReq);

    const lootbox = await lootboxRef.get();
    return lootbox.data()!;
};

interface AssociateWeb3LootboxTournamentPayload {
    lootboxAddress: Address;
}

export const associateLootboxSnapshotsToWeb3 = async (
    lootboxID: LootboxID,
    payload: AssociateWeb3LootboxTournamentPayload
): Promise<void> => {
    const snapshotRefs = await getAllLootboxTournamentSnapshotRefs(lootboxID);

    const batch = db.batch();

    snapshotRefs.forEach((snapshotRef) => {
        batch.update(snapshotRef, { address: payload.lootboxAddress });
    });

    await batch.commit();

    return;
};
