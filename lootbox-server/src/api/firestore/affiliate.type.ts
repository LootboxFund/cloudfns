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

export interface OrganizerOfferWhitelist_Firestore {
  id: OrganizerOfferWhitelistID;
  organizerID: AffiliateID;
  offerID: OfferID;
  advertiserID: AdvertiserID;
  timestamp: number;
}
