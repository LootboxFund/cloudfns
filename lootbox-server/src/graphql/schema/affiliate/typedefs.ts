import { gql } from "apollo-server";

const AffiliateTypeDefs = gql`
  type Affiliate {
    id: ID!
    userID: ID!
    name: String
  }

  type Memo {
    id: ID!
  }

  # ------ Affiliate Admin View ------
  type AffiliateAdminViewResponseSuccess {
    affiliate: Affiliate!
  }
  union AffiliateAdminViewResponse =
      AffiliateAdminViewResponseSuccess
    | ResponseError

  # ------ Affiliate Public View ------
  type AffiliatePublicViewResponseSuccess {
    affiliate: Affiliate!
  }
  union AffiliatePublicViewResponse =
      AffiliatePublicViewResponseSuccess
    | ResponseError

  extend type Query {
    # For an affiliate to see their own private profile
    affiliateAdminView(affiliateID: ID!): AffiliateAdminViewResponse!
    # For another affiliate to view the public profile of another affiliate
    affiliatePublicView(affiliateID: ID!): AffiliatePublicViewResponse!
    # For an affiliate to list the other affiliates they are working with
    # listAffiliatePartners(advertiserID: ID!): ListAffiliatePartnersResponse!
    # For an advertiser to see the relationship stats between them and another affiliate
    #viewAdvertiserAffiliateRelationship(
    #  advertiserID: ID!
    #  affililateID: ID!
    #): ViewAdvertiserAffiliateRelationshipResponse!
    # For a tournament organizer affiliate to see the relationship stats between them and a promoter affiliate
    #viewOrganizerAffiliateRelationship(
    #  organizerAffiliateID: ID!
    #  promoterAffililateID: ID!
    #): ViewOrganizerAffiliateRelationshipResponse!
    # For a tournament organizer affililate to see their total earnings report
    # generateOrganizerAffiliateEarningsReport(
    #   affiliateID: ID!
    # ): GenerateAffiliateEarningsReportResponse!
    # For a tournament promoter affiliate to see their total earnings report
    # generatePromoterAffiliateEarningsReport(
    #   affiliateID: ID!
    # ): GenerateAffiliateEarningsReportResponse!
  }

  # ------ Upgrade to Affiliate ------
  type UpgradeToAffiliateResponseSuccess {
    affiliate: Affiliate!
  }
  union UpgradeToAffiliateResponse =
      UpgradeToAffiliateResponseSuccess
    | ResponseError

  # ------ Upgrade to Affiliate ------
  input WhitelistAffiliateToOfferPayload {
    affiliateID: ID!
    offerID: ID!
    advertiserID: ID!
  }
  type WhitelistAffiliateToOfferResponseSuccess {
    message: String!
  }
  union WhitelistAffiliateToOfferResponse =
      WhitelistAffiliateToOfferResponseSuccess
    | ResponseError

  extend type Mutation {
    # Upgrade a regular user and give them an affiliate account
    upgradeToAffiliate(userID: ID!): UpgradeToAffiliateResponse!
    # Whitelist an offer to an affiliate
    whitelistAffiliateToOffer(
      payload: WhitelistAffiliateToOfferPayload!
    ): WhitelistAffiliateToOfferResponse!
  }
`;

export default AffiliateTypeDefs;
