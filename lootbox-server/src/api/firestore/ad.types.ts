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
  AspectRatio,
} from "@wormgraph/helpers";

export enum AdStatus {
  Active = "Active",
  Inactive = "Inactive",
  PendingReview = "PendingReview",
  Rejected = "Rejected",
  Archived = "Archived",
  Planned = "Planned",
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
  Archived = "Archived",
  Planned = "Planned",
}
export interface AdSet_Firestore {
  id: AdSetID;
  name: string;
  description?: string;
  thumbnail?: string;
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
  publicInfo: string;
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
  callToAction: string;
  thumbnail: string;
  infographicLink?: string;
  aspectRatio: AspectRatio;
  themeColor: string;
  advertiserID: AdvertiserID;
  adID: AdID;
}
