import { db, fun } from "./api/firebase";
import * as functions from "firebase-functions";
import { Ad, AdEventAction, PartyBasket, PartyBasketStatus } from "./api/graphql/generated/types";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { Message } from "firebase-functions/v1/pubsub";
import { extractURLStatePixelTracking } from "./lib/url";
import {
    createAdEvent,
    getAdEventsBySessionId,
    updateAdCounts,
    getAdEventsByNonce,
    getFlightById,
    incrementLootboxRunningClaims,
    getLootbox,
} from "./api/firestore";
import { manifest, SecretName } from "./manifest";
import {
    Address,
    AdEvent_Firestore,
    AdFlight_Firestore,
    BLOCKCHAINS,
    chainIdHexToSlug,
    UserID,
    Collection,
    AdID,
    ChainInfo,
    LootboxCreatedNonce,
    EnqueueLootboxOnCreateCallableRequest,
    TournamentID,
    Claim_Firestore,
    ClaimStatus_Firestore,
    ReferralType_Firestore,
    ClaimType_Firestore,
    Lootbox_Firestore,
    LootboxStatus_Firestore,
    Wallet_Firestore,
    LootboxID,
    MeasurementPartnerType,
    tableActivationIngestorRoutes,
    ActivationIngestorRoute_LootboxAppWebsiteVisit_Body,
    LootboxTicketID_Web3,
    LootboxTicketDigest,
    LootboxMintSignatureNonce,
    EnqueueLootboxOnMintCallableRequest,
} from "@wormgraph/helpers";
import LootboxCosmicFactoryABI from "@wormgraph/helpers/lib/abi/LootboxCosmicFactory.json";
import { checkIfOfferIncludesLootboxAppWebsiteVisit, reportViewToMMP } from "./api/mmp/mmp";
import LootboxCosmicABI from "@wormgraph/helpers/lib/abi/LootboxCosmic.json";
import { generateMemoBills } from "./api/firestore/memo";
import { ethers } from "ethers";
import * as lootboxService from "./service/lootbox";
import { createRewardClaim, getUnassignedClaimsForUser } from "./api/firestore/referral";
import { getUserWallets } from "./api/firestore/user";
import axios from "axios";
// import { generateTicketDigest } from "./lib/ethers";

const DEFAULT_MAX_CLAIMS = 10000;
const stampSecretName: SecretName = "STAMP_SECRET";
// TODO: Rename this secret to be LOOTBOX
const whitelisterPrivateKeySecretName: SecretName = "PARTY_BASKET_WHITELISTER_PRIVATE_KEY";

export const onClaimWrite = functions
    .runWith({
        secrets: [whitelisterPrivateKeySecretName],
    })
    .firestore.document(`/${Collection.Referral}/{referralId}/${Collection.Claim}/{claimId}`)
    .onWrite(async (snap) => {
        // Grab the current value of what was written to Firestore.
        const oldClaim = snap.before.data() as Claim_Firestore | undefined;
        const newClaim = snap.after.data() as Claim_Firestore | undefined;

        if (!newClaim) {
            return;
        }

        const isStatusChanged = newClaim.status !== oldClaim?.status;

        if (newClaim.isPostCosmic) {
            if (newClaim.status === ClaimStatus_Firestore.complete && isStatusChanged && newClaim.lootboxID) {
                logger.log("incrementing lootbox completedClaims", {
                    claimID: newClaim.id,
                    lootboxID: newClaim.lootboxID,
                });

                let lootbox: Lootbox_Firestore | undefined;

                try {
                    lootbox = await getLootbox(newClaim.lootboxID);
                    if (!lootbox) {
                        throw new Error("Lootbox not found");
                    }
                } catch (err) {
                    logger.error("error fetching lootbox", { lootboxID: newClaim.lootboxID, err });
                    return;
                }

                if (!newClaim.whitelistId && newClaim.claimerUserId) {
                    try {
                        // Generate the whitelist only if the user wallet exists
                        const userWallets = await getUserWallets(newClaim.claimerUserId, 1); // Uses the first wallet
                        if (userWallets.length > 0) {
                            const walletToWhitelist = userWallets[0];
                            // If user has wallet, whitelist it
                            // If not, this claim will be whitelisted later when the user adds their wallet
                            await lootboxService.whitelist(walletToWhitelist.address, lootbox, newClaim);
                        }
                    } catch (err) {
                        logger.error("Error onClaimWrite generating whitelist", err);
                    }
                }

                incrementLootboxRunningClaims(newClaim.lootboxID).catch((err) => {
                    logger.error("Error onClaimWrite", err);
                });

                const currentAmount = lootbox?.runningCompletedClaims || 0;
                const newCurrentAmount = currentAmount + 1; // Since we just incremented by one in this function (see "incrementLootboxRunningClaims")
                const maxAmount = lootbox?.maxTickets || 10000;
                const isBonusWithinLimit = newCurrentAmount < maxAmount;

                if (
                    lootbox &&
                    isBonusWithinLimit &&
                    newClaim.referralType === ReferralType_Firestore.viral &&
                    newClaim.type === ClaimType_Firestore.referral &&
                    newClaim.referrerId
                ) {
                    // Create the reward claim
                    try {
                        logger.log("Creating reward claim for referral", {
                            claimID: newClaim.id,
                            referralID: newClaim.referralId,
                        });
                        await createRewardClaim({
                            lootboxID: newClaim.lootboxID,
                            referralId: newClaim.referralId,
                            tournamentId: newClaim.tournamentId,
                            tournamentName: newClaim.tournamentName,
                            referralSlug: newClaim.referralSlug,
                            referralCampaignName: newClaim.referralCampaignName || "",
                            rewardFromClaim: newClaim.id,
                            rewardFromFriendReferred: newClaim.claimerUserId,
                            claimerID: newClaim.referrerId,
                        });
                    } catch (err) {
                        logger.error("Error onClaimWrite creating reward claim", err);
                    }
                }
            }
        } else {
            // DEPRECATED Cosmic stuff
            /** @NOTE We dont need to write the reward claim for old claims because it gets written from GQL */
            if (newClaim.status === ClaimStatus_Firestore.complete && isStatusChanged && newClaim.chosenPartyBasketId) {
                logger.log("incrementing party basket completedClaims");
                try {
                    const partyBasketRef = db
                        .collection(Collection.PartyBasket)
                        .doc(newClaim.chosenPartyBasketId) as DocumentReference<Claim_Firestore>;

                    const updateReq: Partial<PartyBasket> = {
                        runningCompletedClaims: FieldValue.increment(1) as unknown as number,
                    };

                    await partyBasketRef.update(updateReq);
                } catch (err) {
                    logger.error("Error onClaimWrite", err);
                }
            }
        }

        return;
    });

export const onWalletCreate = functions
    .runWith({
        secrets: [whitelisterPrivateKeySecretName],
    })
    .firestore.document(`/${Collection.User}/{userID}/${Collection.Wallet}/{walletID}`)
    .onCreate(async (snap) => {
        logger.info(snap);

        const wallet: Wallet_Firestore = snap.data() as Wallet_Firestore;

        try {
            // Look for un resolved claims
            const unassignedClaims = await getUnassignedClaimsForUser(wallet.userId);
            if (unassignedClaims && unassignedClaims.length > 0) {
                logger.info(`Found claims to whitelist: ${unassignedClaims.length}`, {
                    numClaims: unassignedClaims.length,
                    userID: wallet.userId,
                });

                const lootboxMapping: { [key: LootboxID]: Lootbox_Firestore } = {};
                for (const claim of unassignedClaims) {
                    try {
                        let lootbox: Lootbox_Firestore | undefined;
                        if (
                            !claim.lootboxID ||
                            claim.status !== ClaimStatus_Firestore.complete ||
                            !!claim.whitelistId
                        ) {
                            continue;
                        }
                        if (!lootboxMapping[claim.lootboxID]) {
                            lootbox = await getLootbox(claim.lootboxID);
                            if (!lootbox) {
                                continue;
                            }
                            lootboxMapping[claim.lootboxID] = lootbox;
                        } else {
                            lootbox = lootboxMapping[claim.lootboxID];
                        }
                        if (lootbox) {
                            await lootboxService.whitelist(wallet.address, lootbox, claim);
                        }
                    } catch (err) {
                        logger.error("Error processing unassigned claim", {
                            err,
                            claimID: claim.id,
                            referralID: claim.referralId,
                        });
                        continue;
                    }
                }
            }
        } catch (err) {
            logger.error("Error onWalletCreate", err);
        }
    });

export const onLootboxWrite = functions.firestore
    .document(`/${Collection.Lootbox}/{lootboxID}`)
    .onWrite(async (snap) => {
        const oldLootbox = snap.before.data() as Lootbox_Firestore | undefined;
        const newLootbox = snap.after.data() as Lootbox_Firestore | undefined;

        if (!newLootbox || !oldLootbox) {
            return;
        }

        // TODO: Restamp Lootbox if assets have changed

        // TODO: update all snapshot? SKIP FOR NOW

        // If needed, update Lootbox status to sold out
        if (
            !!newLootbox.runningCompletedClaims &&
            newLootbox.runningCompletedClaims >= newLootbox.maxTickets &&
            newLootbox.status !== LootboxStatus_Firestore.soldOut &&
            oldLootbox?.runningCompletedClaims !== newLootbox.runningCompletedClaims
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

/** @deprecated use onLootboxWrite now */
export const onPartyBasketWrite = functions.firestore
    .document(`/${Collection.PartyBasket}/{partyBasketId}`)
    .onWrite(async (snap) => {
        const newPartyBasket = snap.after.data() as PartyBasket | undefined;

        if (!newPartyBasket) {
            return;
        }

        // If needed, update Party basket status to sold out
        const maxCompletedClaims = newPartyBasket.maxClaimsAllowed || DEFAULT_MAX_CLAIMS;
        if (
            !!newPartyBasket.runningCompletedClaims &&
            newPartyBasket.runningCompletedClaims >= maxCompletedClaims &&
            newPartyBasket.status !== PartyBasketStatus.SoldOut
        ) {
            const oldPartyBasket = snap.before.data() as PartyBasket | undefined;

            if (oldPartyBasket?.runningCompletedClaims !== newPartyBasket?.runningCompletedClaims) {
                logger.log("updating party basket to sold out", snap.after.id);
                try {
                    const partyBasketRef = db.collection(Collection.PartyBasket).doc(snap.after.id);

                    const updateReq: Partial<PartyBasket> = {
                        status: PartyBasketStatus.SoldOut,
                    };

                    await partyBasketRef.update(updateReq);
                } catch (err) {
                    logger.error("Error onPartyBasketWrite", err);
                }
            }
        }

        return;
    });

/**
 * Pubsub listens to log sink with something like the following query
 *
 * How it works:
 * 1x1 pixel stored in cloud storage
 * served via an https load balancer
 * which emits a log to cloud logging
 * which then pipes the log to this pubsub function
 *
 * ```
 * resource.type="http_load_balancer"
 * resource.labels.project_id="lootbox-fund-staging"
 * severity=INFO
 * log_name="projects/lootbox-fund-staging/logs/requests"
 * httpRequest.status=200
 * resource.labels.forwarding_rule_name="lb-tracking-pixel-lootbox-staging-ssl"
 * resource.labels.url_map_name="lb-lootbox-pixel-tracking"
 * httpRequest.requestUrl : "https://staging.track.lootbox.fund/pixel.png"
 * ```
 */
export const pubsubPixelTracking = functions.pubsub
    .topic(manifest.cloudFunctions.pubsubPixelTracking.topic)
    .onPublish(async (message: Message) => {
        logger.log("PUB SUB TRIGGERED", { topic: manifest.cloudFunctions.pubsubPixelTracking.topic, message });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let jsonData: any;
        try {
            jsonData = message.json;
        } catch (e) {
            logger.error("PubSub message was not JSON", e);
            return;
        }

        const url = jsonData?.httpRequest?.requestUrl;

        if (!url) {
            logger.error("URL not in payload");
            return;
        }

        const {
            // userId,
            // adId,
            // adSetId,
            // offerId,
            // claimId,
            // campaignId,
            // tournamentId,
            // organizerID,
            // promoterID,
            // sessionId,
            flightID,
            eventAction,
            nonce,
            timeElapsed,
        } = extractURLStatePixelTracking(url);

        // get for existing flight
        let flight: AdFlight_Firestore;
        let createdEvent: AdEvent_Firestore;

        try {
            if (!flightID || !eventAction || !nonce) {
                logger.error("Malformed URL", url);
                return;
            }

            if (!Object.values(AdEventAction).includes(eventAction as AdEventAction)) {
                logger.error("Invalid event Action provided...");
                return;
            }

            flight = await getFlightById(flightID);

            // check if nonce already used (deduplication of events)
            const eventsByNonce = await getAdEventsByNonce(flight.adID as AdID, nonce, 1);
            if (eventsByNonce.length > 0) {
                logger.error("Nonce already used", { adId: flight.adID, nonce });
                return;
            }

            // Now write the AdEvent subcollection document
            createdEvent = await createAdEvent({
                action: eventAction,
                flight,
                nonce,
                timeElapsed,
            });
            logger.info("Successfully created ad event", { id: createdEvent.id, ad: flight.adID });
        } catch (err) {
            logger.error("Pubsub error", err);
            return;
        }

        const updateRequest: Partial<Ad> = {};
        if (eventAction === AdEventAction.View) {
            updateRequest.impressions = FieldValue.increment(1) as unknown as number;
            // Report to the MMP
            await reportViewToMMP(flight, createdEvent);
        }

        if (eventAction === AdEventAction.Click) {
            // Update clicks
            updateRequest.clicks = FieldValue.increment(1) as unknown as number;

            // Check if unique click by session id
            // A unique click is counted when only one click adEvent exists for a given sessionId
            try {
                const sessionAdEvents = await getAdEventsBySessionId(flight.adID, flight.sessionID, {
                    actionType: AdEventAction.Click,
                    limit: 2,
                });
                if (sessionAdEvents.length === 1) {
                    // Recall, we previously just made an ad event so there should be one
                    updateRequest.uniqueClicks = FieldValue.increment(1) as unknown as number;
                }

                // Check if any of the activations are type of "ClickToWebsite"
                const { id, mmpAlias } = await checkIfOfferIncludesLootboxAppWebsiteVisit(flight.offerID);
                if (id && mmpAlias) {
                    const info: ActivationIngestorRoute_LootboxAppWebsiteVisit_Body = {
                        flightID: flight.id,
                        activationID: id,
                        mmpAlias,
                    };
                    await axios({
                        method: "post",
                        url: `${manifest.cloudRun.containers.activationIngestor.fullRoute}${
                            tableActivationIngestorRoutes[MeasurementPartnerType.LootboxAppWebsiteVisit].path
                        }`,
                        data: info,
                    });
                }
            } catch (err) {
                logger.error(err);
                // Just fail silently
            }
        }

        if (Object.keys(updateRequest).length === 0) {
            // Nothing to update
            return;
        }

        try {
            await updateAdCounts(flight.adID, updateRequest);
        } catch (err) {
            logger.error("Error updating ad counts...", err);
        }

        return;
    });

export const pubsubBillableActivationEvent = functions.pubsub
    .topic(manifest.cloudFunctions.pubsubBillableActivationEvent.topic)
    .onPublish(async (message: Message) => {
        logger.log("PUB SUB TRIGGERED", {
            topic: manifest.cloudFunctions.pubsubBillableActivationEvent.topic,
            message,
        });
        // Get the AdEvent from firestore
        const AdEventID = Buffer.from(message.data, "base64").toString().trim();

        const adEventRef = db.collection(Collection.AdEvent).doc(AdEventID) as DocumentReference<AdEvent_Firestore>;
        const adEventSnapshot = await adEventRef.get();
        if (!adEventSnapshot.exists) {
            throw Error(`No AdEvent with id ${AdEventID} found`);
        }
        const adEvent = adEventSnapshot.data();
        if (!adEvent) {
            throw Error(`AdEvent with id ${AdEventID} was undefined`);
        }

        // Generate the Memos
        await generateMemoBills(adEvent);

        // end
        return;
    });

interface IndexLootboxOnCreateTaskRequest {
    chain: ChainInfo;
    payload: {
        creatorID: UserID;
        factory: Address;
        lootboxDescription: string;
        // version: string;
        backgroundImage: string;
        logoImage: string;
        themeColor: string;
        nftBountyValue: string;
        joinCommunityUrl?: string;
        symbol: string;
        nonce: LootboxCreatedNonce;
        tournamentID?: TournamentID;
    };
    filter: {
        fromBlock: number;
    };
}

export const indexLootboxOnCreate = functions
    .runWith({
        timeoutSeconds: 540,
        failurePolicy: true,
        secrets: [stampSecretName],
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
            data.payload.nonce
        );

        // const events = await lootboxFactory.queryFilter(lootboxEventFilter, data.filter.fromBlock);

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
                    // TODO: correct typing on these paramaters, maybe typechain?
                    nonce: { hash: string }
                ) => {
                    logger.debug("Got log", {
                        lootboxName,
                        lootboxAddress,
                        issuerAddress,
                        maxTickets,
                        baseTokenURI,
                        nonce,
                        maxTicketsParsed: maxTickets.toNumber(),
                    });

                    if (
                        lootboxName === undefined ||
                        lootboxAddress === undefined ||
                        issuerAddress === undefined ||
                        maxTickets === undefined ||
                        baseTokenURI === undefined ||
                        nonce === undefined
                    ) {
                        return;
                    }

                    // Make sure its the right event
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
                        // Get the lootbox info
                        await lootboxService.create(
                            {
                                tournamentID: data.payload.tournamentID,
                                factory: data.payload.factory,
                                lootboxDescription: data.payload.lootboxDescription,
                                backgroundImage: data.payload.backgroundImage,
                                logoImage: data.payload.logoImage,
                                themeColor: data.payload.themeColor,
                                nftBountyValue: data.payload.nftBountyValue,
                                joinCommunityUrl: data.payload.joinCommunityUrl
                                    ? data.payload.joinCommunityUrl
                                    : undefined,
                                lootboxAddress,
                                // blockNumber: log.blockNumber,
                                blockNumber: "",
                                lootboxName,
                                transactionHash: "",
                                creatorAddress: issuerAddress,
                                maxTickets: maxTickets.toNumber(),
                                creatorID: data.payload.creatorID,
                                baseTokenURI: baseTokenURI,
                                symbol: data.payload.symbol, // Todo move this to onchain event
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

export const enqueueLootboxOnCreate = functions.https.onCall(
    async (data: EnqueueLootboxOnCreateCallableRequest, context) => {
        if (!context.auth?.uid) {
            // Unauthenticated
            logger.error("Unauthenticated");
            return;
        }

        if (!ethers.utils.isAddress(data.listenAddress)) {
            logger.error("Address not valid", { listenAddress: data.listenAddress });
            return;
        }

        const chainSlug = chainIdHexToSlug(data.chainIdHex);
        if (!chainSlug) {
            logger.warn("Could not match chain", { chainIdHex: data.chainIdHex });
            return;
        }
        const chain = BLOCKCHAINS[chainSlug];

        const taskData: IndexLootboxOnCreateTaskRequest = {
            chain,
            payload: {
                factory: data.listenAddress,
                nonce: data.payload.nonce,
                lootboxDescription: data.payload.lootboxDescription,
                backgroundImage: data.payload.backgroundImage,
                logoImage: data.payload.logoImage,
                themeColor: data.payload.themeColor,
                nftBountyValue: data.payload.nftBountyValue,
                joinCommunityUrl: data.payload.joinCommunityUrl ? data.payload.joinCommunityUrl : undefined,
                symbol: data.payload.symbol,
                creatorID: context.auth.uid as UserID,
                tournamentID: data.payload.tournamentID,
            },
            filter: {
                fromBlock: data.fromBlock,
                // address: data.listenAddress,
                // topics: [topic],
            },
        };
        logger.debug("Enqueing task", taskData);
        const queue = fun.taskQueue("indexLootboxOnCreate");
        await queue.enqueue(taskData);

        return;
    }
);

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
    .runWith({
        timeoutSeconds: 540,
        failurePolicy: true,
        secrets: [stampSecretName],
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

export const enqueueLootboxOnMint = functions.https.onCall(
    async (data: EnqueueLootboxOnMintCallableRequest, context) => {
        if (!context.auth?.uid) {
            // Unauthenticated
            logger.error("Unauthenticated");
            return;
        }

        if (!ethers.utils.isAddress(data.lootboxAddress)) {
            logger.error("Address not valid", { listenAddress: data.lootboxAddress });
            return;
        }

        const chainSlug = chainIdHexToSlug(data.chainIDHex);
        if (!chainSlug) {
            logger.warn("Could not match chain", { chainIdHex: data.chainIDHex });
            return;
        }
        const chain = BLOCKCHAINS[chainSlug];

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
        logger.debug("Enqueing task", taskData);
        const queue = fun.taskQueue("indexLootboxOnMint");
        await queue.enqueue(taskData);

        return;
    }
);
