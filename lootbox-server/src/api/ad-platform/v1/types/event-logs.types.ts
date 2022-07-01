import { UserID } from "../../../../lib/types";
import { AdvertiserID, AdZone, FlightID } from "./base.types";
import {
  AdID,
  AdSetID,
  CampaignID,
  ImpressionID,
  AdEventType,
  ClickID,
  Url,
  BillingPlanID,
} from "./base.types";

export interface baseEvent {
  adID: AdID;
  adSetID: AdSetID;
  campaignID: CampaignID;
  userID: UserID;
  flightID: FlightID;
}

export interface impressionPre extends baseEvent {
  adEventType: AdEventType.IMPRESSION;
}

export interface impressionPost extends impressionPre {
  impressionID: ImpressionID;
  timestamp: Date;
  billingPlanID: BillingPlanID;
  advertiserID: AdvertiserID;
  adZoneSlug: AdZone;
}

export interface clickPre {
  adEventType: AdEventType.CLICK;
  destination: Url;
}

export interface clickPost extends clickPre {
  clickID: ClickID;
  timestamp: Date;
  billingPlanID: BillingPlanID;
  advertiserID: AdvertiserID;
  adZoneSlug: AdZone;
}
