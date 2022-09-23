import { gql } from "apollo-server";

const AffiliateTypeDefs = gql`
  type Affiliate {
    id: ID!
    userID: ID!
    name: String!
    avatar: String
  }

  type Memo {
    id: ID!
  }

  enum OrganizerOfferWhitelistStatus {
    Active
    Inactive
    Planned
    Archived
  }

  type OrganizerOfferWhitelist {
    id: ID!
    organizerID: ID!
    offerID: ID!
    advertiserID: ID!
    timestamp: Timestamp!
    status: OrganizerOfferWhitelistStatus!
  }

  type OrganizerOfferWhitelistWithProfile {
    whitelist: OrganizerOfferWhitelist!
    organizer: OrganizerOfferPreview!
  }
  type OrganizerOfferPreview {
    id: ID!
    name: String!
    avatar: String
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

  # ------ Affiliate View Tournaments ------
  type ViewMyTournamentsAsOrganizerResponseSuccess {
    tournaments: [Tournament!]!
  }
  union ViewMyTournamentsAsOrganizerResponse =
      ViewMyTournamentsAsOrganizerResponseSuccess
    | ResponseError

  # ------ View List of Whitelisted Affiliates to Offer ------
  input ListWhitelistedAffiliatesToOfferPayload {
    offerID: ID!
  }
  type ListWhitelistedAffiliatesToOfferResponseSuccess {
    whitelists: [OrganizerOfferWhitelistWithProfile!]!
  }
  union ListWhitelistedAffiliatesToOfferResponse =
      ListWhitelistedAffiliatesToOfferResponseSuccess
    | ResponseError

  extend type Query {
    # For an affiliate to see their own private profile
    affiliateAdminView(affiliateID: ID!): AffiliateAdminViewResponse!
    # For another affiliate to view the public profile of another affiliate
    affiliatePublicView(affiliateID: ID!): AffiliatePublicViewResponse!
    #
    viewMyTournamentsAsOrganizer(
      affiliateID: ID!
    ): ViewMyTournamentsAsOrganizerResponse!
    #
    listWhitelistedAffiliatesToOffer(
      payload: ListWhitelistedAffiliatesToOfferPayload!
    ): ListWhitelistedAffiliatesToOfferResponse!
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

  # ------ Whitelist an Affiliate to an Offer ------
  input WhitelistAffiliateToOfferPayload {
    affiliateID: ID!
    offerID: ID!
    advertiserID: ID!
    status: OrganizerOfferWhitelistStatus!
  }
  type WhitelistAffiliateToOfferResponseSuccess {
    whitelist: OrganizerOfferWhitelist!
  }
  union WhitelistAffiliateToOfferResponse =
      WhitelistAffiliateToOfferResponseSuccess
    | ResponseError

  # ------ Edit an Affiliate from an Offer ------
  input EditWhitelistAffiliateToOfferPayload {
    id: ID!
    affiliateID: ID!
    offerID: ID!
    advertiserID: ID!
    status: OrganizerOfferWhitelistStatus!
  }
  input EditWhitelistAffiliateToOfferPayload {
    affiliateID: ID!
    offerID: ID!
    advertiserID: ID!
    status: OrganizerOfferWhitelistStatus!
  }
  type EditWhitelistAffiliateToOfferResponseSuccess {
    whitelist: OrganizerOfferWhitelist!
  }
  union EditWhitelistAffiliateToOfferResponse =
      EditWhitelistAffiliateToOfferResponseSuccess
    | ResponseError

  extend type Mutation {
    # Upgrade a regular user and give them an affiliate account
    upgradeToAffiliate(userID: ID!): UpgradeToAffiliateResponse!
    # Whitelist an offer to an affiliate (be careful about auth here)
    whitelistAffiliateToOffer(
      payload: WhitelistAffiliateToOfferPayload!
    ): WhitelistAffiliateToOfferResponse!
    # Remove whitelist of an offer to an affiliate (be careful about auth here)
    editWhitelistAffiliateToOffer(
      payload: EditWhitelistAffiliateToOfferPayload!
    ): EditWhitelistAffiliateToOfferResponse!
  }
`;

export default AffiliateTypeDefs;
