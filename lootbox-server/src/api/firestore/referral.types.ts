import {
  Address,
  ClaimID,
  PartyBasketID,
  ReferralID,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
import { Tournament } from "../../graphql/generated/types";

import { PublicUser } from "./user.types";

export interface Referral {
  id: ReferralID;
  referrerId: UserID;
  creatorId: UserID;
  slug: string;
  tournamentId: TournamentID;
  seedPartyBasketId?: PartyBasketID;
  campaignName: string;
  nConversions: number;
  timestamps: ReferralTimestamps;
  claims?: Claim[];
  tournament: Tournament;
  seedPartyBasket: PartyBasketID;
  type: ReferralType;
}

export type ReferralTimestamps = {
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export type ClaimTimestamps = {
  createdAt: number;
  completedAt?: number;
  updatedAt: number;
  deletedAt?: number;
};

export enum ClaimType {
  referral = "referral",
  reward = "reward",
  one_time = "one_time",
}

export enum ReferralType {
  viral = "viral",
  one_time = "one_time",
  genesis = "genesis",
}

export enum ClaimStatus {
  pending = "pending",
  pending_verification = "pending_verification",
  verification_sent = "verification_sent",
  complete = "complete",
}

export interface Claim {
  id: ClaimID;
  referrerId?: UserID;
  referralCampaignName?: string;
  referralId: ReferralID;
  referralSlug: string;
  referralType: ReferralType;
  tournamentId: TournamentID;
  tournamentName: string;
  originPartyBasketId?: PartyBasketID;
  chosenPartyBasketId?: PartyBasketID;
  chosenPartyBasketAddress?: Address;
  chosenPartyBasketName?: string;
  chosenPartyBasketNFTBountyValue?: string;
  lootboxAddress: Address;
  lootboxName: string;
  rewardFromClaim?: UserID;
  rewardFromFriendReferred?: UserID;
  claimerUserId?: UserID;
  status: ClaimStatus;
  type: ClaimType;
  timestamps: ClaimTimestamps;
  chosenPartyBasket?: PartyBasketID;
  tournament?: Tournament;
  userLink?: PublicUser;
}
