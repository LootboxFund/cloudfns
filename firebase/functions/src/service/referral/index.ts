import {
    AffiliateID,
    LootboxStatus_Firestore,
    ReferralSlug,
    TournamentID,
    UserID,
    ReferralType_Firestore,
    Lootbox_Firestore,
} from "@wormgraph/helpers";
import { nanoid } from "nanoid";
import { createReferral, getAffiliate, getReferralBySlug, getTournamentByID, getUser } from "../../api/firestore";
import { createInviteStamp } from "../../api/stamp";
import { manifest } from "../../manifest";

const DEFAULT_COVER_PHOTO =
    "https://storage.googleapis.com/lootbox-constants-prod/assets/425b757c-5ca1-419f-88cb-39780f6512ca.jpeg";

interface CreateReferralServiceRequest {
    campaignName?: string | null;
    promoterId?: AffiliateID | null;
    referrerId?: UserID | null;
    tournamentId: TournamentID;
    type?: ReferralType_Firestore | null;
    stampMetadata?: {
        inviteGraphicCoverPhoto?: string | null;
        playerHeadshot?: string | null;
        logoURLs?: string[] | null;
        eventName?: string | null;
        hostName?: string | null;
    } | null;
}

export const create = async (
    payload: CreateReferralServiceRequest,
    callerUserID: UserID,
    lootbox?: Lootbox_Firestore | undefined
) => {
    const slug = nanoid(10) as ReferralSlug;
    const requestedReferralType = payload.type == undefined ? ReferralType_Firestore.genesis : payload.type;

    const [existingReferral, tournament, requestedReferrer] = await Promise.all([
        getReferralBySlug(slug),
        getTournamentByID(payload.tournamentId as TournamentID),
        payload.referrerId
            ? getUser(payload.referrerId) // returns undefined if not found
            : null,
    ]);

    if (!!payload?.referrerId && !requestedReferrer) {
        console.error("Referrer not found");
        throw new Error("Requested referrer not found");
    }

    if (existingReferral) {
        // Make sure the slug does not already exist
        console.error("Referral slug already exists");
        throw new Error("Please try again");
    }
    if (!tournament) {
        // Make sure the tournament exists
        throw new Error("Tournament not found");
    }
    if (requestedReferralType === ReferralType_Firestore.one_time && callerUserID !== tournament.creatorId) {
        throw new Error("You must own the tournament to make a one time referral");
    }

    let isSeedLootboxEnabled =
        !!lootbox &&
        lootbox.status !== LootboxStatus_Firestore.disabled &&
        lootbox.status !== LootboxStatus_Firestore.soldOut;

    // Skip this check because the service is called on lootbox creation when the lootboxTournamentSnapshot does not exist yet......
    // // we get the lootbox tournament snapshot
    // if (!!isSeedLootboxEnabled && !!lootbox) {
    //     const lootboxTournamentSnapshot = await getLootboxTournamentSnapshot(lootbox.id, tournament.id);
    //     // Only allow the seed lootbox if it is enabled for the tournament
    //     isSeedLootboxEnabled =
    //         isSeedLootboxEnabled &&
    //         !!lootboxTournamentSnapshot &&
    //         !lootboxTournamentSnapshot.timestamps.deletedAt &&
    //         lootboxTournamentSnapshot.status === LootboxTournamentStatus_Firestore.active;
    // }

    if (isSeedLootboxEnabled && lootbox?.safetyFeatures?.isExclusiveLootbox) {
        // Dont allow exclusive lootbox referrals if the user is not tournament host or lootbox creator
        isSeedLootboxEnabled =
            isSeedLootboxEnabled && (callerUserID === tournament.creatorId || callerUserID === lootbox.creatorID);
    }

    const campaignName = payload.campaignName || `Campaign ${nanoid(5)}`;
    let referrerIdToSet = payload.referrerId ? payload.referrerId : callerUserID;

    let promoterIdToSet: AffiliateID | undefined;
    if (payload.promoterId) {
        const affiliate = await getAffiliate(payload.promoterId);
        if (affiliate) {
            referrerIdToSet = affiliate.userID;
            promoterIdToSet = affiliate.id;
        }
    }

    // create the stamp
    let stampImageUrl: string | undefined;
    try {
        // stamp lootbox image
        stampImageUrl = await createInviteStamp({
            coverPhoto: payload.stampMetadata?.inviteGraphicCoverPhoto ?? DEFAULT_COVER_PHOTO,
            themeColor: lootbox?.themeColor ?? "#000000",
            teamName: lootbox?.name ?? payload.campaignName ?? "Player",
            playerHeadshot: payload.stampMetadata?.playerHeadshot ?? undefined,
            ticketValue: lootbox?.nftBountyValue ?? "Prizes",
            qrCodeLink: `${manifest.microfrontends.webflow.referral}?r=${slug}`,
            sponsorLogos: payload.stampMetadata?.logoURLs ?? [],
            eventName: payload.stampMetadata?.eventName ?? undefined,
            hostName: payload.stampMetadata?.hostName ?? undefined,
        });
    } catch (err) {
        console.error("Error creating stamp", err);
    }

    const referral = await createReferral({
        slug,
        referrerId: referrerIdToSet,
        promoterId: promoterIdToSet,
        creatorId: callerUserID,
        campaignName,
        type: requestedReferralType,
        tournamentId: payload.tournamentId as TournamentID,
        seedLootboxID: isSeedLootboxEnabled && lootbox ? lootbox.id : undefined,
        isPostCosmic: true,
        inviteGraphic: stampImageUrl,
    });

    return referral;
};
