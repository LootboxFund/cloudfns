import {
  Address,
  AdSetID,
  AdvertiserID,
  AffiliateID,
  AffiliateType,
  OfferID,
  PartyBasketID,
  RateCardID,
  StreamID,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
import { TournamentTimestamps } from "../../graphql/generated/types";
import { ActivationPricing_Firestore } from "./offer.type";

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

export enum OfferInTournamentStatus {
  Active = "Active",
  Inactive = "Inactive",
}
export interface Tournament_Firestore {
  id: TournamentID;
  title: string;
  description: string;
  tournamentLink?: string;
  timestamps: TournamentTimestamps;
  creatorId: UserID;
  magicLink?: string;
  tournamentDate?: number;
  prize?: string;
  coverPhoto?: string;
  communityURL?: string;
  streams?: Stream[];
  affiliateAdIds?: string[];
  organizer?: AffiliateID;
  promoters?: AffiliateID[];
  advertisers?: AdvertiserID[];
  offers?: {
    [key: OfferID]: {
      id: OfferID;
      status: OfferInTournamentStatus;
      rateCards: { [key: AffiliateID]: AffiliateRateCard_Firestore };
      adSets: {
        [key: AdSetID]: OfferInTournamentStatus;
      };
    };
  };
}

enum StreamType {
  facebook = "facebook",
  twitch = "twitch",
  discord = "discord",
  youtube = "youtube",
}

export interface Stream {
  id: StreamID;
  creatorId: UserID;
  type: StreamType;
  url: string;
  name: string;
  tournamentId: TournamentID;
  timestamps: {
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
  };
}

export interface AffiliateRateCard_Firestore {
  id: RateCardID;
  name: string;
  advertiserID: AdvertiserID;
  activations: ActivationPricing_Firestore[];
  affiliateID: AffiliateID;
  affiliateType: AffiliateType;
  tournamentID?: TournamentID;
  organizerID?: AffiliateID;
  promoterID?: AffiliateID;
  // currency: Currency;
}
