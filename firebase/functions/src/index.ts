import { db } from "./api/firebase";
import * as functions from "firebase-functions";
import { AdEventAction, Claim, ClaimStatus, PartyBasket, PartyBasketStatus } from "./api/graphql/generated/types";
import { AdID, CampaignID, Collection, FlightID } from "./lib/types";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { Message } from "firebase-functions/v1/pubsub";
import { extractURLStatePixelTracking } from "./lib/url";
import { createAdEvent, getAdById } from "./api/firestore";

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

export const pubsubPixelTracking = functions.pubsub
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

        try {
            const url = jsonData?.httpRequest?.requestUrl;
            const cacheHit = jsonData?.httpRequest?.cacheHit;

            if (!cacheHit || !url) {
                logger.error("Cache not hit, or URL not in payload");
                return;
            }

            const { adId, sessionId, eventAction } = extractURLStatePixelTracking(url);

            if (!adId || !sessionId || !eventAction) {
                logger.error("Malformed URL", url);
                return;
            }

            if (!Object.values(AdEventAction).includes(eventAction as AdEventAction)) {
                logger.error("Invalid event Action provided...");
                return;
            }

            // make sure the ad exists
            const ad = await getAdById(adId);

            if (!ad) {
                logger.error("Ad does not exist", adId);
                return;
            }

            // Now write the AdEvent subcollection document
            const createdEvent = await createAdEvent({
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
    });
