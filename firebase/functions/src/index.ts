import { db } from "./api/firebase";
import * as functions from "firebase-functions";
import {
    Ad,
    AdEvent,
    AdEventAction,
    Claim,
    ClaimStatus,
    PartyBasket,
    PartyBasketStatus,
} from "./api/graphql/generated/types";
import { AdID, CampaignID, Collection, FlightID } from "./lib/types";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { Message } from "firebase-functions/v1/pubsub";
import { extractURLStatePixelTracking } from "./lib/url";
import { createAdEvent, getAdById, getAdEventsBySessionId, updateAdCounts } from "./api/firestore";

const DEFAULT_MAX_CLAIMS = 10000;

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
    // TODO: topic from manifest
    .topic("pixel-tracking-staging")
    .onPublish(async (message: Message) => {
        logger.log("PUB SUB TRIGGERED", message);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let jsonData: any;
        try {
            jsonData = message.json;
            logger.log("parsed data", jsonData);
        } catch (e) {
            logger.error("PubSub message was not JSON", e);
            return;
        }

        const url = jsonData?.httpRequest?.requestUrl;

        if (!url) {
            logger.error("Cache not hit, or URL not in payload");
            return;
        }

        const { adId, sessionId, eventAction } = extractURLStatePixelTracking(url);

        let ad: Ad;
        let createdEvent: AdEvent;

        try {
            if (!adId || !sessionId || !eventAction) {
                logger.error("Malformed URL", url);
                return;
            }

            if (!Object.values(AdEventAction).includes(eventAction as AdEventAction)) {
                logger.error("Invalid event Action provided...");
                return;
            }

            // make sure the ad exists
            const _ad = await getAdById(adId);

            if (!_ad) {
                logger.error("Ad does not exist", adId);
                return;
            }

            ad = _ad;

            // Now write the AdEvent subcollection document
            createdEvent = await createAdEvent({
                action: eventAction,
                adId: ad.id as AdID,
                campaignId: ad.campaignId as CampaignID,
                flightId: ad.flightId as FlightID,
                sessionId,
            });

            logger.info("Successfully created ad event", createdEvent.id);
        } catch (err) {
            logger.error("Pubsub error", err);
            return;
        }

        // Now update the tallies on the ad (views, impressions, & unique clicks)
        const updateRequest: Partial<Ad> = {};
        if (eventAction === AdEventAction.Click) {
            // Update clicks
            updateRequest.clicks = FieldValue.increment(1) as unknown as number;
            // See if its unique click by the sessionId on the ad-events
            try {
                const sessionAdEvents = await getAdEventsBySessionId(ad.id as AdID, sessionId, 2);
                if (sessionAdEvents.length === 1) {
                    // Update uniqueClicks
                    updateRequest.uniqueClicks = FieldValue.increment(1) as unknown as number;
                }
            } catch (err) {
                logger.error("Error checking click uniqueness!", err);
            }
        } else if (eventAction === AdEventAction.View) {
            updateRequest.impressions = FieldValue.increment(1) as unknown as number;
        }

        if (Object.keys(updateRequest).length === 0) {
            // Nothing to update
            return;
        }

        try {
            await updateAdCounts(ad.id as AdID, updateRequest);
        } catch (err) {
            logger.error("Error updating ad counts...", err);
            return;
        }

        return;
    });
