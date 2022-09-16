import {
  Address,
  AdSetID,
  AdvertiserID,
  AffiliateID,
  AffiliateType,
  OfferID,
  PartyBasketID,
  RateCardID,
  RateQuoteID,
  StreamID,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";

export enum LootboxTournamentStatus {
  pending = "pending",
  active = "active",
  rejected = "rejected",
}

type LootboxSocialsWithoutEmail = {
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  discord?: string;
  youtube?: string;
  snapchat?: string;
  twitch?: string;
  web?: string;
};
