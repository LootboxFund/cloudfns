import { db } from "../api/firebase";
import * as functions from "firebase-functions";
import {
    Claim_Firestore,
    ClaimStatus_Firestore,
    ReferralType_Firestore,
    ClaimType_Firestore,
    Lootbox_Firestore,
    Tournament_Firestore,
    Collection,
} from "@wormgraph/helpers";
import { incrementLootboxRunningClaims, getLootbox } from "../api/firestore";
import { manifest, SecretName } from "../manifest";
import { createRewardClaim } from "../api/firestore/referral";
import { getTournamentByID, incrementTournamentRunningClaims } from "../api/firestore/tournament";
import { logger } from "firebase-functions";
import { PartyBasket } from "../api/graphql/generated/types";
import { DocumentReference, FieldValue } from "firebase-admin/firestore";

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
            if (newClaim.status === ClaimStatus_Firestore.complete && isStatusChanged && newClaim.lootboxID) {
                logger.log("incrementing lootbox completedClaims", {
                    claimID: newClaim.id,
                    lootboxID: newClaim.lootboxID,
                });

                let lootbox: Lootbox_Firestore | undefined;
                let tournament: Tournament_Firestore | undefined;

                try {
                    [lootbox, tournament] = await Promise.all([
                        getLootbox(newClaim.lootboxID),
                        getTournamentByID(newClaim.tournamentId),
                    ]);
                    if (!lootbox) {
                        throw new Error("Lootbox not found");
                    }
                    if (!tournament) {
                        throw new Error("Tournament not found");
                    }
                } catch (err) {
                    logger.error("error fetching lootbox", { lootboxID: newClaim.lootboxID, err });
                    return;
                }

                try {
                    // Increment counts on lootbox & tournament
                    await Promise.all([
                        incrementLootboxRunningClaims(newClaim.lootboxID),
                        incrementTournamentRunningClaims(newClaim.tournamentId),
                    ]);
                } catch (err) {
                    logger.error("Error onClaimWrite incrementing counts", err);
                }

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
