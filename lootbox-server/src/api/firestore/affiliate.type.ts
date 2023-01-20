import {
  AffiliateID,
  AdvertiserID,
  OfferID,
  OrganizerOfferWhitelistID,
} from "@wormgraph/helpers";

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
