import {
  AffiliateID,
  ConquestID,
  ConquestStatus,
  UserID,
} from "@wormgraph/helpers";
import { AdvertiserID, OfferID, TournamentID } from "../../lib/types";

export interface Advertiser_Firestore {
  id: AdvertiserID;
  userID: UserID;
  name: string;
  description: string;
  offers: OfferID[];
  conquests: Conquest_Firestore[];
  affiliatePartners: AffiliateID[];
  relatedTournaments: TournamentID[];
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
