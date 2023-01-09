import {
  AdvertiserVisibility_Firestore,
  Advertiser_Firestore,
} from "../api/firestore/advertiser.type";
import { Advertiser, AdvertiserVisibility } from "../graphql/generated/types";

export const convertAdvertiserVisibilityDBToGQL = (
  visibility: AdvertiserVisibility_Firestore
): AdvertiserVisibility => {
  switch (visibility) {
    case AdvertiserVisibility_Firestore.Public:
      return AdvertiserVisibility.Public;
    case AdvertiserVisibility_Firestore.Private:
    default:
      return AdvertiserVisibility.Private;
  }
};

export const convertAdvertiserDBToGQL = (
  advertiser: Advertiser_Firestore
): Advertiser => {
  return {
    id: advertiser.id,
    name: advertiser.name,
    description: advertiser.description,
    avatar: advertiser.avatar,
    publicContactEmail: advertiser.publicContactEmail,
    website: advertiser.website,
    visibility: convertAdvertiserVisibilityDBToGQL(advertiser.visibility),
    userID: advertiser.userID,
    conquests: advertiser.conquests,
    offers: advertiser.offers,
  };
};
