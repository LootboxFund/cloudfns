import { AffiliateID, TournamentID, UserID } from "../../lib/types";
import {
  ActivationID,
  AdvertiserID,
  AffiliateType,
  OfferID,
  OrganizerOfferWhitelistID,
  OrganizerRank,
  RateQuoteID,
} from "@wormgraph/helpers";

export interface Affiliate_Firestore {
  id: AffiliateID;
  userID: UserID;
  name: string;
  organizerRank: OrganizerRank;
}

export enum OfferInTournamentStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export enum RateQuoteStatus {
  Active = "Active",
  Inactive = "Inactive",
}
export interface RateQuote_Firestore {
  id: RateQuoteID;
  tournamentID?: TournamentID;
  affiliateID: AffiliateID;
  affiliateType: AffiliateType;
  offerID: OfferID;
  activationID: ActivationID;
  pricing: number;
  timestamp: number;
  status: RateQuoteStatus;
}

export interface OrganizerOfferWhitelist_Firestore {
  id: OrganizerOfferWhitelistID;
  organizerID: AffiliateID;
  offerID: OfferID;
  advertiserID: AdvertiserID;
  timestamp: number;
}
