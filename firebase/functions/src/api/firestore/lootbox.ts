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
    TournamentID,
    LootboxSnapshotTimestamps,
    LootboxTournamentSnapshotID,
    LootboxTournamentStatus_Firestore,
    LootboxType,
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
interface CreateLootboxTournamentSnapshot {
    tournamentID: TournamentID;
    lootboxAddress: Address | null;
    lootboxID: LootboxID;
    creatorID: UserID;
    lootboxCreatorID: UserID;
    description: string;
    name: string;
    stampImage: string;
    type?: LootboxType;
    inviteStampImage?: string;
    inviteLinkURL?: string;
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
        address: payload.lootboxAddress || null,
        lootboxID: payload.lootboxID,
        creatorID: payload.creatorID,
        lootboxCreatorID: payload.lootboxCreatorID,
        description: payload.description,
        name: payload.name,
        stampImage: payload.stampImage,
        impressionPriority: 0,
        status: LootboxTournamentStatus_Firestore.active,
        ...(payload.inviteStampImage && { officialInviteStampImage: payload.inviteStampImage }),
        ...(payload.inviteLinkURL && { officialInviteURL: payload.inviteLinkURL }),
        timestamps: {
            createdAt: Timestamp.now().toMillis(),
            updatedAt: Timestamp.now().toMillis(),
            deletedAt: null,
            depositEmailSentAt: null,
        },
    };
    if (payload.type) {
        request.type = payload.type;
    }

    await doc.set(request);

    return request;
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
    /** New flow: use this to update an existing ticket */
    ticketWeb2ID?: LootboxTicketID;
}

/** @deprecated use finalizeMintV2 */
export const finalizeMint = async (payload: CreateTicketRequest): Promise<void> => {
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
        isMinted: true,
        mintedAt: Timestamp.now().toMillis(),
    };

    const whitelistRef = db
        .collection(Collection.Lootbox)
        .doc(payload.lootboxID)
        .collection(Collection.MintWhiteList)
        .doc(payload.mintWhitelistID) as DocumentReference<MintWhitelistSignature_Firestore>;

    const whitelistUpdateReq: Partial<MintWhitelistSignature_Firestore> = {
        isRedeemed: true,
        lootboxTicketID: ticketRef.id as LootboxTicketID,
        redeemedAt: Timestamp.now().toMillis(),
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

    return;
};

interface FinalizeMintV2Request {
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
    /** New flow: use this to update an existing ticket */
    ticketWeb2ID: LootboxTicketID;
}

export const finalizeMintV2 = async (payload: FinalizeMintV2Request): Promise<void> => {
    // - updates mintWhitelist.redeemed = true
    // - updates LootboxTicket_Firestore
    // - updates mintwhitelist document
    const batch = db.batch();

    const ticketRef = db
        .collection(Collection.Lootbox)
        .doc(payload.lootboxID)
        .collection(Collection.LootboxTicket)
        .doc(payload.ticketWeb2ID) as DocumentReference<LootboxTicket_Firestore>;

    const updateTicketDocument: Partial<LootboxTicket_Firestore> = {
        lootboxAddress: payload.lootboxAddress,
        ticketID: payload.ticketID,
        minterAddress: payload.minterAddress,
        mintWhitelistID: payload.mintWhitelistID,
        updatedAt: Timestamp.now().toMillis(),
        stampImage: payload.stampImage,
        metadataURL: payload.metadataURL,
        minterUserID: payload.minterUserID,
        digest: payload.digest,
        nonce: payload.nonce,
        isMinted: true,
        mintedAt: Timestamp.now().toMillis(),
    };

    const whitelistRef = db
        .collection(Collection.Lootbox)
        .doc(payload.lootboxID)
        .collection(Collection.MintWhiteList)
        .doc(payload.mintWhitelistID) as DocumentReference<MintWhitelistSignature_Firestore>;

    const whitelistUpdateReq: Partial<MintWhitelistSignature_Firestore> = {
        isRedeemed: true,
        lootboxTicketID: ticketRef.id as LootboxTicketID,
        redeemedAt: Timestamp.now().toMillis(),
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
        ticketWeb3ID: payload.ticketID,
        [`${timestampName}.${updatedAtName}`]: Timestamp.now().toMillis(),
        [`${timestampName}.${mintedAtName}`]: Timestamp.now().toMillis(),
    };

    batch.update(ticketRef, updateTicketDocument);
    batch.update(whitelistRef, whitelistUpdateReq);
    batch.update(claimRef, claimUpdateReq);

    await batch.commit();

    return;
};

export const getTicketByID = async (ticketID: LootboxTicketID): Promise<LootboxTicket_Firestore | undefined> => {
    const idFieldName: keyof LootboxTicket_Firestore = "id";
    const collectionRef = db
        .collectionGroup(Collection.LootboxTicket)
        .where(idFieldName, "==", ticketID)
        .limit(1) as Query<LootboxTicket_Firestore>;

    const query = await collectionRef.get();

    if (query.empty) {
        return undefined;
    }

    const doc = query.docs[0];
    return doc.data();
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
): Promise<void> => {
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

    return;
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

// export const createDeposit_Deprecated = async (request: {
//     depositerAddress: Address;
//     depositerID: UserID;
//     lootboxID: LootboxID;
//     lootboxAddress: Address;
//     erc20Amount: string;
//     nativeAmount: string;
//     transactionHash: string;
//     blockNumber: number;
//     chainIDHex: ChainIDHex;
//     depositID: DepositID_Web3;
//     erc20Address: Address;
//     maxTicketSnapshot: number;
// }): Promise<Deposit_Firestore> => {
//     const depositRef = db.collection(Collection.Deposit).doc() as DocumentReference<Deposit_Firestore>;

//     const deposit: Deposit_Firestore = {
//         id: depositRef.id as DepositID,
//         depositID: request.depositID,
//         createdAt: Timestamp.now().toMillis(),
//         updatedAt: Timestamp.now().toMillis(),
//         depositerAddress: request.depositerAddress,
//         depositerID: request.depositerID,
//         lootboxID: request.lootboxID,
//         lootboxAddress: request.lootboxAddress,
//         erc20Amount: request.erc20Amount,
//         nativeAmount: request.nativeAmount,
//         transactionHash: request.transactionHash,
//         blockNumber: request.blockNumber,
//         chainIDHex: request.chainIDHex,
//         erc20Address: request.erc20Address,
//         maxTicketSnapshot: request.maxTicketSnapshot,
//     };

//     await depositRef.set(deposit);

//     return deposit;
// };

// export const getLootboxDeposit_Deprecated = async (
//     lootboxID: LootboxID,
//     depositID: DepositID_Web3
// ): Promise<Deposit_Firestore | undefined> => {
//     const depositIDFieldName: keyof Deposit_Firestore = "depositID";
//     const depositRef = db
//         .collection(Collection.Lootbox)
//         .doc(lootboxID)
//         .collection(Collection.Deposit)
//         .where(depositIDFieldName, "==", depositID)
//         .limit(1) as Query<Deposit_Firestore>;

//     const depositSnapshot = await depositRef.get();

//     if (depositSnapshot.empty) {
//         return undefined;
//     }

//     return depositSnapshot.docs[0].data();
// };

export const getLootboxTournamentSnapshot = async (
    lootboxID: LootboxID,
    tournamentID: TournamentID
): Promise<LootboxTournamentSnapshot_Firestore | undefined> => {
    const lootboxIDFieldName: keyof LootboxTournamentSnapshot_Firestore = "lootboxID";
    const snapshotRef = db
        .collection(Collection.Tournament)
        .doc(tournamentID)
        .collection(Collection.LootboxTournamentSnapshot)
        .where(lootboxIDFieldName, "==", lootboxID)
        .limit(1) as Query<LootboxTournamentSnapshot_Firestore>;

    const snapshot = await snapshotRef.get();

    if (snapshot.empty) {
        return undefined;
    }

    return snapshot.docs[0]?.data();
};

export const markDepositEmailAsSent = async (lootboxID: LootboxID, tournamentID: TournamentID): Promise<void> => {
    const lootboxIDFieldName: keyof LootboxTournamentSnapshot_Firestore = "lootboxID";
    const snapshotQuery = db
        .collection(Collection.Tournament)
        .doc(tournamentID)
        .collection(Collection.LootboxTournamentSnapshot)
        .where(lootboxIDFieldName, "==", lootboxID)
        .limit(1) as Query<LootboxTournamentSnapshot_Firestore>;

    const snapshot = await snapshotQuery.get();
    const lootboxSnapshotRef = snapshot?.docs[0]?.ref as DocumentReference<LootboxTournamentSnapshot_Firestore>;
    if (!lootboxSnapshotRef) {
        throw new Error("Lootbox Snapshot Not Found");
    }

    const timestampFieldName: keyof LootboxTournamentSnapshot_Firestore = "timestamps";
    const depositEmailSentAtFieldName: keyof LootboxSnapshotTimestamps = "depositEmailSentAt";

    const updateRequest: Partial<LootboxTournamentSnapshot_Firestore> = {
        [`${timestampFieldName}.${depositEmailSentAtFieldName}`]: Timestamp.now().toMillis(),
    };
    lootboxSnapshotRef.update(updateRequest);

    return;
};

export const associateInviteDataToLootbox = async (
    lootboxID: LootboxID,
    payload: {
        inviteGraphic?: string;
        inviteLink?: string;
    }
) => {
    if (!payload.inviteGraphic || !payload.inviteLink) {
        return;
    }

    const lootboxRef = db.collection(Collection.Lootbox).doc(lootboxID) as DocumentReference<Lootbox_Firestore>;
    const updateReq: Partial<Lootbox_Firestore> = {
        ...(payload.inviteGraphic && { officialInviteGraphic: payload.inviteGraphic }),
        ...(payload.inviteLink && { officialInviteLink: payload.inviteLink }),
    };

    await lootboxRef.update(updateReq);

    return;
};
