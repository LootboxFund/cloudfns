import {
    User_Firestore,
    ClaimStatus_Firestore,
    ClaimType_Firestore,
    Claim_Firestore,
    ReferralType_Firestore,
    ReferralID,
    LootboxStatus_Firestore,
    LootboxTournamentStatus_Firestore,
} from "@wormgraph/helpers";
import {
    getCompletedUserReferralClaimsForTournament,
    getReferralById,
    getTournamentByID,
    getLootbox,
    getLootboxTournamentSnapshot,
    getCompletedClaimsForReferral,
    transitionClaimToComplete,
    transitionClaimToExpired,
} from "../api/firestore";
import * as functions from "firebase-functions";

export const validateUnverifiedUserClaim = async (user: User_Firestore, claim: Claim_Firestore) => {
    if (!claim.lootboxID || !claim.claimerUserId) {
        return false;
    }

    if (claim?.timestamps?.deletedAt) {
        return false;
    }

    if (claim.status !== ClaimStatus_Firestore.unverified) {
        return false;
    }

    if (!user.phoneNumber) {
        return false;
    }

    if (user.id === claim.referrerId) {
        // cant redeem own link
        return false;
    }

    if (!claim.lootboxID) {
        return false;
    }

    if (!claim.claimerUserId) {
        return false;
    }

    if (!claim || !!claim?.timestamps?.deletedAt) {
        return false;
    }

    if (claim.type === ClaimType_Firestore.reward) {
        return false;
    }

    const [previousClaims, tournament, referral, lootbox, lootboxTournamentSnapshot] = await Promise.all([
        getCompletedUserReferralClaimsForTournament(claim.claimerUserId, claim.tournamentId, 1),
        getTournamentByID(claim.tournamentId),
        getReferralById(claim.referralId),
        getLootbox(claim.lootboxID),
        getLootboxTournamentSnapshot(claim.lootboxID, claim.tournamentId),
    ]);

    if (!lootbox || !!lootbox?.timestamps?.deletedAt) {
        return false;
    }
    if (lootbox.status === LootboxStatus_Firestore.disabled || lootbox.status === LootboxStatus_Firestore.soldOut) {
        return false;
    }

    if (!lootboxTournamentSnapshot || !!lootboxTournamentSnapshot.timestamps.deletedAt) {
        return false;
    }

    if (lootboxTournamentSnapshot.status === LootboxTournamentStatus_Firestore.disabled) {
        return false;
    }

    if (!referral || !!referral.timestamps.deletedAt) {
        return false;
    }

    if (referral.referrerId === user.id) {
        return false;
    }
    if (!tournament || !!tournament.timestamps.deletedAt) {
        return false;
    }

    if (
        referral.type === ReferralType_Firestore.viral ||
        referral.type === ReferralType_Firestore.genesis ||
        claim.type === ClaimType_Firestore.referral
    ) {
        if (previousClaims.length > 0) {
            return false;
        }
    }

    if (referral.type === ReferralType_Firestore.one_time) {
        const previousClaimsForReferral = await getCompletedClaimsForReferral(referral.id as ReferralID, 1);
        if (previousClaimsForReferral.length > 0) {
            return false;
        }
    }

    return true;
};

export const transitionUnverifiedClaimToCompleted = async (
    user: User_Firestore,
    claim: Claim_Firestore
): Promise<Claim_Firestore | undefined> => {
    let isValidForTransition;
    try {
        isValidForTransition = await validateUnverifiedUserClaim(user, claim);
    } catch (err) {
        functions.logger.error("Error checking claim validity", err);
        isValidForTransition = false;
    }

    if (isValidForTransition) {
        functions.logger.info("Transitioning claim to complete", {
            claimID: claim.id,
            referralID: claim.referralId,
        });
        return transitionClaimToComplete({
            claimID: claim.id,
            referralID: claim.referralId,
        });
    } else {
        functions.logger.info("Transitioning claim to expired", {
            claimID: claim.id,
            referralID: claim.referralId,
        });
        return transitionClaimToExpired({
            claimID: claim.id,
            referralID: claim.referralId,
        });
    }
};
