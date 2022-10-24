import {
    Address,
    ChainInfo,
    Lootbox_Firestore,
    TournamentID,
    UserID,
    MintWhitelistSignature_Firestore,
    LootboxID,
    Claim_Firestore,
    LootboxTicketID_Web3,
    LootboxMintWhitelistID,
    ClaimID,
    LootboxTicket_Firestore,
    LootboxTicketDigest,
    LootboxMintSignatureNonce,
    LootboxCreatedNonce,
    ChainIDHex,
    Collection,
    LootboxTournamentSnapshot_Firestore,
    LootboxSnapshotTimestamps,
    LootboxTimestamps,
    LootboxVariant_Firestore,
} from "@wormgraph/helpers";
import { ethers } from "ethers";
import { logger } from "firebase-functions";
import { db } from "../api/firebase";
import {
    createMintWhitelistSignature,
    finalizeMint,
    getAllLootboxTournamentSnapshotRefs,
    getLootbox,
    getLootboxByChainAddress,
    getTicketByDigest,
    getTicketByWeb3ID,
    getWhitelistByDigest,
    associateWeb3Lootbox,
} from "../api/firestore/lootbox";
import { stampNewLootbox, stampNewTicket } from "../api/stamp";
import { generateNonce, generateTicketDigest, whitelistLootboxMintSignature } from "../lib/ethers";
import { convertLootboxToTicketMetadata } from "../lib/lootbox";
import { v4 as uuidV4 } from "uuid";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";

interface CreateLootboxRequest {
    // passed in variables
    lootboxID: LootboxID;
    factory: Address;
    creatorAddress: Address;
    baseTokenURI: string;
    symbol: string;
    // from decoded event log
    lootboxAddress: Address;
    creationNonce: LootboxCreatedNonce;
    // from blockchain
    blockNumber: string;
    lootboxName: string;
    transactionHash: string;

    tournamentID?: TournamentID;
}

// This associates the web3 aspects of a lootbox to Lootbox_Firestore
// NOTE: The Lootbox_Firestore already exists.
export const createWeb3 = async (request: CreateLootboxRequest, chain: ChainInfo): Promise<Lootbox_Firestore> => {
    // Make sure the lootbox dosen't already exist via the web3 look up
    const [lootbox, _lootbox] = await Promise.all([
        getLootbox(request.lootboxID),
        getLootboxByChainAddress(request.lootboxAddress, chain.chainIdHex),
    ]);
    if (!lootbox) {
        logger.error("Web2 Lootbox not found", {
            lootboxAddress: request.lootboxAddress,
            lootboxID: request.lootboxID,
        });
        throw new Error("Lootbox not found");
    }
    if (_lootbox || lootbox?.address != null) {
        logger.error("Lootbox already has web3 association", {
            lootboxAddress: request.lootboxAddress,
            lootboxID: request.lootboxID,
        });
        throw new Error("Lootbox already created");
    }

    logger.info("updating lootbox with web3 data", request);

    const updatedLootbox = await associateWeb3Lootbox(lootbox.id, {
        address: request.lootboxAddress,
        factory: request.factory,
        creatorAddress: request.creatorAddress,
        chainIdHex: chain.chainIdHex,
        variant: LootboxVariant_Firestore.cosmic,
        chainIdDecimal: chain.chainIdDecimal,
        chainName: chain.chainName,
        symbol: request.symbol,
        transactionHash: request.transactionHash,
        blockNumber: request.blockNumber,
        baseTokenURI: request.baseTokenURI,
        creationNonce: request.creationNonce,
    });

    return updatedLootbox;
};

export const whitelist = async (
    whitelistAddress: Address,
    lootbox: Lootbox_Firestore,
    claim: Claim_Firestore
): Promise<MintWhitelistSignature_Firestore> => {
    logger.info("Whitelisting user", { whitelistAddress, lootbox: lootbox.id });

    if (!lootbox.address || !lootbox.chainIdHex) {
        throw new Error("Lootbox has not been deployed");
    }
    if (!ethers.utils.isAddress(whitelistAddress)) {
        throw new Error("Invalid Address");
    }
    if (!lootbox) {
        throw new Error("Lootbox not found");
    }

    const nonce = generateNonce();
    const _whitelisterPrivateKey = process.env.PARTY_BASKET_WHITELISTER_PRIVATE_KEY || "";
    const signer = new ethers.Wallet(_whitelisterPrivateKey);
    const digest = generateTicketDigest({
        minterAddress: whitelistAddress,
        lootboxAddress: lootbox.address,
        nonce,
        chainIDHex: lootbox.chainIdHex,
    });

    // Make sure whitelist with the provided digest does not already exist
    const existingWhitelist = await getWhitelistByDigest(lootbox.id, digest);

    if (existingWhitelist) {
        throw new Error("Whitelist already exists!");
    }

    logger.info("generating whitelist", {
        whitelistAddress,
        lootbox: lootbox.id,
        signerAddress: signer.address,
        digest,
    });
    const signature = await whitelistLootboxMintSignature(
        lootbox.chainIdHex,
        lootbox.address,
        whitelistAddress,
        _whitelisterPrivateKey,
        nonce
    );

    logger.info("Adding the signature to DB", {
        whitelistAddress,
        lootbox: lootbox.id,
        signerAddress: signer.address,
        digest: digest,
    });
    const signatureDB = await createMintWhitelistSignature({
        signature,
        signer: signer.address as Address,
        whitelistedAddress: whitelistAddress as Address,
        lootboxId: lootbox.id as LootboxID,
        lootboxAddress: lootbox.address as Address,
        nonce,
        claim,
        digest,
    });

    return signatureDB;
};

interface MintNewTicketCallbackRequest {
    lootboxAddress: Address;
    chainIDHex: string;
    minterUserID: UserID;
    ticketID: LootboxTicketID_Web3;
    minterAddress: Address;
    digest: LootboxTicketDigest;
    nonce: LootboxMintSignatureNonce;
    claimID?: ClaimID;
}
export const mintNewTicketCallback = async (params: MintNewTicketCallbackRequest): Promise<LootboxTicket_Firestore> => {
    // const lootbox = await getLootbox(params.lootboxID);
    const lootbox = await getLootboxByChainAddress(params.lootboxAddress, params.chainIDHex);

    if (!lootbox) {
        throw new Error("Lootbox not found");
    }

    if (!lootbox.address || !lootbox.chainIdHex) {
        throw new Error("Lootbox has not been deployed");
    }

    const [whitelistObject, existingTicketByDigest, existingTicketByID] = await Promise.all([
        getWhitelistByDigest(lootbox.id, params.digest),
        getTicketByDigest(lootbox.id, params.digest),
        getTicketByWeb3ID(lootbox.id, params.ticketID),
    ]);

    if (existingTicketByDigest || existingTicketByID) {
        throw new Error("Ticket already minted");
    }

    if (!whitelistObject) {
        throw new Error("Whitelisted document does not exist...");
    }

    // stamp the new ticket
    const { stampURL, metadataURL } = await stampNewTicket({
        backgroundImage: lootbox.backgroundImage,
        logoImage: lootbox.logo,
        themeColor: lootbox.themeColor,
        name: lootbox.name,
        ticketID: params.ticketID,
        lootboxAddress: lootbox.address as Address,
        chainIdHex: lootbox.chainIdHex,
        metadata: convertLootboxToTicketMetadata(params.ticketID, lootbox),
        lootboxID: lootbox.id,
    });

    const ticketDB = await finalizeMint({
        minterUserID: params.minterUserID,
        lootboxID: lootbox.id as LootboxID,
        lootboxAddress: lootbox.address as Address,
        ticketID: params.ticketID as LootboxTicketID_Web3,
        minterAddress: params.minterAddress as Address,
        mintWhitelistID: whitelistObject.id as LootboxMintWhitelistID,
        stampImage: stampURL,
        metadataURL: metadataURL,
        digest: params.digest,
        nonce: params.nonce,
        whitelist: whitelistObject,
    });

    return ticketDB;
};

interface UpdateCallbackRequest {
    backgroundImage: string;
    logoImage: string;
    themeColor: string;
    name: string;
    lootboxAddress: Address | null;
    chainIdHex: ChainIDHex | null;
    description: string;
}
export const updateCallback = async (lootboxID: LootboxID, request: UpdateCallbackRequest): Promise<void> => {
    // This has to update a bunch of potentially duplciated data...
    // - Lootbox tournament snapshots
    // - Lootbox tickets

    const lootboxTournamentSnaphotRefs = await getAllLootboxTournamentSnapshotRefs(lootboxID);

    // Restamp the lootbox
    const _stampImageUrl = await stampNewLootbox({
        backgroundImage: request.backgroundImage,
        logoImage: request.logoImage,
        themeColor: request.themeColor,
        name: request.name,
        lootboxID: lootboxID,
        lootboxAddress: request.lootboxAddress || undefined,
        chainIdHex: request.chainIdHex || undefined,
    });
    // Ghetto cache bust:
    const nonce = uuidV4();
    const url = new URL(_stampImageUrl);
    url.searchParams.append("n", nonce);
    const newStampURL = url.href;

    const batch = db.batch();
    const lootboxRef = db.collection(Collection.Lootbox).doc(lootboxID) as DocumentReference<Lootbox_Firestore>;
    const lootboxTimestampFieldName: keyof Lootbox_Firestore = "timestamps";
    const lootboxUpdatedAtFieldName: keyof LootboxTimestamps = "updatedAt";
    const lootboxUpdateReq: Partial<Lootbox_Firestore> = {
        stampImage: newStampURL,
        [`${lootboxTimestampFieldName}.${lootboxUpdatedAtFieldName}`]: Timestamp.now().toMillis(),
    };
    const snapshotTimestampFieldName: keyof LootboxTournamentSnapshot_Firestore = "timestamps";
    const snapshotUpdatedAtFieldName: keyof LootboxSnapshotTimestamps = "updatedAt";
    const updateLootboxTournamentSnapshotReq: Partial<LootboxTournamentSnapshot_Firestore> = {
        description: request.description,
        name: request.name,
        stampImage: newStampURL,
        [`${snapshotTimestampFieldName}.${snapshotUpdatedAtFieldName}`]: Timestamp.now().toMillis(),
    };
    batch.update(lootboxRef, lootboxUpdateReq);
    for (const ref of lootboxTournamentSnaphotRefs) {
        batch.update(ref, updateLootboxTournamentSnapshotReq);
    }
    await batch.commit();

    // // TODO Now we have to do the same for all of the NFT stamp images ... :( Note: Firestore has a 500 document limit for batch.commit, so we will have to batch this if needed
    // const lootboxTicketRefs = await getAllLootboxTicketRefs(lootboxID);
    // const lootboxTicketBatch = db.batch()
};

// export const create = async (request: CreateLootboxRequest, chain: ChainInfo): Promise<Lootbox_Firestore> => {
//     // make sure lootbox not created yet
//     const _lootbox = await getLootboxByChainAddress(request.lootboxAddress, chain.chainIdHex);
//     if (_lootbox) {
//         logger.warn("Lootbox already created", { lootbox: request.lootboxAddress });
//         throw new Error("Lootbox already created");
//     }

//     logger.info("creating lootbox", request);
//     // stamp lootbox image
//     const stampImageUrl = await stampNewLootbox({
//         backgroundImage: request.backgroundImage,
//         logoImage: request.logoImage,
//         themeColor: request.themeColor,
//         name: request.lootboxName,
//         lootboxAddress: request.lootboxAddress as unknown as ContractAddress,
//         chainIdHex: chain.chainIdHex,
//     });

//     const createdLootbox = await createLootbox(
//         {
//             baseTokenURI: request.baseTokenURI,
//             address: request.lootboxAddress,
//             factory: request.factory,
//             creatorID: request.creatorID,
//             creatorAddress: request.creatorAddress,
//             transactionHash: request.transactionHash,
//             blockNumber: request.blockNumber,
//             stampImage: stampImageUrl,
//             logo: request.logoImage,
//             symbol: request.symbol,
//             name: request.lootboxName,
//             description: request.lootboxDescription,
//             nftBountyValue: request.nftBountyValue,
//             maxTickets: request.maxTickets,
//             backgroundImage: request.backgroundImage,
//             themeColor: request.themeColor,
//             joinCommunityUrl: request.joinCommunityUrl,
//             nonce: request.creationNonce,
//         },
//         chain
//     );

//     if (request.tournamentID) {
//         logger.info("Checking to add tournament snapshot", {
//             tournamentID: request.tournamentID,
//             lootboxID: createdLootbox.id,
//         });
//         // Make sure tournament exists
//         const tournament = await getTournamentByID(request.tournamentID);
//         if (tournament != null) {
//             logger.info("creating tournament snapshot", {
//                 tournamentID: request.tournamentID,
//                 lootboxID: createdLootbox.id,
//             });
//             await createLootboxTournamentSnapshot({
//                 tournamentID: request.tournamentID,
//                 lootboxID: createdLootbox.id,
//                 lootboxAddress: createdLootbox.address,
//                 creatorID: request.creatorID,
//                 lootboxCreatorID: createdLootbox.creatorID,
//                 description: createdLootbox.description,
//                 name: createdLootbox.name,
//                 stampImage: createdLootbox.stampImage,
//             });
//         }
//     }

//     return createdLootbox;
// };
