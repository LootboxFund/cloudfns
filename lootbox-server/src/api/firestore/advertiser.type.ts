import {
  AffiliateID,
  ConquestID,
  ConquestStatus,
  UserID,
  UserIdpID,
  AdvertiserID,
  OfferID,
  TournamentID,
} from "@wormgraph/helpers";

export enum AdvertiserVisibility_Firestore {
  Public = "Public",
  Private = "Private",
}

export interface Advertiser_Firestore {
  id: AdvertiserID;
  userID: UserID;
  userIdpID: UserIdpID;
  name: string;
  description: string;
  avatar: string;
  publicContactEmail: string;
  website: string;
  offers: OfferID[];
  conquests: Conquest_Firestore[];
  affiliatePartners: AffiliateID[];
  relatedTournaments: TournamentID[];
  visibility: AdvertiserVisibility_Firestore;
}

export interface Conquest_Firestore {
  id: ConquestID;
  title: string;
  description: string;
  image: string;
  startDate: number;
  endDate: number;
  advertiserID: AdvertiserID;
  status: ConquestStatus;
  tournaments: TournamentID[];
}

export interface ConquestWithTournaments {
  conquest: Conquest_Firestore;
  tournaments: TournamentPreviewInConquest[];
}

export interface TournamentPreviewInConquest {
  id: TournamentID;
  title: string;
  coverPhoto: string;
}
