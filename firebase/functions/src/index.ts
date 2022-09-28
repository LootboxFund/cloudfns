import { db, fun } from "./api/firebase";
import * as functions from "firebase-functions";
import { Ad, AdEventAction, Claim, ClaimStatus, PartyBasket, PartyBasketStatus } from "./api/graphql/generated/types";
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
} from "@wormgraph/helpers";
import LootboxCosmicFactoryABI from "@wormgraph/helpers/lib/abi/LootboxCosmicFactory.json";
import { reportViewToMMP } from "./api/mmp/mmp";
import { generateMemoBills } from "./api/firestore/memo";
import { ethers } from "ethers";
import { decodeLootboxCreatedEvent } from "./api/evm";
import * as lootboxService from "./service/lootbox";
import { getLootboxByChainAddress } from "./api/firestore/lootbox";
import { FormatTypes } from "ethers/lib/utils";

const DEFAULT_MAX_CLAIMS = 10000;
const stampSecretName: SecretName = "STAMP_SECRET";

/** @deprecated no longer using party baskets */
export const onClaimWrite = functions.firestore
    .document(`/${Collection.Referral}/{referralId}/${Collection.Claim}/{claimId}`)
    .onWrite(async (snap) => {
        // Grab the current value of what was written to Firestore.
        const oldClaim = snap.before.data() as Claim | undefined;
        const newClaim = snap.after.data() as Claim | undefined;

        if (!newClaim) {
            return;
        }

        const isStatusChanged = newClaim.status !== oldClaim?.status;

        if (newClaim.status === ClaimStatus.Complete && isStatusChanged && newClaim.chosenPartyBasketId) {
            logger.log("incrementing party basket completedClaims");
            try {
                const partyBasketRef = db
                    .collection(Collection.PartyBasket)
                    .doc(newClaim.chosenPartyBasketId) as DocumentReference<Claim>;

                const updateReq: Partial<PartyBasket> = {
                    runningCompletedClaims: FieldValue.increment(1) as unknown as number,
                };

                await partyBasketRef.update(updateReq);
            } catch (err) {
                logger.error("Error onClaimWrite", err);
            }
        }

        // // If it is a viral claim, write the reward claim...
        // if (newClaim.status === ClaimStatus.Complete && isStatusChanged && newClaim.type === ClaimType.Referral) {
        //     // write the reward claim TODO
        // }

        return;
    });

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
            logger.log("parsed data", jsonData?.httpRequest);
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
            flightId,
            eventAction,
            nonce,
            timeElapsed,
        } = extractURLStatePixelTracking(url);

        // get for existing flight
        let flight: AdFlight_Firestore;
        let createdEvent: AdEvent_Firestore;

        try {
            if (!flightId || !eventAction || !nonce) {
                logger.error("Malformed URL", url);
                return;
            }

            if (!Object.values(AdEventAction).includes(eventAction as AdEventAction)) {
                logger.error("Invalid event Action provided...");
                return;
            }

            flight = await getFlightById(flightId);

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
        const AdEventID = message.data;
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
        const memos = await generateMemoBills(adEvent);
        console.log(memos);
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
        nonce: LootboxCreatedNonce;
    };
    filter: {
        fromBlock: number;
        address: Address; // Contract address to listen to
        topics: string[]; // I.e. ethers.utils.solidityKeccak256(['string'], ['LootboxCreated(string,address,address,address,uint256,uint256,string)'])
    };
}

export const indexLootboxOnCreate = functions
    .runWith({
        timeoutSeconds: 540,
        // failurePolicy: true,  // TODO FIX THIS
        secrets: [stampSecretName],
    })
    .tasks.taskQueue({
        retryConfig: {
            maxAttempts: 5,
        },
    })
    .onDispatch(async (data: IndexLootboxOnCreateTaskRequest) => {
        logger.info("indexLootboxOnCreate", { data });
        // Any errors thrown or timeouts will trigger a retry

        // Start a listener to listen for the event

        const provider = new ethers.providers.JsonRpcProvider(data.chain.rpcUrls[0]);

        const lootboxFactory = new ethers.Contract(data.payload.factory, LootboxCosmicFactoryABI, provider);

        // See if the event has already been recoreded on the block
        // eslint-disable-next-line
        const lootboxEventFilter = lootboxFactory.filters.LootboxCreated(
            null,
            null,
            null,
            null,
            null,
            data.payload.nonce
        );
        const events = await lootboxFactory.queryFilter(lootboxEventFilter, data.filter.fromBlock);
        logger.info("past events", events);

        // const lootboxCreatedEvents = await lootboxFactory.queryFilter(
        //     lootboxFactory.filters.LootboxCreated(
        //         data.payload.creatorID,
        //         null,
        //         null,
        //         null,
        //         null,
        //         null,
        //         data.payload.nonce
        //     ),
        //     data.filter.fromBlock
        // );

        await new Promise((res) => {
            logger.info("Starting listener", data);
            logger.info("provider", provider);
            logger.info("getting network...");
            provider
                .getNetwork()
                .then((net) => logger.info("provider network", { network: net }))
                .catch((err) => {
                    logger.error(err);
                });
            logger.info("filter", data.filter);
            // provider.on(data.filter, async (log) => {
            lootboxFactory.on(lootboxEventFilter, async (log) => {
                logger.debug("Got log", { log });
                if (log === undefined) {
                    return;
                }
                const decodedLog = decodeLootboxCreatedEvent(log);
                logger.info("Decoded log", { decodedLog });
                const { lootboxName, issuer, maxTickets, lootbox: lootboxAddress, nonce, baseTokenURI } = decodedLog;

                if (!lootboxAddress || !issuer || !maxTickets || !lootboxName || !nonce || !baseTokenURI) {
                    logger.warn("invalid event", decodedLog);
                    return;
                }

                // Make sure its the right event
                if (nonce !== data.payload.nonce) {
                    logger.info("Nonce does not match", { nonce, expectedNonce: data.payload.nonce });
                    return;
                }

                try {
                    // make sure lootbox not created yet
                    const _lootbox = await getLootboxByChainAddress(lootboxAddress, data.chain.chainIdHex);
                    if (_lootbox) {
                        logger.warn("Lootbox already created", { lootbox: decodedLog.lootbox });
                        res(null);
                        return;
                    }

                    // Get the lootbox info
                    await lootboxService.create(
                        {
                            factory: data.payload.factory,
                            lootboxDescription: data.payload.lootboxDescription,
                            backgroundImage: data.payload.backgroundImage,
                            logoImage: data.payload.logoImage,
                            themeColor: data.payload.themeColor,
                            nftBountyValue: data.payload.nftBountyValue,
                            joinCommunityUrl: data.payload.joinCommunityUrl ? data.payload.joinCommunityUrl : undefined,
                            lootboxAddress: decodedLog.lootbox,
                            blockNumber: log.blockNumber,
                            lootboxName: decodedLog.lootboxName,
                            transactionHash: log.transactionHash || log.hash,
                            creatorAddress: issuer,
                            maxTickets: maxTickets,
                            creatorID: data.payload.creatorID,
                            baseTokenURI: baseTokenURI,
                        },
                        data.chain
                    );
                    provider.removeAllListeners(data.filter);
                    res(null);
                    return;
                } catch (err) {
                    logger.error("Error creating lootbox", err);
                    return;
                }
            });
            logger.info("Started listener", data.filter);
        });
        logger.info("done listening", data.filter);
    });

export const enqueueIndexLootboxOnCreateTasks = functions.https.onCall(
    async (data: EnqueueLootboxOnCreateCallableRequest, context) => {
        // if (!context.auth?.uid) {
        //     // Unauthenticated
        //     return;
        // }

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

        const iface = new ethers.utils.Interface(JSON.stringify(LootboxCosmicFactoryABI));
        const _topic = iface.getEventTopic("LootboxCreated");
        const event = iface.getEvent("LootboxCreated");
        const minimalABISnippet = event.format(FormatTypes.sighash);
        const __topic = ethers.utils.id(minimalABISnippet);

        logger.log("minimalABISnippet ---> ", { minimalABISnippet });

        const topic = ethers.utils.solidityKeccak256(
            ["string"],
            // ["LootboxCreated(string,address,address,address,uint256,uint256,string)"]
            [minimalABISnippet]
        );

        logger.log(`logging topic diffs equal? ${_topic === topic}`, { _topic, topic });
        logger.log(`logging event 2 -- __topic ${__topic === topic}`, { __topic });

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

                creatorID: "testtest" as UserID, // TODO FIX THIS
                // creatorID: context.auth.uid as UserID, // implicit
            },
            filter: {
                fromBlock: data.fromBlock,
                address: data.listenAddress,
                // topics: [topic],
                topics: [__topic],
            },
        };
        logger.debug("Enqueing task", taskData);
        const queue = fun.taskQueue("indexLootboxOnCreate");
        await queue.enqueue(taskData);

        return;
    }
);
