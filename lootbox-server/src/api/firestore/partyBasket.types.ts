import { Address, PartyBasketID, UserID } from "@wormgraph/helpers";
import { LootboxSnapshot } from "./lootbox.types";

export enum PartyBasketStatus {
  active = "active",
  soldOut = "soldOut",
  disabled = "disabled",
}

export type PartyBasketTimestamps = {
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
};

export interface PartyBasket_Firestore {
  id: PartyBasketID;
  address: Address;
  factory: Address;
  creatorId: UserID;
  creatorAddress: Address;
  lootboxAddress: Address;
  name: string;
  chainIdHex: string;
  timestamps: PartyBasketTimestamps;
  lootboxSnapshot: LootboxSnapshot;
  nftBountyValue?: string;
  joinCommunityUrl?: string;
  status: PartyBasketStatus;
  maxClaimsAllowed?: number;
  runningCompletedClaims?: number;
}
