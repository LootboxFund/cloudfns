import * as functions from "firebase-functions";
import {
    AdEvent_Firestore,
    AdFlight_Firestore,
    AdID,
    MeasurementPartnerType,
    tableActivationIngestorRoutes,
    ActivationIngestorRoute_LootboxAppWebsiteVisit_Body,
} from "@wormgraph/helpers";
import {
    createAdEvent,
    getAdEventsBySessionId,
    updateAdCounts,
    getAdEventsByNonce,
    getFlightById,
} from "../api/firestore";
import { checkIfOfferIncludesLootboxAppWebsiteVisit, reportViewToMMP } from "../api/mmp/mmp";
import axios from "axios";
import { manifest } from "../manifest";
import { extractURLStatePixelTracking } from "../lib/url";
import { Message } from "firebase-functions/v1/pubsub";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { Ad, AdEventAction } from "../api/graphql/generated/types";

const REGION = manifest.cloudFunctions.region;

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
export const pubsubPixelTracking = functions
    .region(REGION)
    .pubsub.topic(manifest.cloudFunctions.pubsubPixelTracking.topic)
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
