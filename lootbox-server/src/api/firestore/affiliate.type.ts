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
  description: string;
  publicContactEmail: string;
  organizerRank: OrganizerRank;
  avatar: string;
}

export enum OfferInTournamentStatus {
  Active = "Active",
  Inactive = "Inactive",
}

enum OrganizerOfferWhitelistStatus {
  Active = "Active",
  Inactive = "Inactive",
  Planned = "Planned",
  Archived = "Archived",
}
export interface OrganizerOfferWhitelist_Firestore {
  id: OrganizerOfferWhitelistID;
  organizerID: AffiliateID;
  offerID: OfferID;
  advertiserID: AdvertiserID;
  timestamp: number;
  status: OrganizerOfferWhitelistStatus;
}
