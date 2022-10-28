import {
    ClaimID,
    ClaimStatus_Firestore,
    ClaimType_Firestore,
    Claim_Firestore,
    Collection,
    LootboxID,
    LootboxStatus_Firestore,
    ReferralID,
    ReferralSlug,
    ReferralType_Firestore,
    Referral_Firestore,
    TournamentID,
    UserID,
} from "@wormgraph/helpers";
import { CollectionGroup, DocumentReference, DocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { getLootbox } from "./lootbox";

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

interface CreateRewardClaimReq {
    lootboxID: LootboxID;
    referralId: ReferralID;
    tournamentId: TournamentID;
    tournamentName: string;
    referralSlug: ReferralSlug;
    referralCampaignName: string;
    rewardFromClaim: ClaimID;
    rewardFromFriendReferred?: UserID;
    claimerID: UserID;
}

export const createRewardClaim = async (req: CreateRewardClaimReq): Promise<Claim_Firestore> => {
    const [lootbox] = await Promise.all([getLootbox(req.lootboxID)]);

    if (!lootbox) {
        throw new Error("Lootbox not found");
    } else if (lootbox.status !== LootboxStatus_Firestore.active) {
        throw new Error("Lootbox is not active");
    }

    const ref = db
        .collection(Collection.Referral)
        .doc(req.referralId)
        .collection(Collection.Claim)
        .doc() as DocumentReference<Claim_Firestore>;

    const timestamp = Timestamp.now().toMillis();

    const newClaim: Claim_Firestore = {
        id: ref.id as ClaimID,
        referralId: req.referralId,
        tournamentId: req.tournamentId,
        tournamentName: req.tournamentName,
        referralSlug: req.referralSlug,
        referralCampaignName: req.referralCampaignName,
        rewardFromClaim: req.rewardFromClaim,
        claimerUserId: req.claimerID,
        referrerId: null,
        whitelistId: null,
        isPostCosmic: true,
        status: ClaimStatus_Firestore.complete,
        type: ClaimType_Firestore.reward,
        referralType: ReferralType_Firestore.viral,
        lootboxID: lootbox.id,
        lootboxAddress: lootbox?.address || null,
        lootboxName: lootbox.name,
        lootboxMaxTickets: lootbox.maxTickets,
        ticketWeb3ID: null, // this will be filled out later in indexLootboxOnMint
        ticketID: null, // this will be filled out later in indexLootboxOnMint
        timestamps: {
            createdAt: timestamp,
            updatedAt: timestamp,
            deletedAt: null,
            completedAt: timestamp,
            whitelistedAt: null,
            mintedAt: null,
        },
    };

    if (req.rewardFromFriendReferred) {
        newClaim.rewardFromFriendReferred = req.rewardFromFriendReferred;
    }

    if (lootbox.nftBountyValue) {
        newClaim.lootboxNFTBountyValue = lootbox.nftBountyValue;
    }

    await ref.set(newClaim);

    return newClaim;
};

export const getUnassignedClaimsForUser = async (
    claimerUserID: UserID
    // lootboxID: LootboxID
): Promise<Claim_Firestore[]> => {
    // const lootboxIDField: keyof Claim_Firestore = "lootboxID";
    const lootboxSatusField: keyof Claim_Firestore = "status";
    const whitelistIDField: keyof Claim_Firestore = "whitelistId";
    const claimerIDField: keyof Claim_Firestore = "claimerUserId";

    const collectionGroupRef = db
        .collectionGroup(Collection.Claim)
        .where(claimerIDField, "==", claimerUserID)
        // .where(lootboxIDField, "==", lootboxID)
        .where(lootboxSatusField, "==", ClaimStatus_Firestore.complete)
        .where(whitelistIDField, "==", null) as CollectionGroup<Claim_Firestore>;

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
