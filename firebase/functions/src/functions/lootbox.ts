import { ethers } from "ethers";
import * as functions from "firebase-functions";
import { logger } from "firebase-functions";
import {
    Address,
    BLOCKCHAINS,
    chainIdHexToSlug,
    UserID,
    ChainInfo,
    LootboxCreatedNonce,
    EnqueueLootboxOnCreateCallableRequest,
    LootboxID,
    LootboxTicketID_Web3,
    LootboxTicketDigest,
    LootboxMintSignatureNonce,
    EnqueueLootboxOnMintCallableRequest,
    // DepositID_Web3,
    // EnqueueLootboxOnDepositCallableRequest,
    LootboxStatus_Firestore,
    Collection,
    Lootbox_Firestore,
} from "@wormgraph/helpers";
import LootboxCosmicFactoryABI from "@wormgraph/helpers/lib/abi/LootboxCosmicFactory.json";
import LootboxCosmicABI from "@wormgraph/helpers/lib/abi/LootboxCosmic.json";
import { db, fun } from "../api/firebase";
import { manifest, SecretName } from "../manifest";
import * as lootboxService from "../service/lootbox";

const REGION = manifest.cloudFunctions.region;
const stampSecretName: SecretName = "STAMP_SECRET";
type taskQueueID = "indexLootboxOnCreate" | "indexLootboxOnMint"; //  | "indexLootboxOnDeposit";
const buildTaskQueuePath = (taskQueueID: taskQueueID) => `locations/${REGION}/functions/${taskQueueID}`;

interface IndexLootboxOnCreateTaskRequest {
    chain: ChainInfo;
    payload: {
        creatorID: UserID;
        factory: Address;
        symbol: string;
        nonce: LootboxCreatedNonce;
        lootboxID: LootboxID;
    };
    filter: {
        fromBlock: number;
    };
}

export const indexLootboxOnCreate = functions
    .region(REGION)
    .runWith({
        timeoutSeconds: 540,
        failurePolicy: true,
        // secrets: [stampSecretName],
    })
    .tasks.taskQueue({
        retryConfig: {
            maxAttempts: 5,
            /**
             * The maximum number of times to double the backoff between
             * retries. If left unspecified will default to 16.
             */
            maxDoublings: 1,
            /**
             * The minimum time to wait between attempts. If left unspecified
             * will default to 100ms.
             */
            minBackoffSeconds: 60 * 5 /* 5 minutes */,
        },
    })
    .onDispatch(async (data: IndexLootboxOnCreateTaskRequest) => {
        logger.info("indexLootboxOnCreate", { data });
        // Any errors thrown or timeouts will trigger a retry

        // Start a listener to listen for the event
        const provider = new ethers.providers.JsonRpcProvider(data.chain.rpcUrls[0]);
        const lootboxFactory = new ethers.Contract(data.payload.factory, LootboxCosmicFactoryABI, provider);

        // eslint-disable-next-line
        const lootboxEventFilter = lootboxFactory.filters.LootboxCreated(
            null,
            null,
            null,
            null,
            null,
            null,
            data.payload.nonce
        );

        let events: ethers.Event[] = [];
        try {
            events = await lootboxFactory.queryFilter(lootboxEventFilter, data.filter.fromBlock);
        } catch (err) {
            logger.error("Error querying retrospective event filter", err);
        }

        if (events.length > 0) {
            logger.info("Found event in past", { events });
            // Index it then return
            for (const event of events) {
                if (!event.args) {
                    continue;
                }

                const [lootboxName, lootboxAddress, issuerAddress, maxTickets, baseTokenURI, lootboxID, nonce] =
                    event.args as [string, Address, Address, ethers.BigNumber, string, string, { hash: string }];

                if (
                    lootboxName === undefined ||
                    lootboxAddress === undefined ||
                    issuerAddress === undefined ||
                    maxTickets === undefined ||
                    baseTokenURI === undefined ||
                    lootboxID === undefined ||
                    nonce === undefined ||
                    event === undefined
                ) {
                    continue;
                }

                // Make sure its the right event
                if (lootboxID !== data.payload.lootboxID) {
                    logger.info("Event LootboxID does not match", {
                        lootboxID,
                        expectedLootboxID: data.payload.lootboxID,
                        event,
                    });
                    continue;
                }
                const testNonce = data.payload.nonce;
                const hashedTestNonce = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testNonce));
                if (nonce.hash !== hashedTestNonce) {
                    logger.info("Event Nonce does not match", {
                        nonceHash: nonce.hash,
                        expectedNonce: testNonce,
                        expectedNonceHash: hashedTestNonce,
                        event,
                    });
                    continue;
                }

                try {
                    // Associates the Web3 data to Lootbox
                    await lootboxService.createWeb3(
                        {
                            creatorID: data.payload.creatorID,
                            lootboxID: data.payload.lootboxID,
                            factory: data.payload.factory,
                            lootboxAddress,
                            blockNumber: `${event.blockNumber}`,
                            lootboxName,
                            transactionHash: event.transactionHash,
                            creatorAddress: issuerAddress,
                            baseTokenURI: baseTokenURI,
                            symbol: data.payload.symbol, // Todo move this to onchain event
                            creationNonce: data.payload.nonce,
                        },
                        data.chain
                    );
                    return;
                } catch (err) {
                    logger.error("Error creating lootbox", err);
                }
            }
        }

        await new Promise((res) => {
            // This is the event listener
            lootboxFactory.on(
                lootboxEventFilter,
                async (
                    lootboxName: string,
                    lootboxAddress: Address,
                    issuerAddress: Address,
                    maxTickets: ethers.BigNumber,
                    baseTokenURI: string,
                    lootboxID: string,
                    // TODO: correct typing on these paramaters, maybe typechain?
                    nonce: { hash: string },
                    event: ethers.Event
                ) => {
                    logger.debug("Got log", {
                        lootboxName,
                        lootboxAddress,
                        issuerAddress,
                        maxTickets,
                        baseTokenURI,
                        nonce,
                        lootboxID,
                        maxTicketsParsed: maxTickets.toNumber(),
                        event,
                    });

                    if (
                        lootboxName === undefined ||
                        lootboxAddress === undefined ||
                        issuerAddress === undefined ||
                        maxTickets === undefined ||
                        baseTokenURI === undefined ||
                        lootboxID === undefined ||
                        nonce === undefined ||
                        event === undefined
                    ) {
                        return;
                    }

                    // Make sure its the right event
                    if (lootboxID !== data.payload.lootboxID) {
                        logger.info("LootboxID does not match", {
                            lootboxID,
                            expectedLootboxID: data.payload.lootboxID,
                        });
                        return;
                    }
                    const testNonce = data.payload.nonce;
                    const hashedTestNonce = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testNonce));
                    if (nonce.hash !== hashedTestNonce) {
                        logger.info("Nonce does not match", {
                            nonceHash: nonce.hash,
                            expectedNonce: testNonce,
                            expectedNonceHash: hashedTestNonce,
                        });
                        return;
                    }

                    try {
                        // Associates the Web3 data to Lootbox
                        await lootboxService.createWeb3(
                            {
                                creatorID: data.payload.creatorID,
                                lootboxID: data.payload.lootboxID,
                                factory: data.payload.factory,
                                lootboxAddress,
                                blockNumber: `${event.blockNumber}`,
                                lootboxName,
                                transactionHash: event.transactionHash,
                                creatorAddress: issuerAddress,
                                baseTokenURI: baseTokenURI,
                                symbol: data.payload.symbol, // Todo move this to onchain event
                                creationNonce: data.payload.nonce,
                            },
                            data.chain
                        );
                        // // Get the lootbox info
                        // await lootboxService.create(
                        //     {
                        //         tournamentID: data.payload.tournamentID,
                        //         factory: data.payload.factory,
                        //         lootboxDescription: data.payload.lootboxDescription,
                        //         backgroundImage: data.payload.backgroundImage,
                        //         logoImage: data.payload.logoImage,
                        //         themeColor: data.payload.themeColor,
                        //         nftBountyValue: data.payload.nftBountyValue,
                        //         joinCommunityUrl: data.payload.joinCommunityUrl
                        //             ? data.payload.joinCommunityUrl
                        //             : undefined,
                        //         lootboxAddress,
                        //         // blockNumber: log.blockNumber,
                        //         blockNumber: "",
                        //         lootboxName,
                        //         transactionHash: "",
                        //         creatorAddress: issuerAddress,
                        //         maxTickets: maxTickets.toNumber(),
                        //         creatorID: data.payload.creatorID,
                        //         baseTokenURI: baseTokenURI,
                        //         symbol: data.payload.symbol, // Todo move this to onchain event
                        //         creationNonce: data.payload.nonce,
                        //     },
                        //     data.chain
                        // );
                        provider.removeAllListeners(lootboxEventFilter);
                        res(null);
                        return;
                    } catch (err) {
                        logger.error("Error creating lootbox", err);
                        return;
                    }
                }
            );
        });
    });

export const enqueueLootboxOnCreate = functions
    .region(REGION)
    .https.onCall(async (data: EnqueueLootboxOnCreateCallableRequest, context) => {
        if (!context.auth?.uid) {
            // Unauthenticated
            logger.error("Unauthenticated");
            throw new functions.https.HttpsError("unauthenticated", "Unauthenticated! Please login.");
        }

        if (!ethers.utils.isAddress(data.listenAddress)) {
            logger.error("Address not valid", { listenAddress: data.listenAddress });
            throw new functions.https.HttpsError("internal", "Incorrect LOOTBOX address");
        }

        const chainSlug = chainIdHexToSlug(data.chainIdHex);
        if (!chainSlug) {
            logger.error("Could not convert chain to slug", { chainIdHex: data.chainIdHex });
            throw new functions.https.HttpsError("internal", "Invalid chain");
        }
        const chain = BLOCKCHAINS[chainSlug];
        if (!chain) {
            logger.error("Could not match chain", { chainIdHex: data.chainIdHex, chainSlug });
            throw new functions.https.HttpsError("internal", "Invalid chain");
        }

        const taskData: IndexLootboxOnCreateTaskRequest = {
            chain,
            payload: {
                factory: data.listenAddress,
                nonce: data.payload.nonce,
                symbol: data.payload.symbol,
                creatorID: context.auth.uid as UserID,
                lootboxID: data.payload.lootboxID,
            },
            filter: {
                fromBlock: data.fromBlock,
                // address: data.listenAddress,
                // topics: [topic],
            },
        };
        logger.info("Enqueing task", taskData);

        try {
            const queue = fun.taskQueue(buildTaskQueuePath("indexLootboxOnCreate"));
            await queue.enqueue(taskData);
        } catch (err) {
            logger.error("Error enqueuing task", err);
            throw new functions.https.HttpsError("internal", "An error occured. Please try again later.");
        }
        logger.info("Finished enqueing task");
        return;
    });

interface IndexLootboxOnMintTaskRequest {
    chain: ChainInfo;
    payload: {
        lootboxAddress: Address;
        nonce: LootboxMintSignatureNonce;
        userID: UserID;
        digest: LootboxTicketDigest;
    };
    filter: {
        fromBlock: number;
    };
}

export const indexLootboxOnMint = functions
    .region(REGION)
    .runWith({
        timeoutSeconds: 540,
        failurePolicy: true,
        secrets: [stampSecretName],
    })
    .tasks.taskQueue({
        retryConfig: {
            maxAttempts: 5,
            /**
             * The minimum time to wait between attempts. If left unspecified
             * will default to 100ms.
             */
            minBackoffSeconds: 60 * 10 /* 10 minutes */,
        },
    })
    .onDispatch(async (data: IndexLootboxOnMintTaskRequest) => {
        logger.info("indexLootboxOnMint", { data });
        // Any errors thrown or timeouts will trigger a retry

        // Start a listener to listen for the event
        const provider = new ethers.providers.JsonRpcProvider(data.chain.rpcUrls[0]);

        logger.info("creating lootbox contract");

        const lootbox = new ethers.Contract(data.payload.lootboxAddress, LootboxCosmicABI, provider);

        logger.info("lootbox: ", { lootbox });

        // eslint-disable-next-line
        const lootboxEventFilter = lootbox.filters.MintTicket(null, null, null, null, data.payload.digest);

        let events: ethers.Event[] = [];

        // Do a retrospective lookup for the event
        try {
            events = await lootbox.queryFilter(lootboxEventFilter, data.filter.fromBlock);
        } catch (err) {
            logger.error("Error querying retrospective event filter", err);
        }

        if (events.length > 0) {
            logger.info("Found event in past", { events });
            // Index it then return
            for (const event of events) {
                if (!event.args) {
                    continue;
                }

                const [minter, lootboxAddress, nonce, ticketID, digest] = event.args as [
                    Address,
                    Address,
                    ethers.BigNumber,
                    ethers.BigNumber,
                    LootboxTicketDigest
                ];

                logger.info("retrospective event", {
                    minter,
                    lootboxAddress,
                    nonce: nonce.toString(),
                    ticketID: ticketID.toString(),
                    digest,
                });

                if (
                    minter === undefined ||
                    lootboxAddress === undefined ||
                    nonce === undefined ||
                    ticketID === undefined ||
                    digest === undefined
                ) {
                    continue;
                }

                // Make sure its the right event
                const testNonce = data.payload.nonce;
                const eventNonce = nonce.toString() as LootboxMintSignatureNonce;
                if (eventNonce !== testNonce) {
                    logger.info("Event nonce does not match", {
                        nonceHash: eventNonce,
                        expectedNonce: testNonce,
                        event,
                    });
                    continue;
                }

                if (digest !== data.payload.digest) {
                    logger.info("Event digest does not match", {
                        digestHash: digest,
                        expectedDigest: data.payload.digest,
                        event,
                    });
                    continue;
                }

                try {
                    // Get the lootbox info
                    await lootboxService.mintNewTicketCallback({
                        lootboxAddress: lootboxAddress,
                        chainIDHex: data.chain.chainIdHex,
                        minterUserID: data.payload.userID,
                        ticketID: ticketID.toString() as LootboxTicketID_Web3,
                        minterAddress: minter,
                        digest: digest,
                        nonce: eventNonce,
                    });

                    return;
                } catch (err) {
                    logger.error("Error creating lootbox from retrospective nonce", err);
                }
            }
        }

        // If we could not retroactively find the event, listen for it
        logger.info("starting listener...");
        await new Promise((res) => {
            // This is the event listener
            lootbox.on(
                lootboxEventFilter,
                async (
                    minter: Address,
                    lootboxAddress: Address,
                    nonce: ethers.BigNumber,
                    ticketID: ethers.BigNumber,
                    digest: LootboxTicketDigest
                ) => {
                    logger.debug("Got log", {
                        minter,
                        lootboxAddress,
                        nonce,
                        nonceDecimalString: nonce.toString(),
                        ticketId: ticketID.toString(),
                        digest,
                    });

                    if (
                        minter === undefined ||
                        lootboxAddress === undefined ||
                        nonce === undefined ||
                        ticketID === undefined ||
                        digest === undefined
                    ) {
                        return;
                    }

                    // Make sure its the right event
                    const testNonce = data.payload.nonce;
                    const eventNonce = nonce.toString() as LootboxMintSignatureNonce;
                    if (eventNonce !== testNonce) {
                        logger.info("Nonce does not match", {
                            nonceHash: eventNonce,
                            expectedNonce: testNonce,
                        });
                        return;
                    }

                    // // make sure its the right digest with the DOMAIN_SPERATOR
                    // const expectedDigest = generateTicketDigest({
                    //     minterAddress: minter, // This comes from the chain
                    //     lootboxAddress: data.payload.lootboxAddress,
                    //     nonce: data.payload.nonce, // String version of uint 256 number
                    //     chainIDHex: data.chain.chainIdHex, // Pass this in to ensure the correct domain
                    // });

                    // if (digest.hash !== expectedDigest) {
                    //     logger.info("Digest does not match", {
                    //         digestHash: digest.hash,
                    //         expectedDigest,
                    //     });
                    //     return;
                    // }
                    if (digest !== data.payload.digest) {
                        logger.info("Digest does not match", {
                            digestHash: digest,
                            expectedDigest: data.payload.digest,
                        });
                        return;
                    }

                    try {
                        // Get the lootbox info
                        await lootboxService.mintNewTicketCallback({
                            lootboxAddress: lootboxAddress,
                            chainIDHex: data.chain.chainIdHex,
                            minterUserID: data.payload.userID,
                            ticketID: ticketID.toString() as LootboxTicketID_Web3,
                            minterAddress: minter,
                            digest: digest,
                            nonce: eventNonce,
                        });

                        provider.removeAllListeners(lootboxEventFilter);
                        res(null);
                        return;
                    } catch (err) {
                        logger.error("Error creating lootbox", err);
                        return;
                    }
                }
            );
        });
    });

export const enqueueLootboxOnMint = functions
    .region(REGION)
    .https.onCall(async (data: EnqueueLootboxOnMintCallableRequest, context) => {
        if (!context.auth?.uid) {
            // Unauthenticated
            logger.error("Unauthenticated");
            throw new functions.https.HttpsError("internal", "Unauthenticated! Please login.");
        }

        if (!ethers.utils.isAddress(data.lootboxAddress)) {
            logger.error("Address not valid", { listenAddress: data.lootboxAddress });
            throw new functions.https.HttpsError("internal", "Incorrect LOOTBOX address");
        }

        const chainSlug = chainIdHexToSlug(data.chainIDHex);
        if (!chainSlug) {
            logger.error("Could not convert chain to slug", { chainIdHex: data.chainIDHex });
            throw new functions.https.HttpsError("internal", "Invalid chain");
        }
        const chain = BLOCKCHAINS[chainSlug];
        if (!chain) {
            logger.error("Could not match chain", { chainIdHex: data.chainIDHex, chainSlug });
            throw new functions.https.HttpsError("internal", "Invalid chain");
        }

        const taskData: IndexLootboxOnMintTaskRequest = {
            chain,
            payload: {
                nonce: data.nonce,
                lootboxAddress: data.lootboxAddress,
                userID: context.auth.uid as UserID,
                digest: data.digest,
            },
            filter: {
                fromBlock: data.fromBlock,
            },
        };
        logger.info("Enqueing task", taskData);

        try {
            const queue = fun.taskQueue(buildTaskQueuePath("indexLootboxOnMint"));
            await queue.enqueue(taskData);
        } catch (err) {
            logger.error("Error enqueing task", err);
            throw new functions.https.HttpsError("internal", "An error occured. Please try again later.");
        }
        logger.info("Finished enqueing task");
        return;
    });

// interface IndexLootboxOnDepositTaskRequest {
//     chain: ChainInfo;
//     payload: {
//         lootboxAddress: Address;
//         depositor: Address;
//         userID: UserID;
//         afterDepositID: DepositID_Web3; // The deposit ID should be bigger than this
//         amount: string; // Stringified big number ie. "1000000000000000000"
//         erc20Address: Address;
//     };
//     filter: {
//         fromBlock: number;
//     };
// }

// export const indexLootboxOnDeposit = functions
//     .region(REGION)
//     .runWith({
//         timeoutSeconds: 540,
//         failurePolicy: true,
//     })
//     .tasks.taskQueue({
//         retryConfig: {
//             maxAttempts: 5,
//             /**
//              * The maximum number of times to double the backoff between
//              * retries. If left unspecified will default to 16.
//              */
//             maxDoublings: 1,
//             /**
//              * The minimum time to wait between attempts. If left unspecified
//              * will default to 100ms.
//              */
//             minBackoffSeconds: 60 * 5 /* 5 minutes */,
//         },
//     })
//     .onDispatch(async (data: IndexLootboxOnDepositTaskRequest) => {
//         logger.info("indexLootboxOnDeposit", { data });
//         // Any errors thrown or timeouts will trigger a retry

//         // Start a listener to listen for the event
//         const provider = new ethers.providers.JsonRpcProvider(data.chain.rpcUrls[0]);

//         logger.info("creating lootbox contract");

//         const lootbox = new ethers.Contract(data.payload.lootboxAddress, LootboxCosmicABI, provider);

//         logger.info("lootbox: ", { lootbox });

//         // eslint-disable-next-line
//         const lootboxEventFilter = lootbox.filters.DepositEarnings(
//             data.payload.depositor,
//             null,
//             null,
//             null,
//             null,
//             null,
//             null
//         );

//         let events: ethers.Event[] = [];

//         // Do a retrospective lookup for the event
//         try {
//             events = await lootbox.queryFilter(lootboxEventFilter, data.filter.fromBlock);
//         } catch (err) {
//             logger.error("Error querying retrospective event filter", err);
//         }

//         if (events.length > 0) {
//             logger.info("Found event in past", { events });
//             // Index it then return
//             for (const event of events) {
//                 if (!event.args) {
//                     continue;
//                 }

//                 const [
//                     depositor,
//                     lootboxAddress,
//                     depositId,
//                     nativeTokenAmount,
//                     erc20Address,
//                     erc20Amount,
//                     maxTicketsSnapshot,
//                 ] = event.args as [
//                     Address,
//                     Address,
//                     ethers.BigNumber,
//                     ethers.BigNumber,
//                     Address,
//                     ethers.BigNumber,
//                     ethers.BigNumber
//                 ];

//                 logger.info("retrospective event", {
//                     depositor,
//                     lootboxAddress,
//                     depositId: depositId.toString(),
//                     nativeTokenAmount: nativeTokenAmount.toString(),
//                     erc20Address,
//                     erc20Amount: erc20Amount.toString(),
//                     maxTicketsSnapshot: maxTicketsSnapshot.toString(),
//                 });

//                 if (
//                     depositor == undefined ||
//                     lootboxAddress == undefined ||
//                     depositId == undefined ||
//                     nativeTokenAmount == undefined ||
//                     erc20Address == undefined ||
//                     erc20Amount == undefined ||
//                     maxTicketsSnapshot == undefined
//                 ) {
//                     continue;
//                 }

//                 if (depositId.toNumber() <= data.payload.afterDepositID) {
//                     logger.info("Deposit ID is too low", {
//                         depositId: depositId.toNumber(),
//                         minDepositID: data.payload.afterDepositID,
//                     });
//                     continue;
//                 }

//                 if (erc20Amount.toString() !== data.payload.amount) {
//                     logger.info("ERC20 amount does not match", {
//                         erc20Amount: erc20Amount.toString(),
//                         expectedAmount: data.payload.amount,
//                     });
//                     continue;
//                 }

//                 if (erc20Address !== data.payload.erc20Address) {
//                     logger.info("ERC20 token does not match", {
//                         erc20Address,
//                         expectedToken: data.payload.erc20Address,
//                     });
//                     continue;
//                 }

//                 try {
//                     // Get the lootbox info
//                     await lootboxService.onDeposit({
//                         erc20Amount: erc20Amount.toString(),
//                         nativeAmount: nativeTokenAmount.toString(),
//                         erc20Address: erc20Address,
//                         transactionHash: event.transactionHash,
//                         blockNumber: event.blockNumber,
//                         depositerAddress: depositor,
//                         depositerID: data.payload.userID,
//                         lootboxAddress: lootboxAddress,
//                         chainIDHex: data.chain.chainIdHex,
//                         depositID: depositId.toNumber() as DepositID_Web3,
//                         maxTicketSnapshot: maxTicketsSnapshot.toNumber(),
//                     });

//                     return;
//                 } catch (err) {
//                     logger.error("Error creating from retrospective lookup", err);
//                 }
//             }
//         }

//         // If we could not retroactively find the event, listen for it
//         logger.info("starting listener...");
//         await new Promise((res) => {
//             // This is the event listener
//             lootbox.on(
//                 lootboxEventFilter,
//                 async (
//                     depositor: Address,
//                     lootboxAddress: Address,
//                     depositId: ethers.BigNumber,
//                     nativeTokenAmount: ethers.BigNumber,
//                     erc20Address: Address,
//                     erc20Amount: ethers.BigNumber,
//                     maxTicketsSnapshot: ethers.BigNumber,
//                     event: ethers.Event
//                 ) => {
//                     logger.debug("Got log", {
//                         depositor,
//                         lootboxAddress,
//                         depositId: depositId.toString(),
//                         nativeTokenAmount: nativeTokenAmount.toString(),
//                         erc20Address,
//                         erc20Amount: erc20Amount.toString(),
//                         maxTicketsSnapshot: maxTicketsSnapshot.toString(),
//                     });

//                     if (
//                         depositor == undefined ||
//                         lootboxAddress == undefined ||
//                         depositId == undefined ||
//                         nativeTokenAmount == undefined ||
//                         erc20Address == undefined ||
//                         erc20Amount == undefined ||
//                         maxTicketsSnapshot == undefined
//                     ) {
//                         return;
//                     }

//                     if (depositId.toNumber() <= data.payload.afterDepositID) {
//                         logger.info("Deposit ID is too low", {
//                             depositId: depositId.toNumber(),
//                             minDepositID: data.payload.afterDepositID,
//                         });
//                         return;
//                     }

//                     if (erc20Amount.toString() !== data.payload.amount) {
//                         logger.info("ERC20 amount does not match", {
//                             erc20Amount: erc20Amount.toString(),
//                             expectedAmount: data.payload.amount,
//                         });
//                         return;
//                     }

//                     if (erc20Address !== data.payload.erc20Address) {
//                         logger.info("ERC20 token does not match", {
//                             erc20Address,
//                             expectedToken: data.payload.erc20Address,
//                         });
//                         return;
//                     }

//                     try {
//                         // Get the lootbox info
//                         await lootboxService.onDeposit({
//                             erc20Amount: erc20Amount.toString(),
//                             nativeAmount: nativeTokenAmount.toString(),
//                             erc20Address: erc20Address,
//                             transactionHash: event.transactionHash,
//                             blockNumber: event.blockNumber,
//                             depositerAddress: depositor,
//                             depositerID: data.payload.userID,
//                             lootboxAddress: lootboxAddress,
//                             chainIDHex: data.chain.chainIdHex,
//                             depositID: depositId.toNumber() as DepositID_Web3,
//                             maxTicketSnapshot: maxTicketsSnapshot.toNumber(),
//                         });

//                         provider.removeAllListeners(lootboxEventFilter);
//                         res(null);
//                         return;
//                     } catch (err) {
//                         logger.error("Error creating lootbox", err);
//                         return;
//                     }
//                 }
//             );
//         });
//     });

// export const enqueueLootboxOnDeposit = functions
//     .region(REGION)
//     .https.onCall(async (data: EnqueueLootboxOnDepositCallableRequest, context) => {
//         if (!context.auth?.uid) {
//             // Unauthenticated
//             logger.error("Unauthenticated");
//             return;
//         }

//         if (!ethers.utils.isAddress(data.lootboxAddress)) {
//             logger.error("Address not valid", { listenAddress: data.lootboxAddress });
//             return;
//         }

//         const chainSlug = chainIdHexToSlug(data.chainIDHex);
//         if (!chainSlug) {
//             logger.warn("Could not match chain", { chainIdHex: data.chainIDHex });
//             return;
//         }
//         const chain = BLOCKCHAINS[chainSlug];

//         const taskData: IndexLootboxOnDepositTaskRequest = {
//             chain,
//             payload: {
//                 lootboxAddress: data.lootboxAddress,
//                 userID: context.auth.uid as UserID,
//                 afterDepositID: data.afterDepositID, // The deposit ID should be bigger than this
//                 amount: data.amount, // Stringified big number ie. "1000000000000000000"
//                 depositor: data.depositerAddress,
//                 erc20Address: data.erc20Address,
//             },
//             filter: {
//                 fromBlock: data.fromBlock,
//             },
//         };
//         logger.debug("Enqueing task", taskData);
//         const queue = fun.taskQueue(buildTaskQueuePath("indexLootboxOnDeposit"));
//         await queue.enqueue(taskData);

//         return;
//     });

export const onLootboxWrite = functions
    .region(REGION)
    .runWith({
        secrets: [stampSecretName],
    })
    .firestore.document(`/${Collection.Lootbox}/{lootboxID}`)
    .onWrite(async (snap) => {
        const oldLootbox = snap.before.data() as Lootbox_Firestore | undefined;
        const newLootbox = snap.after.data() as Lootbox_Firestore | undefined;

        if (!newLootbox || !oldLootbox) {
            return;
        }

        const shouldUpdateStamp =
            newLootbox.name !== oldLootbox.name ||
            newLootbox.logo !== oldLootbox.logo ||
            newLootbox.backgroundImage !== oldLootbox.backgroundImage ||
            newLootbox.themeColor !== oldLootbox.themeColor;

        if (shouldUpdateStamp) {
            logger.info("Updating stamp", {
                lootboxID: newLootbox.id,
                backgroundImage: newLootbox.backgroundImage,
                logoImage: newLootbox.logo,
                themeColor: newLootbox.themeColor,
                name: newLootbox.name,
                lootboxAddress: newLootbox.address,
                chainIdHex: newLootbox.chainIdHex,
            });
            try {
                await lootboxService.updateCallback(newLootbox.id, {
                    backgroundImage: newLootbox.backgroundImage,
                    logoImage: newLootbox.logo,
                    themeColor: newLootbox.themeColor,
                    name: newLootbox.name,
                    lootboxAddress: newLootbox.address,
                    chainIdHex: newLootbox.chainIdHex,
                    description: newLootbox.description,
                });
            } catch (err) {
                logger.error(err, {
                    lootboxID: newLootbox.id,
                });
            }
        }

        const wasLootboxDeployed = !!newLootbox.address && !oldLootbox.address;

        if (wasLootboxDeployed) {
            try {
                await lootboxService.onDeployed(newLootbox);
            } catch (err) {
                logger.error("Error on Lootbox Deployed Callback", err);
            }
        }

        // If needed, update Lootbox status to sold out
        const soldOutRequiredFieldsChanged =
            // a new claim was made
            oldLootbox.runningCompletedClaims !== newLootbox.runningCompletedClaims ||
            // max tickets was changed
            oldLootbox.maxTickets !== newLootbox.maxTickets;
        if (
            !!newLootbox.runningCompletedClaims &&
            newLootbox.runningCompletedClaims >= newLootbox.maxTickets &&
            newLootbox.status !== LootboxStatus_Firestore.soldOut &&
            soldOutRequiredFieldsChanged
        ) {
            logger.log("updating lootbox to sold out", snap.after.id);
            try {
                const lootboxRef = db.collection(Collection.Lootbox).doc(snap.after.id);

                const updateReq: Partial<Lootbox_Firestore> = {
                    status: LootboxStatus_Firestore.soldOut,
                };

                await lootboxRef.update(updateReq);
            } catch (err) {
                logger.error("Error onPartyBasketWrite", err);
            }
        }

        return;
    });

// Not needed anymore because whitelist happens on the fly via GQL call
// export const onWalletCreate = functions
//     .region(REGION)
//     .runWith({
//         secrets: [whitelisterPrivateKeySecretName],
//     })
//     .firestore.document(`/${Collection.User}/{userID}/${Collection.Wallet}/{walletID}`)
//     .onCreate(async (snap) => {
//         logger.info(snap);

//         const wallet: Wallet_Firestore = snap.data() as Wallet_Firestore;

//         try {
//             // Look for un resolved claims
//             const unassignedClaims = await getUnassignedClaimsForUser(wallet.userId);
//             if (unassignedClaims && unassignedClaims.length > 0) {
//                 logger.info(`Found claims to whitelist: ${unassignedClaims.length}`, {
//                     numClaims: unassignedClaims.length,
//                     userID: wallet.userId,
//                 });

//                 // Generate a whitelist for each claim
//                 const lootboxMapping: { [key: LootboxID]: Lootbox_Firestore } = {};
//                 for (const claim of unassignedClaims) {
//                     try {
//                         let lootbox: Lootbox_Firestore | undefined;
//                         if (
//                             !claim.lootboxID ||
//                             claim.status !== ClaimStatus_Firestore.complete ||
//                             !!claim.whitelistId
//                         ) {
//                             continue;
//                         }
//                         if (!lootboxMapping[claim.lootboxID]) {
//                             lootbox = await getLootbox(claim.lootboxID);
//                             if (!lootbox) {
//                                 continue;
//                             }
//                             lootboxMapping[claim.lootboxID] = lootbox;
//                         } else {
//                             lootbox = lootboxMapping[claim.lootboxID];
//                         }
//                         if (lootbox) {
//                             await lootboxService.whitelist(wallet.address, lootbox, claim);
//                         }
//                     } catch (err) {
//                         logger.error("Error processing unassigned claim", {
//                             err,
//                             claimID: claim.id,
//                             referralID: claim.referralId,
//                         });
//                         continue;
//                     }
//                 }
//             }
//         } catch (err) {
//             logger.error("Error onWalletCreate", err);
//         }
//     });
