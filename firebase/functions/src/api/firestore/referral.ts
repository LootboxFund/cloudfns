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
import { DocumentReference, DocumentSnapshot, Timestamp } from "firebase-admin/firestore";
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
        lootboxAddress: lootbox.address,
        lootboxName: lootbox.name,
        lootboxMaxTickets: lootbox.maxTickets,
        timestamps: {
            createdAt: timestamp,
            updatedAt: timestamp,
            deletedAt: null,
            completedAt: timestamp,
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
