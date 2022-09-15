import { AdEventNonce, AdID, ClaimID, SessionID } from "./types";
import { AdEventAction, Tournament } from "../api/graphql/generated/types";
import { AdSetID, AffiliateID, FlightID, OfferID, TournamentID, UserID } from "@wormgraph/helpers";

interface PixelTrackingParams {
    userId: UserID | null;
    adId: AdID | null;
    adSetId: AdSetID | null;
    offerId: OfferID | null;
    claimId: ClaimID | null;
    tournamentId: TournamentID | null;
    organizerID: AffiliateID | null;
    promoterID: AffiliateID | null;
    flightId: FlightID | null;
    sessionId: SessionID | null;
    eventAction: AdEventAction | null;
    nonce: AdEventNonce | null;
}

export const extractURLStatePixelTracking = (urlString: string) => {
    const url = new URL(urlString);
    const params: PixelTrackingParams = {
        userId: url.searchParams.get("userId") as UserID | null,
        adId: url.searchParams.get("adId") as AdID | null,
        adSetId: url.searchParams.get("adSetId") as AdSetID | null,
        offerId: url.searchParams.get("offerId") as OfferID | null,
        claimId: url.searchParams.get("claimId") as ClaimID | null,
        tournamentId: url.searchParams.get("tournamentId") as TournamentID | null,
        organizerID: url.searchParams.get("organizerID") as AffiliateID | null,
        promoterID: url.searchParams.get("promoterID") as AffiliateID | null,
        flightId: url.searchParams.get("flightId") as FlightID | null,
        sessionId: url.searchParams.get("sessionId") as SessionID | null,
        eventAction: url.searchParams.get("eventAction") as AdEventAction | null,
        nonce: url.searchParams.get("nonce") as AdEventNonce | null,
    };

    return { ...params };
};
