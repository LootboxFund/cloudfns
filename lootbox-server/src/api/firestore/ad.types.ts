import {
  AdEventID,
  AdEventNonce,
  AdID,
  AdSetID,
  AdvertiserID,
  CampaignID,
  ClaimID,
  CreativeID,
  FlightID,
  OfferID,
  SessionID,
  UserID,
} from "@wormgraph/helpers";

export enum AdStatus {
  Active = "Active",
  Inactive = "Inactive",
  PendingReview = "PendingReview",
  Rejected = "Rejected",
}

export enum AdEventAction {
  View = "View",
  Click = "Click",
  TimerElapsed = "TimerElapsed",
  VideoTimestamp = "VideoTimestamp",
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
export enum Placement {
  AfterTicketClaim = "AfterTicketClaim",
  BeforePayout = "BeforePayout",
  AfterPayout = "AfterPayout",
  DailySpin = "DailySpin",
  TicketCarousel = "TicketCarousel",
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
  events: AdEvent[];
  timestamps: AdTimestamps;
}

export type EventMetadata = {
  clickUrl?: string;
  verificationUrl?: string;
  timeElapsed?: number;
};

export interface AdEvent {
  id: AdEventID;
  timestamp: number;
  adId: AdID;
  adSetId: AdSetID;
  sessionId: SessionID;
  campaignId: CampaignID;
  action: AdEventAction;
  claimId?: ClaimID;
  metadata: EventMetadata;
  nonce: AdEventNonce;
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
