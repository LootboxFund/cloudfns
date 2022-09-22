import { gql } from "apollo-server";

const AdvertiserTypeDefs = gql`
  enum ConquestStatus {
    Active
    Inactive
    Planned
    Archived
  }

  type Advertiser {
    id: ID!
    userID: ID!
    name: String
    description: String
    offers: [ID!]!
    conquests: [Conquest!]!
  }

  type Conquest {
    id: ID!
    title: String!
    description: String
    image: String
    startDate: Timestamp
    endDate: Timestamp
    advertiserID: ID!
    status: ConquestStatus!
    spentBudget: Float
    maxBudget: Float
    tournaments: [ID!]!
  }

  type ConquestPreview {
    id: ID!
    title: String!
    image: String
  }

  # ------ AdvertiserAdminView ------
  type AdvertiserAdminViewResponseSuccess {
    id: ID!
    userID: ID!
    name: String!
    description: String
    avatar: String!
  }
  union AdvertiserAdminViewResponse =
      AdvertiserAdminViewResponseSuccess
    | ResponseError

  # ------ AdvertiserPublicView ------
  type AdvertiserPublicViewResponseSuccess {
    id: ID!
    name: String!
    description: String
  }
  union AdvertiserPublicViewResponse =
      AdvertiserPublicViewResponseSuccess
    | ResponseError

  # ------ ListConquestPreviews ------
  type ListConquestPreviewsResponseSuccess {
    conquests: [ConquestPreview!]!
  }
  union ListConquestPreviewsResponse =
      ListConquestPreviewsResponseSuccess
    | ResponseError

  # ------ GetConquest ------
  type GetConquestResponseSuccess {
    conquest: Conquest!
    tournaments: [TournamentPreview!]!
  }
  union GetConquestResponse = GetConquestResponseSuccess | ResponseError

  # ------ listEventsOfAdvertiser ------
  type ListEventsOfAdvertiserResponseSuccess {
    tournaments: [TournamentPreview!]!
  }
  union ListEventsOfAdvertiserResponse =
      ListEventsOfAdvertiserResponseSuccess
    | ResponseError

  # ------ listPartnersOfAdvertiser ------
  type ListPartnersOfAdvertiserResponseSuccess {
    partners: [Affiliate!]!
  }
  union ListPartnersOfAdvertiserResponse =
      ListPartnersOfAdvertiserResponseSuccess
    | ResponseError

  extend type Query {
    # For advertiser to see their own private profile
    advertiserAdminView: AdvertiserAdminViewResponse!
    # For affiliate to see public profile of an advertiser
    advertiserPublicView(advertiserId: ID!): AdvertiserPublicViewResponse!
    # For advertiser to see their tournament campaigns (conquests list page)
    listConquestPreviews(advertiserID: ID!): ListConquestPreviewsResponse!
    # For advertiser to see a specific campaign (conquest page)
    getConquest(advertiserID: ID!, conquestID: ID!): GetConquestResponse!
    # For advertiser to see their events
    listEventsOfAdvertiser(advertiserID: ID!): ListEventsOfAdvertiserResponse!
    # For advertiser to see their partners
    listPartnersOfAdvertiser(
      advertiserID: ID!
    ): ListPartnersOfAdvertiserResponse!
    # For an advertiser to get their spendings report of total offers (analytics page)
    #generateAdvertiserSpendingReport(advertiserID: ID!): GetAdvertiserEarningsReportResponse!
  }

  # ------ UpgradeToAdvertiser ------
  input UpgradeToAdvertiserPayload {
    userID: ID!
  }
  type UpgradeToAdvertiserResponseSuccess {
    advertiser: Advertiser
  }
  union UpgradeToAdvertiserResponse =
      UpgradeToAdvertiserResponseSuccess
    | ResponseError

  # ------ UpdateAdvertiserDetails ------
  input UpdateAdvertiserDetailsPayload {
    name: String
    description: String
    avatar: String
  }
  type UpdateAdvertiserDetailsResponseSuccess {
    advertiser: Advertiser
  }
  union UpdateAdvertiserDetailsResponse =
      UpdateAdvertiserDetailsResponseSuccess
    | ResponseError

  # ------ createConquest ------
  input CreateConquestPayload {
    title: String!
  }
  type CreateConquestResponseSuccess {
    conquest: Conquest
  }
  union CreateConquestResponse = CreateConquestResponseSuccess | ResponseError

  # ------ updateConquest ------
  input UpdateConquestPayload {
    id: ID!
    title: String
    description: String
    image: String
    startDate: Timestamp
    endDate: Timestamp
    status: ConquestStatus
    tournaments: [ID!]
  }
  type UpdateConquestResponseSuccess {
    conquest: Conquest
  }
  union UpdateConquestResponse = UpdateConquestResponseSuccess | ResponseError

  extend type Mutation {
    # Upgrade a regular user and give them an advertiser account
    upgradeToAdvertiser(
      payload: UpgradeToAdvertiserPayload!
    ): UpgradeToAdvertiserResponse!
    # Update advertiser details
    updateAdvertiserDetails(
      advertiserID: ID!
      payload: UpdateAdvertiserDetailsPayload!
    ): UpdateAdvertiserDetailsResponse!
    # Create a new tournament campaign (conquest)
    createConquest(
      advertiserID: ID!
      payload: CreateConquestPayload!
    ): CreateConquestResponse!
    # Update a tournament campaign (conquest)
    updateConquest(
      advertiserID: ID!
      payload: UpdateConquestPayload!
    ): UpdateConquestResponse!
  }
`;

export default AdvertiserTypeDefs;
