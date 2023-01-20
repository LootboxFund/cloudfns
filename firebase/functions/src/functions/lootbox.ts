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
    LootboxStatus_Firestore,
    Collection,
    Lootbox_Firestore,
    LootboxTicketID,
    LootboxTicket_Firestore,
    ReferralType_Firestore,
    UserIdpID,
} from "@wormgraph/helpers";
import LootboxCosmicFactoryABI from "@wormgraph/helpers/lib/abi/LootboxCosmicFactory.json";
import LootboxCosmicABI from "@wormgraph/helpers/lib/abi/LootboxCosmic.json";
import { db, fun } from "../api/firebase";
import { manifest, SecretName } from "../manifest";
import * as lootboxService from "../service/lootbox";
import { retrieveRandomColor } from "./util";
import {
    associateInviteDataToLootbox,
    createLootboxTournamentSnapshot,
    getAffiliateByUserIdpID,
    getTicketByID,
} from "../api/firestore";
import * as referralService from "../service/referral";

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
        const rpcURL = data.chain.privateRPCUrls[0] || data.chain.rpcUrls[0];
        const provider = new ethers.providers.JsonRpcProvider(rpcURL);
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
        logger.log("Enqueue Lootbox On Create", { data });
        if (!context.auth?.uid) {
            // Unauthenticated
            logger.error("Unauthenticated");
            throw new functions.https.HttpsError("unauthenticated", "Unauthenticated! Please login.");
        }

        if (!ethers.utils.isAddress(data.listenAddress)) {
            logger.error("Address not valid", { listenAddress: data.listenAddress });
            throw new functions.https.HttpsError("invalid-argument", "Incorrect LOOTBOX address");
        }

        const chainSlug = chainIdHexToSlug(data.chainIdHex);
        if (!chainSlug) {
            logger.error("Could not convert chain to slug", { chainIdHex: data.chainIdHex });
            throw new functions.https.HttpsError("invalid-argument", "Invalid chain");
        }
        const chain = BLOCKCHAINS[chainSlug];
        if (!chain) {
            logger.error("Could not match chain", { chainIdHex: data.chainIdHex, chainSlug });
            throw new functions.https.HttpsError("invalid-argument", "Invalid chain");
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
        /** new flow: updates existing ticket instead of creating new one */
        ticketID?: LootboxTicketID;
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
        const rpcURL = data.chain.privateRPCUrls[0] || data.chain.rpcUrls[0];

        // Start a listener to listen for the event
        const provider = new ethers.providers.JsonRpcProvider(rpcURL);

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
                        ticketWeb2ID: data.payload.ticketID,
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
                            ticketWeb2ID: data.payload.ticketID,
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
            throw new functions.https.HttpsError("unauthenticated", "Unauthenticated! Please login.");
        }

        if (!ethers.utils.isAddress(data.lootboxAddress)) {
            logger.error("Address not valid", { listenAddress: data.lootboxAddress });
            throw new functions.https.HttpsError("invalid-argument", "Incorrect LOOTBOX address");
        }

        const chainSlug = chainIdHexToSlug(data.chainIDHex);
        if (!chainSlug) {
            logger.error("Could not convert chain to slug", { chainIdHex: data.chainIDHex });
            throw new functions.https.HttpsError("invalid-argument", "Invalid chain");
        }
        const chain = BLOCKCHAINS[chainSlug];
        if (!chain) {
            logger.error("Could not match chain", { chainIdHex: data.chainIDHex, chainSlug });
            throw new functions.https.HttpsError("invalid-argument", "Invalid chain");
        }

        if (data.ticketID) {
            let ticket: LootboxTicket_Firestore | undefined;
            try {
                ticket = await getTicketByID(data.ticketID);
                if (!ticket) {
                    throw new Error("Not found");
                }
            } catch (err) {
                logger.error("Could not find ticket", err, { ticketID: data.ticketID });
                throw new functions.https.HttpsError("unauthenticated", "Ticket not found");
            }

            if (ticket.ownerUserID !== context.auth.uid) {
                logger.error("Ticket does not belong to user", {
                    ticketID: data.ticketID,
                    ownerUserID: ticket?.ownerUserID,
                    userID: context.auth.uid,
                });
                throw new functions.https.HttpsError("unauthenticated", "You do not own this ticket");
            }
        }

        const taskData: IndexLootboxOnMintTaskRequest = {
            chain,
            payload: {
                nonce: data.nonce,
                lootboxAddress: data.lootboxAddress,
                userID: context.auth.uid as UserID,
                digest: data.digest,
                ticketID: data.ticketID,
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

export const onLootboxWrite = functions
    .region(REGION)
    .runWith({
        secrets: [stampSecretName],
    })
    .firestore.document(`/${Collection.Lootbox}/{lootboxID}`)
    .onWrite(async (snap) => {
        const oldLootbox = snap.before.data() as Lootbox_Firestore | undefined;
        const newLootbox = snap.after.data() as Lootbox_Firestore | undefined;

        if (!newLootbox) {
            return;
        }

        if (!oldLootbox) {
            // Create a referral links
            if (newLootbox.tournamentID) {
                // Lootbox created
                // Create the official invite graphic & referral link
                const host = await getAffiliateByUserIdpID(newLootbox.creatorID as unknown as UserIdpID);
                const officialReferral = await referralService.create(
                    {
                        campaignName: `${newLootbox.name} Official Invite Link`,
                        promoterId: host?.id,
                        referrerId: newLootbox.creatorID,
                        tournamentId: newLootbox.tournamentID,
                        type: ReferralType_Firestore.genesis,
                        lootboxID: newLootbox.id,
                        stampMetadata: {
                            playerHeadshot: newLootbox.stampMetadata?.playerHeadshot ?? null,
                            logoURLs: newLootbox.stampMetadata?.logoURLs ?? [],
                            eventName: newLootbox.stampMetadata?.eventName || "Lootbox Events",
                            hostName: newLootbox.stampMetadata?.hostName ?? null,
                        },
                    },
                    newLootbox.creatorID
                );

                const referralLink = `${manifest.microfrontends.webflow.referral}?r=${officialReferral.slug}`;

                await Promise.all([
                    createLootboxTournamentSnapshot({
                        tournamentID: newLootbox.tournamentID,
                        lootboxID: newLootbox.id,
                        lootboxAddress: newLootbox.address || null,
                        creatorID: newLootbox.creatorID,
                        lootboxCreatorID: newLootbox.creatorID,
                        description: newLootbox.description,
                        name: newLootbox.name,
                        stampImage: newLootbox.stampImage,
                        type: newLootbox.type,
                        inviteLinkURL: referralLink,
                        inviteStampImage: officialReferral.inviteGraphic,
                    }),
                    // This will update the invite stamp data on the lootbox (note this will re-trigger this functino...)
                    associateInviteDataToLootbox(newLootbox.id, {
                        inviteGraphic: officialReferral.inviteGraphic,
                        inviteLink: referralLink,
                    }),
                ]);
            }

            return;
        }

        // Lootbox updated
        const shouldUpdateSimpleStampV2 =
            newLootbox.name !== oldLootbox.name ||
            newLootbox.backgroundImage !== oldLootbox.backgroundImage ||
            newLootbox.themeColor !== oldLootbox.themeColor ||
            newLootbox.stampMetadata?.playerHeadshot !== oldLootbox.stampMetadata?.playerHeadshot ||
            JSON.stringify(newLootbox.stampMetadata?.logoURLs) !== JSON.stringify(oldLootbox.stampMetadata?.logoURLs);
        const shouldUpdateInviteStampV2 =
            newLootbox.name !== oldLootbox.name ||
            newLootbox.backgroundImage !== oldLootbox.backgroundImage ||
            newLootbox.themeColor !== oldLootbox.themeColor ||
            newLootbox.stampMetadata?.playerHeadshot !== oldLootbox.stampMetadata?.playerHeadshot ||
            JSON.stringify(newLootbox.stampMetadata?.logoURLs) !== JSON.stringify(oldLootbox.stampMetadata?.logoURLs) ||
            newLootbox.nftBountyValue !== oldLootbox.nftBountyValue;

        /** @deprecated old design specs */
        const shouldUpdateStampV1 = shouldUpdateSimpleStampV2 || newLootbox.logo !== oldLootbox.logo;

        if (shouldUpdateSimpleStampV2 || shouldUpdateInviteStampV2 || shouldUpdateStampV1) {
            logger.info("Updating stamp", {
                lootboxID: newLootbox.id,
                backgroundImage: newLootbox.backgroundImage,
                logoImage: newLootbox.logo,
                themeColor: newLootbox.themeColor || retrieveRandomColor(),
                name: newLootbox.name,
                lootboxAddress: newLootbox.address,
                chainIdHex: newLootbox.chainIdHex,
                metadata: newLootbox.stampMetadata,
            });
            try {
                await lootboxService.updateCallback(newLootbox.id, {
                    backgroundImage: newLootbox.backgroundImage,
                    logoImage: newLootbox.logo,
                    themeColor: newLootbox.themeColor || retrieveRandomColor(),
                    name: newLootbox.name,
                    lootboxAddress: newLootbox.address,
                    chainIdHex: newLootbox.chainIdHex,
                    description: newLootbox.description,
                    stampMetadata: newLootbox.stampMetadata,
                    // referralURL: `${manifest.microfrontends.webflow.referral}?r=${officialReferral.slug}`,
                    referralURL: newLootbox.officialInviteLink || "https://lootbox.tickets",
                    lootboxTicketValue: newLootbox.nftBountyValue || "Epic Prizes",
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
                logger.error("Error onLootboxWrite", err);
            }
        }

        return;
    });
