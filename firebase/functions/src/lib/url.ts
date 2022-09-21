import { AdEventNonce, AdID, ClaimID, SessionID } from "./types";
import { AdEventAction } from "../api/graphql/generated/types";
import { AdSetID, AffiliateID, FlightID, OfferID, TournamentID, UserID, CampaignID } from "@wormgraph/helpers";

interface PixelTrackingParams {
    flightId: FlightID | null;
    userId: UserID | null;
    adId: AdID | null;
    adSetId: AdSetID | null;
    offerId: OfferID | null;
    claimId: ClaimID | null;
    campaignId: CampaignID | null;
    tournamentId: TournamentID | null;
    organizerID: AffiliateID | null;
    promoterID: AffiliateID | null;
    sessionId: SessionID | null;
    eventAction: AdEventAction | null;
    nonce: AdEventNonce | null;
    timeElapsed: number | null;
}

export const extractURLStatePixelTracking = (urlString: string) => {
    const url = new URL(urlString);
    const params: PixelTrackingParams = {
        userId: url.searchParams.get("userID") as UserID | null,
        adId: url.searchParams.get("adID") as AdID | null,
        adSetId: url.searchParams.get("adSetID") as AdSetID | null,
        offerId: url.searchParams.get("offerID") as OfferID | null,
        claimId: url.searchParams.get("claimID") as ClaimID | null,
        campaignId: url.searchParams.get("campaignID") as CampaignID | null,
        tournamentId: url.searchParams.get("tournamentID") as TournamentID | null,
        organizerID: url.searchParams.get("organizerID") as AffiliateID | null,
        promoterID: url.searchParams.get("promoterID") as AffiliateID | null,
        flightId: url.searchParams.get("flightID") as FlightID | null,
        sessionId: url.searchParams.get("sessionID") as SessionID | null,
        eventAction: url.searchParams.get("eventAction") as AdEventAction | null,
        nonce: url.searchParams.get("nonce") as AdEventNonce | null,
        timeElapsed: url.searchParams.get("timeElapsed") as number | null,
    };

    return { ...params };
};
