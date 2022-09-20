import { AffiliateID, TournamentID, UserID } from "../../lib/types";
import {
  ActivationID,
  AdvertiserID,
  AffiliateType,
  OfferID,
  OrganizerOfferWhitelistID,
  OrganizerRank,
  RateQuoteID,
  UserIdpID,
} from "@wormgraph/helpers";

export interface Affiliate_Firestore {
  id: AffiliateID;
  userID: UserID;
  userIdpID: UserIdpID;
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
