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

  type OrganizerOfferWhitelist {
    id: ID!
    organizerID: ID!
    offerID: ID!
    advertiserID: ID!
    timestamp: Timestamp!
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

  # ------ View Tournament as Organizer ------
  input ViewTournamentAsOrganizerInput {
    tournamentID: ID!
    affiliateID: ID!
  }
  type ViewTournamentAsOrganizerResponseSuccess {
    tournament: Tournament!
  }
  union ViewTournamentAsOrganizerResponse =
      ViewTournamentAsOrganizerResponseSuccess
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
    viewTournamentAsOrganizer(
      payload: ViewTournamentAsOrganizerInput!
    ): ViewTournamentAsOrganizerResponse!
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
  }
  type WhitelistAffiliateToOfferResponseSuccess {
    whitelist: OrganizerOfferWhitelist!
  }
  union WhitelistAffiliateToOfferResponse =
      WhitelistAffiliateToOfferResponseSuccess
    | ResponseError

  # ------ Remove an Affiliate from an Offer ------
  type RemoveWhitelistAffiliateToOfferResponseSuccess {
    message: String!
  }
  union RemoveWhitelistAffiliateToOfferResponse =
      RemoveWhitelistAffiliateToOfferResponseSuccess
    | ResponseError

  extend type Mutation {
    # Upgrade a regular user and give them an affiliate account
    upgradeToAffiliate(userID: ID!): UpgradeToAffiliateResponse!
    # Whitelist an offer to an affiliate (be careful about auth here)
    # whitelistAffiliateToOffer(
    #   payload: WhitelistAffiliateToOfferPayload!
    # ): WhitelistAffiliateToOfferResponse!
    # Remove whitelist of an offer to an affiliate (be careful about auth here)
    # removeWhitelistAffiliateToOffer(
    #   id: ID!
    # ): RemoveWhitelistAffiliateToOfferResponse!
  }
`;

export default AffiliateTypeDefs;
