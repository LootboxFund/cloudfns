import { AdID, SessionID } from "./types";
import { AdEventAction } from "../api/graphql/generated/types";

interface PixelTrackingParams {
    adId: AdID | null;
    sessionId: SessionID | null;
    eventAction: AdEventAction | null;
}

export const extractURLStatePixelTracking = (urlString: string) => {
    const url = new URL(urlString);
    const params: PixelTrackingParams = {
        adId: url.searchParams.get("a") as AdID | null,
        sessionId: url.searchParams.get("s") as SessionID | null,
        eventAction: url.searchParams.get("e") as AdEventAction | null,
    };

    return { ...params };
};
