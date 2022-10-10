import { AdFlight_Firestore, AdEvent_Firestore, MeasurementPartnerType, OfferID } from "@wormgraph/helpers";
import { listActivationsForOffer } from "../firestore";

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
    return `Successfully reported view to MMP=${MeasurementPartnerType.Appsflyer} for OfferID=${flight.offerID} on FlightID=${flight.id} for ad event = ${adEvent.id}`;
};

export const checkIfOfferIncludesLootboxAppWebsiteVisit = async (offerID: OfferID) => {
    console.log(`Checking if OfferID=${offerID} includes mmp lootbox app website visit`);
    const activations = await listActivationsForOffer(offerID);
    const firstLootboxAppWebsiteVisitMmp = activations.find(
        (activation) => activation.mmp === MeasurementPartnerType.LootboxAppWebsiteVisit
    );
    return firstLootboxAppWebsiteVisitMmp || { id: null, mmpAlias: null };
};
