import { db } from "./api/firebase";
import * as functions from "firebase-functions";
import { Claim, ClaimStatus, PartyBasket, PartyBasketStatus } from "./api/graphql/generated/types";
import { Collection } from "./lib/types";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

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
