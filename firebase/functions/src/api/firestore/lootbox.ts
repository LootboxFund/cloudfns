import {
    Address,
    ChainIDHex,
    ChainInfo,
    Claim_Firestore,
    Collection,
    LootboxID,
    LootboxMintSignatureNonce,
    LootboxMintWhitelistID,
    LootboxStatus_Firestore,
    LootboxTicketID,
    LootboxTicketID_Web3,
    LootboxTicket_Firestore,
    LootboxTournamentSnapshotID,
    LootboxTournamentSnapshot_Firestore,
    LootboxTournamentStatus_Firestore,
    LootboxVariant_Firestore,
    Lootbox_Firestore,
    MintWhitelistSignature_Firestore,
    TournamentID,
    UserID,
    LootboxTicketDigest,
    LootboxCreatedNonce,
    ClaimTimestamps_Firestore,
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
    nonce: LootboxCreatedNonce;
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
        creationNonce: payload.nonce,
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
    digest: LootboxTicketDigest;
    claim: Claim_Firestore;
}

/**
 * Creates whitelist signature database object
 * Updates claim if provided with whitelistId as DB transaction
 */
export const createMintWhitelistSignature = async ({
    signature,
    signer,
    whitelistedAddress,
    lootboxId,
    lootboxAddress,
    nonce,
    claim,
    digest,
}: CreateMintWhitelistSignatureRequest): Promise<MintWhitelistSignature_Firestore> => {
    const batch = db.batch();

    const signatureRef = db
        .collection(Collection.Lootbox)
        .doc(lootboxId)
        .collection(Collection.MintWhiteList)
        .doc() as DocumentReference<MintWhitelistSignature_Firestore>;

    const whitelistID: LootboxMintWhitelistID = signatureRef.id as LootboxMintWhitelistID;

    const signatureDocument: MintWhitelistSignature_Firestore = {
        id: whitelistID,
        isRedeemed: false,
        lootboxAddress,
        whitelistedAddress,
        signature,
        signer,
        nonce,
        digest,
        createdAt: Timestamp.now().toMillis(),
        updatedAt: Timestamp.now().toMillis(),
        deletedAt: null,
        lootboxTicketID: null,
        lootboxID: lootboxId,
        whitelistedAt: null,
        userID: claim?.claimerUserId ? claim.claimerUserId : null,
        claimID: claim.id,
        referralID: claim.referralId,
    };

    batch.set(signatureRef, signatureDocument);

    if (claim) {
        // Update the claim's whitelistId
        const claimRef = db
            .collection(Collection.Referral)
            .doc(claim.referralId)
            .collection(Collection.Claim)
            .doc(claim.id) as DocumentReference<Claim_Firestore>;

        // Annoying typesafety for nested objects
        const timestampName: keyof Claim_Firestore = "timestamps";
        const updatedAtName: keyof ClaimTimestamps_Firestore = "updatedAt";
        const whitelistedAtName: keyof ClaimTimestamps_Firestore = "whitelistedAt";
        const updateClaimRequest: Partial<Claim_Firestore> = {
            whitelistId: whitelistID,
            [`${timestampName}.${updatedAtName}`]: Timestamp.now().toMillis(),
            [`${timestampName}.${whitelistedAtName}`]: Timestamp.now().toMillis(),
        };

        batch.update(claimRef, updateClaimRequest);
    }

    await batch.commit();

    return signatureDocument;
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
