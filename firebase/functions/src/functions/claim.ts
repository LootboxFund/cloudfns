import { db } from "../api/firebase";
import * as functions from "firebase-functions";
import { Claim_Firestore, ClaimStatus_Firestore, Collection } from "@wormgraph/helpers";
import { manifest, SecretName } from "../manifest";
import { logger } from "firebase-functions";
import { PartyBasket } from "../api/graphql/generated/types";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import * as claimService from "../service/claim";

const REGION = manifest.cloudFunctions.region;
const whitelisterPrivateKeySecretName: SecretName = "PARTY_BASKET_WHITELISTER_PRIVATE_KEY";

export const onClaimWrite = functions
    .region(REGION)
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
            if (newClaim.status === ClaimStatus_Firestore.complete && isStatusChanged) {
                logger.log("claim service: claim completed callback", { claimData: newClaim });
                await claimService.claimCompletedCallback({
                    claim: newClaim,
                });
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
