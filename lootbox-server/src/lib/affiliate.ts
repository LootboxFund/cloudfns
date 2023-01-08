import { OrganizerRank as OrganizerRank_Firestore } from "@wormgraph/helpers";
import {
  AffiliateVisibility_Firestore,
  Affiliate_Firestore,
} from "../api/firestore/affiliate.type";
import {
  Affiliate,
  AffiliateVisibility,
  OrganizerRank,
} from "../graphql/generated/types";

const convertOrganizerRankeDBToGQL = (
  rank: OrganizerRank_Firestore
): OrganizerRank => {
  switch (rank) {
    case OrganizerRank_Firestore.ClayRank1:
      return OrganizerRank.ClayRank1;
    case OrganizerRank_Firestore.BronzeRank2:
      return OrganizerRank.BronzeRank2;
    case OrganizerRank_Firestore.IronRank3:
      return OrganizerRank.IronRank3;
    case OrganizerRank_Firestore.SilverRank4:
      return OrganizerRank.SilverRank4;
    case OrganizerRank_Firestore.GoldRank5:
      return OrganizerRank.GoldRank5;
    case OrganizerRank_Firestore.PlatinumRank6:
      return OrganizerRank.PlatinumRank6;
    case OrganizerRank_Firestore.DiamondRank7:
      return OrganizerRank.DiamondRank7;
    case OrganizerRank_Firestore.GhostRank0:
      return OrganizerRank.GhostRank0;
    default:
      return OrganizerRank.ClayRank1;
  }
};

export const convertAffiliateVisibilityGQLToDB = (
  visibility: AffiliateVisibility
): AffiliateVisibility_Firestore => {
  switch (visibility) {
    case AffiliateVisibility.Public:
      return AffiliateVisibility_Firestore.Public;
    case AffiliateVisibility.Private:
    default:
      return AffiliateVisibility_Firestore.Private;
  }
};

export const convertAffiliateVisibilityDBToGQL = (
  visibility: AffiliateVisibility_Firestore
): AffiliateVisibility => {
  switch (visibility) {
    case AffiliateVisibility_Firestore.Public:
      return AffiliateVisibility.Public;
    case AffiliateVisibility_Firestore.Private:
    default:
      return AffiliateVisibility.Private;
  }
};

export const convertAffiliateDBToGQL = (
  affiliate: Affiliate_Firestore
): Affiliate => {
  const res: Affiliate = {
    audienceSize: affiliate.audienceSize,
    avatar: affiliate.avatar,
    description: affiliate.description,
    id: affiliate.id,
    name: affiliate.name,
    publicContactEmail: affiliate.publicContactEmail,
    rank:
      convertOrganizerRankeDBToGQL(affiliate.organizerRank) ||
      null ||
      undefined,
    userID: affiliate.userID,
    visibility: convertAffiliateVisibilityDBToGQL(affiliate.visibility),
    website: affiliate.website,
  };

  return res;
};
