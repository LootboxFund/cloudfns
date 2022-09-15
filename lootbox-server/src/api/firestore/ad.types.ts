import { Affiliate } from "../../graphql/generated/types";
import {
  AdEvent_Firestore,
  AdEventID,
  AdEventNonce,
  AdID,
  AdSetID,
  AdvertiserID,
  AffiliateID,
  CampaignID,
  ClaimID,
  CreativeID,
  FlightID,
  OfferID,
  SessionID,
  UserID,
  Placement,
} from "@wormgraph/helpers";

export enum AdStatus {
  Active = "Active",
  Inactive = "Inactive",
  PendingReview = "PendingReview",
  Rejected = "Rejected",
}

export type AdTimestamps = {
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export enum AdSetStatus {
  Active = "Active",
  Inactive = "Inactive",
  PendingReview = "PendingReview",
  Rejected = "Rejected",
}
export interface AdSet_Firestore {
  id: AdSetID;
  name: string;
  description?: string;
  advertiserID: AdvertiserID;
  status: AdSetStatus;
  placement: Placement;
  adIDs: AdID[];
  offerIDs: OfferID[];
}

export interface Ad_Firestore {
  id: AdID;
  advertiserID: AdvertiserID;
  status: AdStatus;
  name: string;
  description?: string;
  placement: Placement;
  impressions: number;
  clicks: number;
  uniqueClicks: number;
  creative: Creative;
  events: AdEvent_Firestore[];
  timestamps: AdTimestamps;
}

export enum CreativeType {
  Image = "Image",
  Video = "Video",
}
export interface Creative {
  creativeType: CreativeType;
  creativeLinks: string[];
  callToActionText?: string;
  thumbnail?: string;
  infographicLink?: string;
  creativeAspectRatio: string;
  themeColor?: string;
  advertiserID: AdvertiserID;
  adID: AdID;
}
