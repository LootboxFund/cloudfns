import { Address, ChainInfo, ContractAddress, Lootbox_Firestore, TournamentID, UserID } from "@wormgraph/helpers";
import { logger } from "firebase-functions";
import { createLootbox, createLootboxTournamentSnapshot, getLootboxByChainAddress } from "../api/firestore/lootbox";
import { getTournamentByID } from "../api/firestore/tournament";
import { stampNewLootbox } from "../api/stamp";

interface CreateLootboxRequest {
    // passed in variables
    factory: Address;
    creatorAddress: Address;
    lootboxDescription: string;
    backgroundImage: string;
    logoImage: string;
    themeColor: string;
    nftBountyValue: string;
    maxTickets: number;
    joinCommunityUrl?: string;
    baseTokenURI: string;
    symbol: string;

    // implicitly passed in
    creatorID: UserID;

    // from decoded event log
    lootboxAddress: Address;

    // from blockchain
    blockNumber: string;
    lootboxName: string;
    transactionHash: string;

    tournamentID?: TournamentID;
}

export const create = async (request: CreateLootboxRequest, chain: ChainInfo): Promise<Lootbox_Firestore> => {
    // make sure lootbox not created yet
    const _lootbox = await getLootboxByChainAddress(request.lootboxAddress, chain.chainIdHex);
    if (_lootbox) {
        logger.warn("Lootbox already created", { lootbox: request.lootboxAddress });
        throw new Error("Lootbox already created");
    }

    logger.info("creating lootbox", request);
    // stamp lootbox image
    const stampImageUrl = await stampNewLootbox({
        backgroundImage: request.backgroundImage,
        logoImage: request.logoImage,
        themeColor: request.themeColor,
        name: request.lootboxName,
        ticketID: "0x",
        lootboxAddress: request.lootboxAddress as unknown as ContractAddress,
        chainIdHex: chain.chainIdHex,
        numShares: "1000",
    });

    const createdLootbox = await createLootbox(
        {
            baseTokenURI: request.baseTokenURI,
            address: request.lootboxAddress,
            factory: request.factory,
            creatorID: request.creatorID,
            creatorAddress: request.creatorAddress,
            transactionHash: request.transactionHash,
            blockNumber: request.blockNumber,
            stampImage: stampImageUrl,
            logo: request.logoImage,
            symbol: request.symbol,
            name: request.lootboxName,
            description: request.lootboxDescription,
            nftBountyValue: request.nftBountyValue,
            maxTickets: request.maxTickets,
            backgroundImage: request.backgroundImage,
            themeColor: request.themeColor,
            joinCommunityUrl: request.joinCommunityUrl,
        },
        chain
    );

    if (request.tournamentID) {
        logger.info("Checking to add tournament snapshot", {
            tournamentID: request.tournamentID,
            lootboxID: createdLootbox.id,
        });
        // Make sure tournament exists
        const tournament = await getTournamentByID(request.tournamentID);
        if (tournament != null) {
            logger.info("creating tournament snapshot", {
                tournamentID: request.tournamentID,
                lootboxID: createdLootbox.id,
            });
            await createLootboxTournamentSnapshot({
                tournamentID: request.tournamentID,
                lootboxID: createdLootbox.id,
                lootboxAddress: createdLootbox.address,
                creatorID: request.creatorID,
                lootboxCreatorID: createdLootbox.creatorID,
                description: createdLootbox.description,
                name: createdLootbox.name,
                stampImage: createdLootbox.stampImage,
            });
        }
    }

    return createdLootbox;
};
