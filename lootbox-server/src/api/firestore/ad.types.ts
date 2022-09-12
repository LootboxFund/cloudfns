import {
  AdEventID,
  AdEventNonce,
  AdID,
  CampaignID,
  ClaimID,
  CreativeID,
  FlightID,
  SessionID,
  UserID,
} from "@wormgraph/helpers";

export enum AdStatus {
  active = "active",
  inactive = "inactive",
  pending_review = "pending_review",
  rejected = "rejected",
}

export enum AdType {
  template_1 = "template_1",
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

export interface Ad_Firestore {
  id: AdID;
  campaignId: CampaignID;
  flightId: FlightID;
  creativeId: CreativeID;
  creatorId: UserID;
  status: AdStatus;
  name?: string;
  type: AdType;

  timestamps: AdTimestamps;

  impressions: number;
  clicks: number;
  uniqueClicks: number;

  creative: CreativeID;

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
  flightId: FlightID;
  sessionId: SessionID;
  campaignId: CampaignID;
  action: AdEventAction;
  claimId: ClaimID;
  metadata: EventMetadata;
  nonce: AdEventNonce;
}
