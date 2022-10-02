import {
  Address,
  ClaimID,
  LootboxID,
  PartyBasketID,
  ReferralID,
  TournamentID,
  UserID,
  WhitelistSignatureID,
} from "@wormgraph/helpers";

export interface Referral_Firestore {
  id: ReferralID;
  referrerId: UserID;
  creatorId: UserID;
  slug: string;
  tournamentId: TournamentID;
  campaignName: string;
  nConversions: number;
  timestamps: ReferralTimestamps_Firestore;
  type: ReferralType_Firestore;
  seedLootboxID?: LootboxID;

  /** @deprecated use seedLootboxID */
  seedPartyBasketId?: PartyBasketID;
}

export type ReferralTimestamps_Firestore = {
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

export type ClaimTimestamps_Firestore = {
  createdAt: number;
  completedAt: number | null;
  updatedAt: number;
  deletedAt: number | null;
};

export enum ClaimType_Firestore {
  referral = "referral",
  reward = "reward",
  one_time = "one_time",
}

export enum ReferralType_Firestore {
  viral = "viral",
  one_time = "one_time",
  genesis = "genesis",
}

export enum ClaimStatus_Firestore {
  pending = "pending",
  pending_verification = "pending_verification",
  verification_sent = "verification_sent",
  complete = "complete",
}

export interface Claim_Firestore {
  id: ClaimID;
  referrerId: UserID | null;
  referralCampaignName?: string;
  referralId: ReferralID;
  referralSlug: string;
  referralType: ReferralType_Firestore;
  tournamentId: TournamentID;
  tournamentName: string;
  originLootboxId?: LootboxID;
  chosenLootboxId?: LootboxID;
  chosenLootboxAddress?: Address;
  chosenLootboxName?: string;
  chosenLootboxNFTBountyValue?: string;
  whitelistId: WhitelistSignatureID | null;
  lootboxAddress?: Address;
  lootboxName?: string;
  rewardFromClaim?: ClaimID;
  rewardFromFriendReferred?: UserID;
  claimerUserId?: UserID;
  status: ClaimStatus_Firestore;
  type: ClaimType_Firestore;
  timestamps: ClaimTimestamps_Firestore;

  /** @deprecated use lootbox */
  originPartyBasketId?: PartyBasketID;
  /** @deprecated use lootbox */
  chosenPartyBasketId?: PartyBasketID;
  /** @deprecated use lootbox */
  chosenPartyBasketAddress?: Address;
  /** @deprecated use lootbox */
  chosenPartyBasketName?: string;
  /** @deprecated use lootbox */
  chosenPartyBasketNFTBountyValue?: string;
}
