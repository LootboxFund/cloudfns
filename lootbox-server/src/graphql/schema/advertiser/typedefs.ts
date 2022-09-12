import { gql } from "apollo-server";

const AdvertiserTypeDefs = gql`
  enum ConquestStatus {
    ACTIVE
    INACTIVE
    PLANNED
    ARCHIVED
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
    createdBy: ID
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

  #type ListConquestPreviewsResponseSuccess {
  #  conquests: [ConquestPreview!]!
  #}

  #type GetConquestResponseSuccess {
  #  conquest: Conquest!
  #  tournaments: [TournamentPreview!]!
  #}

  #union ListConquestPreviewsResponse =
  #    ListConquestPreviewsResponseSuccess
  #  | ResponseError

  #union GetConquestResponse = GetConquestResponseSuccess | ResponseError

  extend type Query {
    # For advertiser to see their own private profile
    advertiserAdminView(advertiserId: ID!): AdvertiserAdminViewResponse!
    # For affiliate to see public profile of an advertiser
    advertiserPublicView(advertiserId: ID!): AdvertiserPublicViewResponse!
    # For advertiser to see their tournament campaigns (conquests list page)
    #listConquests(advertiserID: ID!): ListConquestPreviewsResponse!
    # For advertiser to see a specific campaign (conquest page)
    #getConquest(conquestID: ID!): GetConquestResponse!
    # For an advertiser to get their spendings report of total offers (analytics page)
    #generateAdvertiserSpendingReport(advertiserID: ID!): GetAdvertiserEarningsReportResponse!
  }

  #input CreateConquestPayload {
  #  title: String
  #}

  #input UpdateConquestPayload {
  #  id: ID!
  #  title: String
  #  description: String
  #  image: String
  #  startDate: Int
  #  endDate: Int
  #  status: ConquestStatus
  #  maxBudget: Float
  #}

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
  }
  type UpdateAdvertiserDetailsResponseSuccess {
    advertiser: Advertiser
  }
  union UpdateAdvertiserDetailsResponse =
      UpdateAdvertiserDetailsResponseSuccess
    | ResponseError

  extend type Mutation {
    # Upgrade a regular user and give them an advertiser account
    upgradeToAdvertiser(
      payload: UpgradeToAdvertiserPayload!
    ): UpgradeToAdvertiserResponse!
    #
    updateAdvertiserDetails(
      advertiserID: ID!
      payload: UpdateAdvertiserDetailsPayload!
    ): UpdateAdvertiserDetailsResponse!
    # Create a new tournament campaign (conquest)
    #createConquest(payload: CreateConquestPayload!): CreateConquestResponse!
    # Update a tournament campaign (conquest)
    #updateConquest(payload: UpdateConquestPayload!): UpdateConquestResponse!
  }
`;

export default AdvertiserTypeDefs;
