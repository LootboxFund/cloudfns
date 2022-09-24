import { gql } from "apollo-server";

const MarketplaceTypeDefs = gql`
  type MarketplacePreviewOffer {
    id: ID!
    title: String!
    description: String
    image: String
    advertiserID: ID!
    advertiserName: String!
    advertiserAvatar: String!
    lowerEarn: Float!
    upperEarn: Float!
  }

  type MarketplacePreviewAffiliate {
    id: ID!
    name: String!
    avatar: String
    description: String
    rank: OrganizerRank
    publicContactEmail: String
  }

  # -------- Browse Active Offers --------
  type BrowseActiveOffersResponseSuccess {
    offers: [MarketplacePreviewOffer!]!
  }
  union BrowseActiveOffersResponse =
      BrowseActiveOffersResponseSuccess
    | ResponseError

  # -------- Browse All Affiliates --------
  type BrowseAllAffiliatesResponseSuccess {
    affiliates: [MarketplacePreviewAffiliate!]!
  }
  union BrowseAllAffiliatesResponse =
      BrowseAllAffiliatesResponseSuccess
    | ResponseError

  # -------- QUERIES --------
  extend type Query {
    browseActiveOffers: BrowseActiveOffersResponse!
    browseAllAffiliates: BrowseAllAffiliatesResponse!
  }
`;

export default MarketplaceTypeDefs;
