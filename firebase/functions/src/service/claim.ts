import {
    User_Firestore,
    ClaimStatus_Firestore,
    ClaimType_Firestore,
    Claim_Firestore,
    ReferralType_Firestore,
    ReferralID,
    LootboxStatus_Firestore,
    LootboxTournamentStatus_Firestore,
    Lootbox_Firestore,
    Tournament_Firestore,
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
    handleClaimCompletedBatchUpdate,
    createBonusClaim,
    getUserClaimCountForTournament,
    getUserClaimCountForLootbox,
} from "../api/firestore";
import * as functions from "firebase-functions";
import { logger } from "firebase-functions";

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

    const { safetyFeatures: lootboxSafety } = lootbox;
    const { safetyFeatures: tournamentSafety } = tournament;
    const isOwnerMadeReferral = referral.creatorId === tournament.creatorId || referral.creatorId === lootbox.creatorID;
    if (lootboxSafety?.isExclusiveLootbox && (!isOwnerMadeReferral || lootbox.id !== referral.seedLootboxID)) {
        return false;
    }

    // get user tickets for this lootbox & tournamet
    const [userLootboxTicketCount, userTournamentTicketCount] = await Promise.all([
        getUserClaimCountForTournament(tournament.id, user.id),
        getUserClaimCountForLootbox(lootbox.id, user.id),
    ]);

    if (
        userLootboxTicketCount >= (lootboxSafety?.maxTicketsPerUser || 5) ||
        userTournamentTicketCount >= (tournamentSafety?.maxTicketsPerUser || 100)
    ) {
        // If user has already claimed max tickets for this lootbox or tournament, no bonus reward
        logger.warn("User already has max amount of allowed tickets", {
            userLootboxTicketCount,
            userTournamentTicketCount,
            maxTicketsPerUser: lootboxSafety?.maxTicketsPerUser || 5,
            maxTicketsPerUserTournament: tournamentSafety?.maxTicketsPerUser || 100,
            claimID: claim.id,
            referralID: claim.referralId,
        });
        return false;
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

interface ClaimCompletedCallbackRequest {
    claim: Claim_Firestore;
}
export const claimCompletedCallback = async (request: ClaimCompletedCallbackRequest) => {
    logger.log("claim completed callback", {
        referralID: request.claim.referralId,
        claimID: request.claim.id,
        lootboxID: request.claim.lootboxID,
    });

    if (!request.claim.lootboxID) {
        logger.error("no lootboxID", { claimID: request.claim.id });
        return;
    }

    if (!request.claim.claimerUserId) {
        logger.error("no claimerUserID", { claimID: request.claim.id });
        return;
    }

    let lootbox: Lootbox_Firestore | undefined;
    let tournament: Tournament_Firestore | undefined;

    try {
        [lootbox, tournament] = await Promise.all([
            getLootbox(request.claim.lootboxID),
            getTournamentByID(request.claim.tournamentId),
        ]);
        if (!lootbox) {
            throw new Error("Lootbox not found");
        }
        if (!tournament) {
            throw new Error("Tournament not found");
        }
        if (lootbox.status === LootboxStatus_Firestore.disabled || lootbox.status === LootboxStatus_Firestore.soldOut) {
            throw new Error("Lootbox disabled or sold out");
        }
    } catch (err) {
        logger.error("error fetching lootbox", { lootboxID: request.claim.lootboxID, err });
        return;
    }

    // Validate tournament & lootbox safety settings for the bonus claim
    try {
        await Promise.allSettled([
            handleClaimCompletedBatchUpdate({
                ownerUserID: request.claim.claimerUserId,
                claimID: request.claim.id,
                lootboxID: lootbox.id,
                tournamentID: tournament.id,
                referralID: request.claim.referralId,
            }),
            handleBonusRewardClaim({
                lootbox,
                claim: request.claim,
                tournament,
            }),
        ]);
    } catch (err) {
        logger.error("Error batch updating claims onClaimCompleteCallback", err);
        return;
    }

    return;
};

interface BonusRewardClaimServiceRequest {
    claim: Claim_Firestore;
    lootbox: Lootbox_Firestore;
    tournament: Tournament_Firestore;
}

const handleBonusRewardClaim = async (payload: BonusRewardClaimServiceRequest) => {
    const bonusRewardReceiver = payload.claim.referrerId;

    // Checks if bonus reward is eligible
    if (!bonusRewardReceiver) {
        logger.info("bonus reward not eligible, no referrer", {
            claimID: payload.claim.id,
            referralID: payload.claim.referralId,
        });
        return;
    }

    // Make sure tournent & lootbox not sold out
    const _currentAmount = payload.lootbox.runningCompletedClaims || 0;
    const _maxAmount = payload.lootbox.maxTickets || 10000;
    const _newCurrentAmount = _currentAmount + 1; // Since we increment by one in handleClaimCompletedBatchUpdate

    const toCreateBonusClaim: boolean =
        payload.claim.referralType === ReferralType_Firestore.viral &&
        payload.claim.type === ClaimType_Firestore.referral &&
        _newCurrentAmount < _maxAmount;

    if (!toCreateBonusClaim) {
        logger.info("bonus reward not eligible, not viral referral or claim type or saturated", {
            claimID: payload.claim.id,
            referralID: payload.claim.referralId,
        });

        return;
    }

    const { safetyFeatures: lootboxSafety } = payload.lootbox;
    const { safetyFeatures: tournamentSafety } = payload.tournament;

    if (lootboxSafety?.isExclusiveLootbox) {
        // If sharing is disabled, no bonus reward
        logger.info("Bonus rewards are disabled for this lootbox");
        return;
    }

    // get user tickets for this lootbox & tournamet
    const [userLootboxTicketCount, userTournamentTicketCount] = await Promise.all([
        getUserClaimCountForTournament(payload.tournament.id, bonusRewardReceiver),
        getUserClaimCountForLootbox(payload.lootbox.id, bonusRewardReceiver),
    ]);

    if (
        userLootboxTicketCount >= (lootboxSafety?.maxTicketsPerUser || 5) ||
        userTournamentTicketCount >= (tournamentSafety?.maxTicketsPerUser || 100)
    ) {
        // If user has already claimed max tickets for this lootbox or tournament, no bonus reward
        logger.warn("User already has max amount of allowed tickets", {
            userLootboxTicketCount,
            userTournamentTicketCount,
            maxTicketsPerUser: lootboxSafety?.maxTicketsPerUser || 5,
            maxTicketsPerUserTournament: tournamentSafety?.maxTicketsPerUser || 100,
            claimID: payload.claim.id,
            referralID: payload.claim.referralId,
        });
        return;
    }

    // Creates the bonus reward
    return createBonusClaim({
        claim: payload.claim,
        lootbox: payload.lootbox,
        tournament: payload.tournament,
        bonusRewardReceiver,
    });
};
