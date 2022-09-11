import { gql } from "apollo-server";

const AffiliateTypeDefs = gql`
  #extend type Query {
  # For an affiliate to see their own private profile
  # affiliateAdminView(affiliateID: ID!): AffiliateAdminViewResponse!
  # For another affiliate to view the public profile of another affiliate
  # affiliatePublicView(affiliateID: ID!): AffiliatePublicViewResponse!
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
  #}

  type Memo {
    id: ID!
  }

  #input UpgradeToAffiliatePayload {
  #  userID: ID!
  #}

  #extend type Mutation {
  # Upgrade a regular user and give them an affiliate account
  #UpgradeToAffiliate(
  #  payload: UpgradeToAffiliatePayload!
  #): UpgradeToAffiliateResponse!
  #}
`;

export default AffiliateTypeDefs;
