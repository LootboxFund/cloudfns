import { Address, ChainInfo, ContractAddress, Lootbox_Firestore, UserID } from "@wormgraph/helpers";
import { logger } from "firebase-functions";
import { createLootbox } from "../api/firestore/lootbox";
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

    // implicitly passed in
    creatorID: UserID;

    // from decoded event log
    lootboxAddress: Address;

    // from blockchain
    blockNumber: string;
    lootboxName: string;
    transactionHash: string;
}

export const create = async (request: CreateLootboxRequest, chain: ChainInfo): Promise<Lootbox_Firestore> => {
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

    // TODO - write tournament snapshot subcollection if included
    logger.warn("TOURNAMENT SNAPSHOT NOT IMPLEMENTED!!!!!!");
    // if (request.tournamentID) {
    //     await createTournamentSnapshot({ tournamentID: request.tournamentID, lootboxID: createdLootbox.id });
    // }

    return createdLootbox;
};
