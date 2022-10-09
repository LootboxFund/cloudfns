import { AdEventAction } from "../api/graphql/generated/types";
import {
    AdEventNonce,
    AdID,
    ClaimID,
    SessionID,
    AdSetID,
    AffiliateID,
    FlightID,
    OfferID,
    TournamentID,
    UserID,
    CampaignID,
    PixelTrackingParams,
} from "@wormgraph/helpers";

export const extractURLStatePixelTracking = (urlString: string) => {
    const url = new URL(urlString);
    const params: PixelTrackingParams = {
        userID: url.searchParams.get("userID") as UserID | null,
        adID: url.searchParams.get("adID") as AdID | null,
        adSetID: url.searchParams.get("adSetID") as AdSetID | null,
        offerID: url.searchParams.get("offerID") as OfferID | null,
        claimID: url.searchParams.get("claimID") as ClaimID | null,
        campaignID: url.searchParams.get("campaignID") as CampaignID | null,
        tournamentID: url.searchParams.get("tournamentID") as TournamentID | null,
        organizerID: url.searchParams.get("organizerID") as AffiliateID | null,
        promoterID: url.searchParams.get("promoterID") as AffiliateID | null,
        flightID: url.searchParams.get("flightID") as FlightID | null,
        sessionID: url.searchParams.get("sessionID") as SessionID | null,
        eventAction: url.searchParams.get("eventAction") as AdEventAction | null,
        nonce: url.searchParams.get("nonce") as AdEventNonce | null,
        timeElapsed: url.searchParams.get("timeElapsed") as number | null,
    };
    return { ...params };
};
