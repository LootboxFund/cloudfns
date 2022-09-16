import { AdFlight_Firestore, AdEvent_Firestore } from "@wormgraph/helpers";
import { MeasurementPartnerType } from "../../../../../lootbox-server/src/graphql/generated/types";

/**
 *
 * --- Reporting Views & Engagement to AppsFlyer ---
 *
 * READ THIS ARTICLE:
 * https://support.appsflyer.com/hc/en-us/articles/4413114976145-Base-attribution-link-engagement-parameters-for-ad-networks
 *
 * IMPLEMENT FOR OTHER ENGAGEMENT TOO:
 * - video
 * - audio
 * - playable (interactive experience)
 *
 */

export const reportViewToMMP = async (flight: AdFlight_Firestore, adEvent: AdEvent_Firestore) => {
    if (flight.mmp === MeasurementPartnerType.Appsflyer) {
        return await reportViewToAppsflyer(flight, adEvent);
    }
    return `No MMP for OfferID=${flight.offerID} on FlightID=${flight.id}`;
};

export const reportViewToAppsflyer = async (flight: AdFlight_Firestore, adEvent: AdEvent_Firestore) => {
    return `Successfully reported view to MMP=${MeasurementPartnerType.Appsflyer} for OfferID=${flight.offerID} on FlightID=${flight.id}`;
};
