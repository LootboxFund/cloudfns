import {
  AffiliateID,
  AdvertiserID,
  OfferID,
  OrganizerOfferWhitelistID,
  OrganizerRank,
  UserIdpID,
  UserID,
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
  website: string;
  audienceSize: number;
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
