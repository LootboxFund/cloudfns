import { AdFlight_Firestore } from "@wormgraph/helpers";
import { MeasurementPartnerType } from "../../graphql/generated/types";
import { Offer_Firestore } from "../firestore/offer.type";

export const craftAffiliateAttributionUrl = (
  flight: Omit<AdFlight_Firestore, "clickUrl" | "destinationUrl">
) => {
  if (flight.mmp === MeasurementPartnerType.Appsflyer) {
    return craftAppsflyerUrl(flight);
  }
  return flight.affiliateBaseLink;
};

//  * ------ DATA WE SEND TO APPSFLYER ------
//  *
//  * // For Appsflyer Advertiser to filter in report visualizations
//  * Media source (pid=LOOTBOX) see https://support.appsflyer.com/hc/en-us/articles/207447163#partner-id-pid-parameter
//  * campaign name (c=offerID) limit 100 char
//  * Ad set (af_adset=tournamentID) limit 100 char
//  * Ad name (af_ad=flightID) limit 100 char
//  *
//  * // For Appsflyter to attribute to Lootbox and our tournament organizers
//  * af_siteid=tournamentID
//  * af_sub_siteid=promoterID or organizerID
//  *
//  * // For Appsflyer raw data exports, to drill deep into data outside of the in-app report visualizations
//  * af_sub[n]=custom params
//  * af_sub1=adID
//  * af_sub2=adSetID
//  * af_sub3=claimID
//  * af_sub4=hashed(userID)
//  *
//  * clickid= lootbox unique click id
//  * is_incentivized= true or false
//  *
const craftAppsflyerUrl = (
  flight: Omit<AdFlight_Firestore, "clickUrl" | "destinationUrl">
) => {
  const affiliateBaseLink = flight.affiliateBaseLink;
  const offerID = flight.offerID;
  const adSetID = flight.adSetID;
  const adID = flight.adID;
  const claimID = flight.claimID;
  const tournamentID = flight.tournamentID;
  const promoterID = flight.promoterID;
  const organizerID = flight.organizerID;
  const userID = hashUserId(flight.userID);
  const flightID = flight.id;
  return `${affiliateBaseLink}?pid=LOOTBOX&c=${offerID}&af_adset=${tournamentID}&af_ad=${flightID}&af_siteid=${tournamentID}&af_sub_siteid=${
    promoterID || organizerID
  }&af_sub1=${adID}&af_sub2=${adSetID}&af_sub3=${claimID}&af_sub4=${userID}&is_incentivized=${true}`;
};

const hashUserId = (userId: string) => {
  return userId;
};
