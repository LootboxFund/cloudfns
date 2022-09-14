import { AffiliateID, TournamentID, UserID } from "../../lib/types";
import {
  ActivationID,
  AffiliateType,
  OfferID,
  RateQuoteID,
} from "@wormgraph/helpers";

export interface Affiliate_Firestore {
  id: AffiliateID;
  userID: UserID;
  name: string;
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
