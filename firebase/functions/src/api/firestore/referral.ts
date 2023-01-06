import {
    ClaimID,
    ClaimStatus_Firestore,
    ClaimTimestamps_Firestore,
    ClaimType_Firestore,
    Claim_Firestore,
    Collection,
    LootboxID,
    LootboxTicketID,
    LootboxTicket_Firestore,
    Lootbox_Firestore,
    ReferralID,
    ReferralType_Firestore,
    Referral_Firestore,
    TournamentID,
    Tournament_Firestore,
    UserID,
} from "@wormgraph/helpers";
import {
    CollectionGroup,
    DocumentReference,
    DocumentSnapshot,
    FieldValue,
    Query,
    Timestamp,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import { ClaimStatus, ClaimType } from "../graphql/generated/types";

export const getReferralById = async (id: ReferralID): Promise<Referral_Firestore | undefined> => {
    const collectionRef = (await db
        .collection(Collection.Referral)
        .doc(id)
        .get()) as DocumentSnapshot<Referral_Firestore>;

    if (collectionRef.exists) {
        return collectionRef.data();
    } else {
        return undefined;
    }
};

export const getUnassignedClaimsForUser = async (
    claimerUserID: UserID
    // lootboxID: LootboxID
): Promise<Claim_Firestore[]> => {
    // const lootboxIDField: keyof Claim_Firestore = "lootboxID";
    const claimStatusField: keyof Claim_Firestore = "status";
    const whitelistIDField: keyof Claim_Firestore = "whitelistId";
    const claimerIDField: keyof Claim_Firestore = "claimerUserId";

    const collectionGroupRef = db
        .collectionGroup(Collection.Claim)
        .where(claimerIDField, "==", claimerUserID)
        // .where(lootboxIDField, "==", lootboxID)
        .where(claimStatusField, "==", ClaimStatus_Firestore.complete)
        .where(whitelistIDField, "==", null) as CollectionGroup<Claim_Firestore>;

    const snapshot = await collectionGroupRef.get();

    if (!snapshot || snapshot.empty) {
        return [];
    } else {
        return snapshot.docs.map((doc) => doc.data());
    }
};

export const getUnverifiedClaimsForUser = async (claimerUserID: UserID): Promise<Claim_Firestore[]> => {
    const claimStatusField: keyof Claim_Firestore = "status";
    const claimerIDField: keyof Claim_Firestore = "claimerUserId";

    const collectionGroupRef = db
        .collectionGroup(Collection.Claim)
        .where(claimerIDField, "==", claimerUserID)
        // .where(lootboxIDField, "==", lootboxID)
        .where(claimStatusField, "==", ClaimStatus_Firestore.unverified) as CollectionGroup<Claim_Firestore>;

    const snapshot = await collectionGroupRef.get();

    if (!snapshot || snapshot.empty) {
        return [];
    } else {
        return snapshot.docs.map((doc) => doc.data());
    }
};

// export const getUnassignedClaimRefsForLootbox = async (
//     lootboxID: LootboxID
// ): Promise<DocumentReference<Claim_Firestore>[]> => {
//     const lootboxSatusField: keyof Claim_Firestore = "status";
//     const whitelistIDField: keyof Claim_Firestore = "whitelistId";
//     const lootboIDField: keyof Claim_Firestore = "lootboxID";

//     const collectionGroupRef = db
//         .collectionGroup(Collection.Claim)
//         .where(lootboIDField, "==", lootboxID)
//         .where(lootboxSatusField, "==", ClaimStatus_Firestore.complete)
//         .where(whitelistIDField, "==", null) as CollectionGroup<Claim_Firestore>;

//     const snapshot = await collectionGroupRef.get();

//     if (!snapshot || snapshot.empty) {
//         return [];
//     } else {
//         return snapshot.docs.map((doc) => doc.ref);
//     }
// };

export const getCompletedClaimsForLootbox = async (lootboxID: LootboxID): Promise<Claim_Firestore[]> => {
    const lootboxIDField: keyof Claim_Firestore = "lootboxID";
    const claimStatusField: keyof Claim_Firestore = "status";
    const collectionGroupRef = db
        .collectionGroup(Collection.Claim)
        .where(lootboxIDField, "==", lootboxID)
        .where(claimStatusField, "==", ClaimStatus_Firestore.complete) as CollectionGroup<Claim_Firestore>;

    const snapshot = await collectionGroupRef.get();

    if (!snapshot || snapshot.empty) {
        return [];
    } else {
        return snapshot.docs.map((doc) => doc.data());
    }
};

export const getCompletedUserReferralClaimsForTournament = async (
    userId: UserID,
    tournamentId: TournamentID,
    limit?: number
): Promise<Claim_Firestore[]> => {
    let collectionRef = db
        .collectionGroup(Collection.Claim)
        .where("tournamentId", "==", tournamentId)
        .where("claimerUserId", "==", userId)
        .where("type", "==", ClaimType.Referral)
        .where("status", "==", ClaimStatus.Complete) as Query<Claim_Firestore>;

    if (limit !== undefined) {
        collectionRef = collectionRef.limit(limit);
    }

    const collectionSnapshot = await collectionRef.get();
    if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
        return [];
    } else {
        return collectionSnapshot.docs.map((doc) => doc.data());
    }
};

export const getCompletedClaimsForReferral = async (
    referralId: ReferralID,
    limit?: number
): Promise<Claim_Firestore[]> => {
    let collectionRef = db
        .collectionGroup(Collection.Claim)
        .where("referralId", "==", referralId)
        .where("status", "==", ClaimStatus.Complete) as Query<Claim_Firestore>;

    if (limit !== undefined) {
        collectionRef = collectionRef.limit(limit);
    }

    const collectionSnapshot = await collectionRef.get();
    if (collectionSnapshot.empty || collectionSnapshot?.docs?.length === 0) {
        return [];
    } else {
        return collectionSnapshot.docs.map((doc) => doc.data());
    }
};

interface TransitionToCompleteRequest {
    claimID: ClaimID;
    referralID: ReferralID;
}
export const transitionClaimToComplete = async (
    req: TransitionToCompleteRequest
): Promise<Claim_Firestore | undefined> => {
    const timestampFN: keyof Claim_Firestore = "timestamps";
    const completedAtFN: keyof Claim_Firestore["timestamps"] = "completedAt";
    const doc = db
        .collection(Collection.Referral)
        .doc(req.referralID)
        .collection(Collection.Claim)
        .doc(req.claimID) as DocumentReference<Claim_Firestore>;

    await doc.update({
        status: ClaimStatus_Firestore.complete,
        [`${timestampFN}.${completedAtFN}`]: Timestamp.now().toMillis(),
    });

    const newdoc = await doc.get();
    return newdoc.data();
};

interface TransitionToCompleteRequest {
    claimID: ClaimID;
    referralID: ReferralID;
}
export const transitionClaimToExpired = async (
    req: TransitionToCompleteRequest
): Promise<Claim_Firestore | undefined> => {
    const doc = db
        .collection(Collection.Referral)
        .doc(req.referralID)
        .collection(Collection.Claim)
        .doc(req.claimID) as DocumentReference<Claim_Firestore>;

    await doc.update({
        status: ClaimStatus_Firestore.expired,
    });

    const newdoc = await doc.get();
    return newdoc.data();
};

interface ClaimCompleteBatchUpdatePayload {
    ownerUserID: UserID;
    claimID: ClaimID;
    lootboxID: LootboxID;
    tournamentID: TournamentID;
    referralID: ReferralID;
}
/**
 * Handles claim complete callback for firestore updates in a batch
 * - Create the web2 ticket
 * - Update Claim_Firestore with web2 ticket ID
 * - Increments tournament running claims
 * - Increments lootbox running claims
 * - Creates bonus claim if required
 * @param payload
 */
export const handleClaimCompletedBatchUpdate = async (payload: ClaimCompleteBatchUpdatePayload): Promise<void> => {
    const batch = db.batch();

    const ticketRef = db
        .collection(Collection.Lootbox)
        .doc(payload.lootboxID)
        .collection(Collection.LootboxTicket)
        .doc() as DocumentReference<LootboxTicket_Firestore>;

    // Creates the web2 ticket
    const ticketDocument: LootboxTicket_Firestore = {
        createdAt: Timestamp.now().toMillis(),
        lootboxID: payload.lootboxID,
        id: ticketRef.id as LootboxTicketID,
        ownerUserID: payload.ownerUserID,
    };

    // We need to update the claim with ticketID
    const claimRef = db
        .collection(Collection.Referral)
        .doc(payload.referralID)
        .collection(Collection.Claim)
        .doc(payload.claimID);

    const timestampName: keyof Claim_Firestore = "timestamps";
    const updatedAtName: keyof ClaimTimestamps_Firestore = "updatedAt";

    const claimUpdateReq: Partial<Claim_Firestore> = {
        ticketID: ticketRef.id as LootboxTicketID,
        [`${timestampName}.${updatedAtName}`]: Timestamp.now().toMillis(),
    };

    // Update the running claim counts
    const lootboxRef = db.collection(Collection.Lootbox).doc(payload.lootboxID) as DocumentReference<Lootbox_Firestore>;

    const lootboxUpdateReq: Partial<Lootbox_Firestore> = {
        runningCompletedClaims: FieldValue.increment(1) as unknown as number,
    };

    // Update the running tournament claim counts
    const tournamentRef = db
        .collection(Collection.Tournament)
        .doc(payload.tournamentID) as DocumentReference<Tournament_Firestore>;

    const tournamentUpdateReq: Partial<Tournament_Firestore> = {
        runningCompletedClaims: FieldValue.increment(1) as unknown as number,
    };

    batch.create(ticketRef, ticketDocument);
    batch.update(claimRef, claimUpdateReq);
    batch.update(lootboxRef, lootboxUpdateReq);
    batch.update(tournamentRef, tournamentUpdateReq);

    // const _currentAmount = payload.lootbox.runningCompletedClaims || 0;
    // const _maxAmount = payload.lootbox.maxTickets || 10000;
    // const _newCurrentAmount = _currentAmount + 1; // Since we increment by one in handleClaimCompletedBatchUpdate

    // const createBonusClaim: boolean =
    //     payload.claim.referralType === ReferralType_Firestore.viral &&
    //     payload.claim.type === ClaimType_Firestore.referral &&
    //     !!payload.claim.referrerId &&
    //     _newCurrentAmount < _maxAmount;

    // if (createBonusClaim && payload.claim.referrerId) {
    //     const bonusClaimRef = db
    //         .collection(Collection.Referral)
    //         .doc(payload.claim.referralId)
    //         .collection(Collection.Claim)
    //         .doc() as DocumentReference<Claim_Firestore>;

    //     const timestamp = Timestamp.now().toMillis();

    //     const bonusClaimBody: Claim_Firestore = {
    //         id: bonusClaimRef.id as ClaimID,
    //         referralId: payload.claim.referralId,
    //         tournamentId: payload.tournament.id,
    //         tournamentName: payload.tournament.title,
    //         referralSlug: payload.claim.referralSlug,
    //         referralCampaignName: payload.claim.referralCampaignName || "",
    //         rewardFromClaim: payload.claim.id,
    //         claimerUserId: payload.claim.referrerId,
    //         referrerId: null,
    //         whitelistId: null,
    //         isPostCosmic: true,
    //         status: ClaimStatus_Firestore.complete,
    //         type: ClaimType_Firestore.reward,
    //         referralType: ReferralType_Firestore.viral,
    //         lootboxID: payload.lootbox.id,
    //         lootboxAddress: payload.lootbox.address || null,
    //         lootboxName: payload.lootbox.name,
    //         lootboxMaxTickets: payload.lootbox.maxTickets,
    //         privacyScope: [], // since these a bonus claims, they have not consented
    //         ticketWeb3ID: null, // this will be filled out later in indexLootboxOnMint
    //         ticketID: null, // this will be filled out later in indexLootboxOnMint
    //         whitelistedAddress: null, // gets filled out later on the fly when user requests it
    //         timestamps: {
    //             createdAt: timestamp,
    //             updatedAt: timestamp,
    //             deletedAt: null,
    //             completedAt: timestamp,
    //             whitelistedAt: null,
    //             mintedAt: null,
    //         },
    //         rewardFromFriendReferred: payload.claim.claimerUserId,
    //     };

    //     if (payload.lootbox.nftBountyValue) {
    //         bonusClaimBody.lootboxNFTBountyValue = payload.lootbox.nftBountyValue;
    //     }

    //     batch.create(bonusClaimRef, bonusClaimBody);
    // }

    await batch.commit();

    return;
};

interface CreateBonusClaimPayload {
    // ownerUserID: UserID;
    claim: Claim_Firestore;
    lootbox: Lootbox_Firestore;
    tournament: Tournament_Firestore;
    bonusRewardReceiver: UserID;
}

export const createBonusClaim = async (payload: CreateBonusClaimPayload): Promise<void> => {
    const bonusClaimRef = db
        .collection(Collection.Referral)
        .doc(payload.claim.referralId)
        .collection(Collection.Claim)
        .doc() as DocumentReference<Claim_Firestore>;

    const timestamp = Timestamp.now().toMillis();

    const bonusClaimBody: Claim_Firestore = {
        id: bonusClaimRef.id as ClaimID,
        referralId: payload.claim.referralId,
        tournamentId: payload.tournament.id,
        tournamentName: payload.tournament.title,
        referralSlug: payload.claim.referralSlug,
        referralCampaignName: payload.claim.referralCampaignName || "",
        rewardFromClaim: payload.claim.id,
        claimerUserId: payload.bonusRewardReceiver,
        referrerId: null,
        whitelistId: null,
        isPostCosmic: true,
        status: ClaimStatus_Firestore.complete,
        type: ClaimType_Firestore.reward,
        referralType: ReferralType_Firestore.viral,
        lootboxID: payload.lootbox.id,
        lootboxAddress: payload.lootbox.address || null,
        lootboxName: payload.lootbox.name,
        lootboxMaxTickets: payload.lootbox.maxTickets,
        privacyScope: [], // since these a bonus claims, they have not consented
        ticketWeb3ID: null, // this will be filled out later in indexLootboxOnMint
        ticketID: null, // this will be filled out later in indexLootboxOnMint
        whitelistedAddress: null, // gets filled out later on the fly when user requests it
        timestamps: {
            createdAt: timestamp,
            updatedAt: timestamp,
            deletedAt: null,
            completedAt: timestamp,
            whitelistedAt: null,
            mintedAt: null,
        },
        rewardFromFriendReferred: payload.claim.claimerUserId,
    };

    if (payload.lootbox.nftBountyValue) {
        bonusClaimBody.lootboxNFTBountyValue = payload.lootbox.nftBountyValue;
    }

    // batch.create(bonusClaimRef, bonusClaimBody);

    await bonusClaimRef.set(bonusClaimBody);

    return;
};

export const getUserClaimCountForTournament = async (tournamentID: TournamentID, userID: UserID): Promise<number> => {
    const claimerUserIDField: keyof Claim_Firestore = "claimerUserId";
    const statusField: keyof Claim_Firestore = "status";
    const query = await db
        .collectionGroup(Collection.Claim)
        .where(claimerUserIDField, "==", userID)
        .where(statusField, "==", ClaimStatus_Firestore.complete)
        .get();

    return query.docs.length;
};

export const getUserClaimCountForLootbox = async (lootboxID: LootboxID, userID: UserID): Promise<number> => {
    const claimerUserIDField: keyof Claim_Firestore = "claimerUserId";
    const statusField: keyof Claim_Firestore = "status";
    const lootboxIDField: keyof Claim_Firestore = "lootboxID";
    const query = await db
        .collectionGroup(Collection.Claim)
        .where(claimerUserIDField, "==", userID)
        .where(statusField, "==", ClaimStatus_Firestore.complete)
        .where(lootboxIDField, "==", lootboxID)
        .get();

    return query.docs.length;
};
