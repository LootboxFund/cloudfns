import type { Request } from "express";
import { PubSub, Topic } from "@google-cloud/pubsub";
import { manifest } from "../../manifest";
import {
  AdEvent_Firestore,
  Collection,
  AdFlight_Firestore,
  AdEventID,
  AdEventAction,
  OfferID,
} from "@wormgraph/helpers";
import { db } from "../../api/firebase";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";
import {
  getActivationsByMmpAliasAndOfferID,
  getOfferByID,
} from "../../api/firestore/activation";

import { notifyPubSubOfBillableActivation } from "../../api/pubsub/notify";
import { TournamentID } from "@wormgraph/helpers";

//  * ------ DATA WE RECEIVE FROM APPSFLYER ------
//  *
//  * // All the same af_adset, ad_ad, c, af_siteid, af_sub_siteid params are returned back to us https://support.appsflyer.com/hc/en-us/articles/207273946-Available-Macros-on-AppsFlyer-sPostbacks
//  * // but not af_sub[n]
//  * https://activation-ingestor-qrmywylbhq-as.a.run.app/appsflyer?af_ad={af_ad}&af_adset={af_adset}&af_adset_id={af_adset_id}&c={c}&af_c_id={af_c_id}&af_siteid={af_siteid}&af_subsite_id={af_subsite_id}&af_ad_type={af_ad_type}&imei={imei}&oaid={oaid}&idfv={idfv}&idfa={idfa}&event_name={event_name}&event_time={event_time}&event_value={event_value}&is_primary_attribution={is_primary_attribution}&is_retargeting={is_retargeting}&is_attributed={is_attributed}&blocked_reason={blocked_reason}&country_code={country_code}&language={language}&platform={platform}&attributed_touch_type={attributed_touch_type}&appsflyer_id={appsflyer_id}&app_name={app_name}
//  * https://activation-ingestor-qrmywylbhq-as.a.run.app/appsflyer?af_ad=(af_ad)&af_adset=(af_adset)&af_adset_id=(af_adset_id)&c=(c)&af_c_id=(af_c_id)&af_siteid=(af_siteid)&af_subsite_id=(af_subsite_id)&af_ad_type=(af_ad_type)&imei=(imei)&oaid=(oaid)&idfv=(idfv)&idfa=(idfa)&event_name=(event_name)&event_time=(event_time)&event_value=(event_value)&is_primary_attribution=(is_primary_attribution)&is_retargeting=(is_retargeting)&is_attributed=(is_attributed)&blocked_reason=(blocked_reason)&country_code=(country_code)&language=(language)&platform=(platform)&attributed_touch_type=(attributed_touch_type)&appsflyer_id=(appsflyer_id)&app_name=(app_name)
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
  // best case scenario, we have a flight
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
        const tournamentID = (extraData.appsflyer_af_adset as string) || "";
        const matchingActivations = await getActivationsByMmpAliasAndOfferID(
          flight.offerID,
          mmpAlias
        );
        const adEventSchema: AdEvent_Firestore = {
          id: adEventRef.id as AdEventID,
          timestamp: Timestamp.now().toMillis(),
          adID: flight.adID,
          adSetID: flight.adSetID,
          sessionID: flight.sessionID,
          campaignID: flight.campaignID,
          flightID: flight.id,
          action: AdEventAction.Activation,
          advertiserID: flight.advertiserID,
          claimID: flight.claimID,
          offerID: flight.offerID,
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
            tournamentID: tournamentID as TournamentID,
          },
        };
        await adEventRef.set(adEventSchema);
        await notifyPubSubOfBillableActivation(adEventRef.id as AdEventID);
        return adEventSchema;
      }
    }
  }
  // decent case, we have an offerID and mmpAlias (event name)
  const offerID = extraData.appsflyer_c as OfferID;
  const mmpAlias = (extraData.appsflyer_event_name as string) || "";
  if (offerID && mmpAlias) {
    const matchingActivations = await getActivationsByMmpAliasAndOfferID(
      offerID,
      mmpAlias
    );
    const adEventSchema: AdEvent_Firestore = {
      id: adEventRef.id as AdEventID,
      timestamp: Timestamp.now().toMillis(),
      action: AdEventAction.Activation,
      activationEventMmpAlias: mmpAlias,
      activationID: matchingActivations[0].id,
      offerID: offerID,
      extraData: extraData,
      advertiserID: matchingActivations[0].advertiserID,
    };
    await adEventRef.set(adEventSchema);
    await notifyPubSubOfBillableActivation(adEventRef.id as AdEventID);
    return adEventSchema;
  }
  const adEventSchema: AdEvent_Firestore = {
    id: adEventRef.id as AdEventID,
    timestamp: Timestamp.now().toMillis(),
    action: AdEventAction.Activation,
    extraData: extraData,
  };
  if (offerID) {
    const offer = await getOfferByID(offerID);
    adEventSchema.offerID = offerID;
    if (offer) {
      adEventSchema.advertiserID = offer.advertiserID;
    }
  }
  if (mmpAlias) {
    adEventSchema.activationEventMmpAlias = mmpAlias;
  }
  await adEventRef.set(adEventSchema);
  await notifyPubSubOfBillableActivation(adEventRef.id as AdEventID);
  return adEventSchema;
};
