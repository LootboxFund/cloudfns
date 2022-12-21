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

export const checkIfOfferIncludesLootboxAppDefaultActivations = async (offerID: OfferID) => {
    const activations = await listActivationsForOffer(offerID);
    const firstLootboxAppAdViewMmp = activations.find(
        (activation) => activation.mmp === MeasurementPartnerType.LootboxAppAdView
    );
    const firstLootboxAppAnswerQuestionsMmp = activations.find(
        (activation) => activation.mmp === MeasurementPartnerType.LootboxAppAnswerQuestions
    );
    const firstLootboxAppWebsiteVisitMmp = activations.find(
        (activation) => activation.mmp === MeasurementPartnerType.LootboxAppWebsiteVisit
    );
    const adView = firstLootboxAppAdViewMmp || { id: null, mmpAlias: null };
    const answerQuestions = firstLootboxAppAnswerQuestionsMmp || {
        id: null,
        mmpAlias: null,
    };
    const websiteVisit = firstLootboxAppWebsiteVisitMmp || { id: null, mmpAlias: null };
    return { adView, answerQuestions, websiteVisit };
};
