import type { Request } from "express";
import {
  AdEvent_Firestore,
  Collection,
  AdFlight_Firestore,
  AdEventID,
  AdEventAction,
  OfferID,
} from "@wormgraph/helpers";
import { db } from "../../api/firebase";
import { DocumentReference } from "firebase-admin/firestore";
import { getActivationsByMmpAliasAndOfferID } from "../../api/firestore/activation";

//  * ------ DATA WE RECEIVE FROM APPSFLYER ------
//  *
//  * // All the same af_adset, ad_ad, c, af_siteid, af_sub_siteid params are returned back to us https://support.appsflyer.com/hc/en-us/articles/207273946-Available-Macros-on-AppsFlyer-sPostbacks
//  * // but not af_sub[n]
//  *
export const trackAppsFlyerActivation = async (
  req: Request
): Promise<AdEvent_Firestore> => {
  // get appsflyer params
  const extraData = {
    appsflyer_advertising_id: req.query.advertising_id,
    appsflyer_app_name: req.query.app_name,
    appsflyer_appsflyer_id: req.query.appsflyer_id,
    appsflyer_attributed_touch_type: req.query.attributed_touch_type,
    appsflyer_blocked_reason: req.query.blocked_reason,
    appsflyer_blocked_reason_value: req.query.blocked_reason_value,
    appsflyer_blocked_sub_reason: req.query.blocked_sub_reason,
    appsflyer_bundle_id: req.query.bundle_id,
    appsflyer_country_code: req.query.country_code,
    appsflyer_event_name: req.query.event_name,
    appsflyer_event_revenue_USD: req.query.event_revenue_USD,
    appsflyer_event_revenue: req.query.event_revenue,
    appsflyer_event_revenue_currency: req.query.event_revenue_currency,
    appsflyer_event_time: req.query.event_time,
    appsflyer_event_value: req.query.event_value,
    appsflyer_idfa: req.query.idfa,
    appsflyer_idfv: req.query.idfv,
    appsflyer_install_time: req.query.install_time,
    appsflyer_install_unix_ts: req.query.install_unix_ts,
    appsflyer_is_attributed: req.query.is_attributed,
    appsflyer_is_lat: req.query.is_lat,
    appsflyer_is_primary_attribution: req.query.is_primary_attribution,
    appsflyer_is_retargeting: req.query.is_retargeting,
    appsflyer_language: req.query.language,
    appsflyer_oaid: req.query.oaid,
    appsflyer_partner_event_id: req.query.partner_event_id,
    appsflyer_platform: req.query.platform,
    appsflyer_retargeting_conversion_type:
      req.query.retargeting_conversion_type,
    appsflyer_app_version: req.query.app_version,
    appsflyer_app_id: req.query.app_id,
    appsflyer_att_0_1: req.query["att-0-1"],
    appsflyer_att_status: req.query["att-status"],
    appsflyer_af_ad: req.query.af_ad,
    appsflyer_af_ad_id: req.query.af_ad_id,
    appsflyer_af_adset: req.query.af_adset,
    appsflyer_af_adset_id: req.query.af_adset_id,
    appsflyer_c: req.query.c,
    appsflyer_af_c_id: req.query.af_c_id,
    appsflyer_af_siteid: req.query.af_siteid,
    appsflyer_af_subsite_id: req.query.af_subsite_id,
    appsflyer_af_ad_type: req.query.af_ad_type,
    appsflyer_imei: req.query.imei,
  };
  // get flight from firestore
  const flightID = req.query.af_ad;
  const adEventRef = db
    .collection(Collection.AdEvent)
    .doc() as DocumentReference<AdEvent_Firestore>;
  if (typeof flightID === "string") {
    const flightRef = db
      .collection(Collection.Flight)
      .doc(flightID) as DocumentReference<AdFlight_Firestore>;
    const flightSnapshot = await flightRef.get();
    if (flightSnapshot.exists) {
      const f = flightSnapshot.data();
      if (f) {
        const flight = f;
        const mmpAlias = (extraData.appsflyer_event_name as string) || "";
        const matchingActivations = await getActivationsByMmpAliasAndOfferID(
          flight.offerID,
          mmpAlias
        );
        const adEventSchema: AdEvent_Firestore = {
          id: adEventRef.id as AdEventID,
          timestamp: new Date().getTime() / 1000,
          adId: flight.adID,
          adSetId: flight.adSetID,
          sessionId: flight.sessionID,
          campaignId: flight.campaignID,
          flightId: flight.id,
          action: AdEventAction.Activation,
          claimId: flight.claimID,
          activationEventMmpAlias: mmpAlias,
          activationID: matchingActivations[0].id,
          metadata: {
            clickRedirectUrl: flight.clickUrl,
            pixelUrl: flight.pixelUrl,
          },
          extraData: extraData,
          affiliateAttribution: {
            organizerID: flight.organizerID,
            promoterID: flight.promoterID,
            userID: flight.userID,
          },
        };
        await adEventRef.set(adEventSchema);
        return adEventSchema;
      }
    }
  }
  const offerID = extraData.appsflyer_c as OfferID;
  const mmpAlias = (extraData.appsflyer_event_name as string) || "";
  if (offerID && mmpAlias) {
    const matchingActivations = await getActivationsByMmpAliasAndOfferID(
      offerID,
      mmpAlias
    );
    const adEventSchema: AdEvent_Firestore = {
      id: adEventRef.id as AdEventID,
      timestamp: new Date().getTime() / 1000,
      action: AdEventAction.Activation,
      activationEventMmpAlias: mmpAlias,
      activationID: matchingActivations[0].id,
      extraData: extraData,
    };
    await adEventRef.set(adEventSchema);
  }
  const adEventSchema: AdEvent_Firestore = {
    id: adEventRef.id as AdEventID,
    timestamp: new Date().getTime() / 1000,
    action: AdEventAction.Activation,
    extraData: extraData,
  };
  await adEventRef.set(adEventSchema);
  return adEventSchema;
};
