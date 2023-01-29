import {
    Address,
    ChainInfo,
    Lootbox_Firestore,
    TournamentID,
    UserID,
    LootboxID,
    LootboxTicketID_Web3,
    LootboxMintWhitelistID,
    LootboxTicketDigest,
    LootboxMintSignatureNonce,
    LootboxCreatedNonce,
    ChainIDHex,
    Collection,
    LootboxTournamentSnapshot_Firestore,
    LootboxSnapshotTimestamps,
    LootboxTimestamps,
    LootboxVariant_Firestore,
    LootboxTicketID,
    StampMetadata_Firestore,
    doesUserHaveLootboxEditPermission,
} from "@wormgraph/helpers";
import { logger } from "firebase-functions";
import { db } from "../../api/firebase";
import {
    finalizeMint,
    getAllLootboxTournamentSnapshotRefs,
    getLootbox,
    getLootboxByChainAddress,
    getTicketByDigest,
    getTicketByWeb3ID,
    getWhitelistByDigest,
    associateWeb3Lootbox,
    associateLootboxSnapshotsToWeb3,
    getTicketByID,
    finalizeMintV2,
} from "../../api/firestore/lootbox";
import {
    createInviteStamp,
    stampNewLootbox,
    stampNewLootboxSimpleTicket,
    stampNewTicket,
    stampNewVictoryTicket,
} from "../../api/stamp";
import { convertLootboxToTicketMetadata } from "../../lib/lootbox";
import { v4 as uuidV4 } from "uuid";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";

interface CreateLootboxRequest {
    // passed in variables
    creatorID: UserID;
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
export const createWeb3 = async (request: CreateLootboxRequest, chain: ChainInfo): Promise<void> => {
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
    if (!doesUserHaveLootboxEditPermission(lootbox, request.creatorID)) {
        logger.error("User does not own Lootbox", {
            lootboxID: request.lootboxID,
            callerID: request.creatorID,
            lootboxCreatorID: lootbox.creatorID,
        });
        throw new Error("Caller does not have permission");
    }

    logger.info("updating lootbox with web3 data", request);

    await associateWeb3Lootbox(lootbox.id, {
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

    return;
};

interface MintNewTicketCallbackRequest {
    /** If included - it uses an existing web2 ticketID - otherwise, it creates a new web2 ticket */
    ticketWeb2ID?: LootboxTicketID;
    lootboxAddress: Address;
    chainIDHex: string;
    minterUserID: UserID;
    ticketID: LootboxTicketID_Web3;
    minterAddress: Address;
    digest: LootboxTicketDigest;
    nonce: LootboxMintSignatureNonce;
}
export const mintNewTicketCallback = async (params: MintNewTicketCallbackRequest): Promise<void> => {
    const lootbox = await getLootboxByChainAddress(params.lootboxAddress, params.chainIDHex);

    if (!lootbox) {
        throw new Error("Lootbox not found");
    }

    if (!lootbox.address || !lootbox.chainIdHex) {
        throw new Error("Lootbox has not been deployed");
    }

    const [whitelistObject, existingTicketByDigest, existingTicketByID, existingWeb2Ticket] = await Promise.all([
        getWhitelistByDigest(lootbox.id, params.digest),
        getTicketByDigest(lootbox.id, params.digest),
        getTicketByWeb3ID(lootbox.id, params.ticketID),
        params.ticketWeb2ID ? getTicketByID(params.ticketWeb2ID) : null,
    ]);

    if (existingTicketByDigest || existingTicketByID) {
        throw new Error("Ticket already minted");
    }

    if (params.ticketWeb2ID) {
        // Validates new flow that updates existing web 2 ticket:

        if (!existingWeb2Ticket) {
            throw new Error("Ticket does not exist");
        } else if (
            existingWeb2Ticket.isMinted ||
            existingWeb2Ticket.nonce ||
            existingWeb2Ticket.ticketID ||
            existingWeb2Ticket.digest
        ) {
            throw new Error("Ticket already minted");
        } else if (existingWeb2Ticket.ownerUserID !== params.minterUserID) {
            throw new Error("Unauthorized");
        } else if (existingWeb2Ticket.lootboxID !== lootbox.id) {
            throw new Error("Invalid ticket");
        }
    }

    if (!whitelistObject) {
        throw new Error("Whitelisted document does not exist...");
    }

    // stamp the new ticket
    let stampURL: string;
    let metadataURL: string;

    try {
        if (lootbox.stampMetadata) {
            // NEW DESIGNS
            stampURL = await stampNewVictoryTicket({
                eventName: lootbox.stampMetadata?.eventName || "Lootbox Events",
                hostName: lootbox?.stampMetadata?.hostName ?? undefined,
                coverPhoto: lootbox.backgroundImage,
                sponsorLogos: lootbox?.stampMetadata?.logoURLs || [],
                teamName: lootbox.name,
                playerHeadshot: lootbox?.stampMetadata?.playerHeadshot ?? undefined,
                themeColor: lootbox.themeColor,
                ticketValue: lootbox.nftBountyValue ?? "Free Prizes",
                qrCodeLink: lootbox?.officialInviteLink || lootbox?.joinCommunityUrl || "https://lootbox.tickets",
            });
            metadataURL = "";
        } else {
            // OLD DESIGNS
            ({ stampURL, metadataURL } = await stampNewTicket({
                backgroundImage: lootbox.backgroundImage,
                logoImage: lootbox.logo,
                themeColor: lootbox.themeColor,
                name: lootbox.name,
                ticketID: params.ticketID,
                lootboxAddress: lootbox.address as Address,
                chainIdHex: lootbox.chainIdHex,
                metadata: convertLootboxToTicketMetadata(params.ticketID, lootbox),
                lootboxID: lootbox.id,
            }));
        }
    } catch (err) {
        logger.error("Error stamping ticket", err);
        stampURL = lootbox.stampImage;
        metadataURL = "";
    }

    if (existingWeb2Ticket) {
        await finalizeMintV2({
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
            ticketWeb2ID: existingWeb2Ticket.id,
        });
    } else {
        await finalizeMint({
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
    }

    return;
};

interface UpdateCallbackRequest {
    backgroundImage: string;
    logoImage: string;
    themeColor: string;
    name: string;
    lootboxAddress: Address | null;
    chainIdHex: ChainIDHex | null;
    description: string;
    stampMetadata?: StampMetadata_Firestore;
    referralURL: string;
    lootboxTicketValue: string;
}
export const updateCallback = async (lootboxID: LootboxID, request: UpdateCallbackRequest): Promise<void> => {
    // This has to update a bunch of potentially duplciated data...
    // - Lootbox tournament snapshots
    // - Lootbox tickets

    const lootboxTournamentSnaphotRefs = await getAllLootboxTournamentSnapshotRefs(lootboxID);

    let _stampImageUrl: string;
    let _stampInviteImageUrl: string | null;
    if (request.stampMetadata) {
        // Update invite and simple stamp
        [_stampImageUrl, _stampInviteImageUrl] = await Promise.all([
            stampNewLootboxSimpleTicket({
                coverPhoto: request.backgroundImage,
                sponsorLogos: request.stampMetadata.logoURLs ?? [],
                teamName: request.name,
                playerHeadshot: request.stampMetadata.playerHeadshot ?? undefined,
                themeColor: request.themeColor,
                eventName: request.stampMetadata.eventName ?? "Lootbox Events",
                hostName: request.stampMetadata.hostName ?? undefined,
            }),
            createInviteStamp({
                coverPhoto: request.backgroundImage,
                sponsorLogos: request.stampMetadata.logoURLs ?? [],
                teamName: request.name,
                playerHeadshot: request.stampMetadata.playerHeadshot ?? undefined,
                themeColor: request.themeColor,
                eventName: request.stampMetadata.eventName ?? "Lootbox Events",
                hostName: request.stampMetadata.hostName ?? undefined,
                qrCodeLink: request.referralURL,
                ticketValue: request.lootboxTicketValue,
            }),
        ]);
    } else {
        // OLD DESIGN
        // Restamp the lootbox
        _stampImageUrl = await stampNewLootbox({
            backgroundImage: request.backgroundImage,
            logoImage: request.logoImage,
            themeColor: request.themeColor,
            name: request.name,
            lootboxID: lootboxID,
            lootboxAddress: request.lootboxAddress || undefined,
            chainIdHex: request.chainIdHex || undefined,
        });
        _stampInviteImageUrl = null;
    }
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
        ...(_stampInviteImageUrl && {
            officialInviteGraphic: _stampInviteImageUrl,
            officialInviteLink: request.referralURL,
        }),
    };
    const snapshotTimestampFieldName: keyof LootboxTournamentSnapshot_Firestore = "timestamps";
    const snapshotUpdatedAtFieldName: keyof LootboxSnapshotTimestamps = "updatedAt";
    const updateLootboxTournamentSnapshotReq: Partial<LootboxTournamentSnapshot_Firestore> = {
        description: request.description,
        name: request.name,
        stampImage: newStampURL,
        ...(_stampInviteImageUrl && {
            officialInviteStampImage: _stampInviteImageUrl,
            officialInviteURL: request.referralURL,
        }),
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

export const onDeployed = async (lootbox: Lootbox_Firestore): Promise<void> => {
    if (!lootbox.address || !lootbox.id) {
        return;
    }

    try {
        // We also need to update all lootboxTOurnamentSnapshots
        await associateLootboxSnapshotsToWeb3(lootbox.id, {
            lootboxAddress: lootbox.address,
        });
    } catch (err) {
        logger.error("Error onDeployed updating LootboxSnapshots", err);
    }
};

// interface OnDepositRequest {
//     erc20Amount: string;
//     nativeAmount: string;
//     erc20Address: Address;
//     transactionHash: string;
//     blockNumber: number;
//     depositerAddress: Address;
//     depositerID: UserID;
//     lootboxAddress: Address;
//     chainIDHex: ChainIDHex;
//     depositID: DepositID_Web3;
//     maxTicketSnapshot: number;
// }
// export const onDeposit = async (params: OnDepositRequest): Promise<Deposit_Firestore> => {
//     const lootbox = await getLootboxByChainAddress(params.lootboxAddress, params.chainIDHex);

//     if (!lootbox) {
//         throw new Error("Lootbox not found");
//     }

//     const _deposit = await getLootboxDeposit_Deprecated(lootbox.id, params.depositID);
//     if (_deposit) {
//         logger.error("Deposit already created", { depositID: params.depositID, deposit: _deposit });
//         throw new Error("Deposit already exists");
//     }

//     const deposit = await createDeposit_Deprecated({
//         lootboxID: lootbox.id,
//         erc20Amount: params.erc20Amount,
//         nativeAmount: params.nativeAmount,
//         transactionHash: params.transactionHash,
//         blockNumber: params.blockNumber,
//         depositerAddress: params.depositerAddress,
//         depositerID: params.depositerID,
//         lootboxAddress: params.lootboxAddress,
//         chainIDHex: params.chainIDHex,
//         erc20Address: params.erc20Address,
//         depositID: params.depositID,
//         maxTicketSnapshot: params.maxTicketSnapshot,
//     });

//     return deposit;
// };
