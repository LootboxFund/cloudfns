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

export interface LootboxTournamentSnapshot {
  address: Address;
  issuer: UserID;
  description: string;
  name: string;
  stampImage: string;
  image: string;
  backgroundColor: string;
  backgroundImage: string;
  metadataDownloadUrl?: string;
  timestamps: {
    createdAt: number;
    updatedAt: number;
  };
  status: LootboxTournamentStatus;
  socials: LootboxSocialsWithoutEmail;
  partyBaskets?: PartyBasketID[];
}

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
  lootboxSnapshots?: LootboxTournamentSnapshot[];
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
      rateCards: { [key: AffiliateID]: AffiliateRateCard_Firestore };
      status: OfferInTournamentStatus;
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
