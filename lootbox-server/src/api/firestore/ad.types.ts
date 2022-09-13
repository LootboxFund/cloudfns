import {
  AdEventID,
  AdEventNonce,
  AdID,
  AdSetID,
  CampaignID,
  ClaimID,
  CreativeID,
  FlightID,
  OfferID,
  SessionID,
  UserID,
} from "@wormgraph/helpers";

export enum AdStatus {
  active = "active",
  inactive = "inactive",
  pending_review = "pending_review",
  rejected = "rejected",
}

export enum AdEventAction {
  view = "view",
  click = "click",
  timerElapsed = "timerElapsed",
  videoTimestamp = "videoTimestamp",
}

export type AdTimestamps = {
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export enum AdSetStatus {
  active = "active",
  inactive = "inactive",
  pending_review = "pending_review",
  rejected = "rejected",
}
export enum Placement {
  AFTER_TICKET_CLAIM = "AFTER_TICKET_CLAIM",
  BEFORE_PAYOUT = "BEFORE_PAYOUT",
  AFTER_PAYOUT = "AFTER_PAYOUT",
  DAILY_SPIN = "DAILY_SPIN",
  TICKET_CAROUSEL = "TICKET_CAROUSEL",
}
export interface AdSet_Firestore {
  id: AdSetID;
  name: string;
  description: string;
  status: AdSetStatus;
  placement: Placement;
  adIDs: AdID[];
  offerIDs: OfferID[];
}

export interface Ad_Firestore {
  id: AdID;
  creativeId: CreativeID;
  creatorId: UserID;
  status: AdStatus;
  name?: string;
  type: Placement;

  timestamps: AdTimestamps;

  impressions: number;
  clicks: number;
  uniqueClicks: number;

  creative: Creative;

  events: [AdEvent];
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
  image = "image",
  video = "video",
}
export interface Creative {
  creativeType: CreativeType;
  creativeLinks: string[];
  callToActionText?: string;
  url: string;
  clickUrl?: string;
  thumbnail?: string;
  infographicLink?: string;
  creativeAspectRatio: string;
  themeColor?: string;
}
