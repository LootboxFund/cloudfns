import { gql } from "apollo-server";

const AdvertiserTypeDefs = gql`
  type AdvertiserAdminViewResponseSuccess {
    id: ID!
    userID: ID!
    name: String!
    description: String
  }

  enum ConquestStatus {
    ACTIVE
    INACTIVE
    PLANNED
    ARCHIVED
  }

  type Conquest {
    id: ID!
    title: String!
    description: String
    startDate: Timestamp
    endDate: Timestamp
    advertiserID: ID!
    status: ConquestStatus
    spentBudget: Float
    maxBudget: Float

    tournaments: [ID!]!
  }

  type AdvertiserPublicViewResponseSuccess {
    id: ID!
    name: String!
  }

  type ListConquestPreviewsResponseSuccess {
    conquests: [ConquestPreview!]!
  }

  type ConquestPreview {
    id: ID!
    title: String!
    image: String
  }

  type GetConquestResponseSuccess {
    conquest: Conquest!
    tournaments: [TournamentPreview!]!
  }

  union AdvertiserAdminViewResponse =
      AdvertiserAdminViewResponseSuccess
    | ResponseError

  union AdvertiserPublicViewResponse =
      AdvertiserPublicViewResponseSuccess
    | ResponseError

  union ListConquestPreviewsResponse =
      ListConquestPreviewsResponseSuccess
    | ResponseError

  union GetConquestResponse = GetConquestResponseSuccess | ResponseError

  #extend type Query {
  # For advertiser to see their own private profile
  #advertiserAdminView(advertiserId: ID!): AdvertiserAdminViewResponse!
  # For affiliate to see public profile of an advertiser
  #advertiserPublicView(advertiserId: ID!): AdvertiserPublicViewResponse!
  # For advertiser to see their tournament campaigns (conquests list page)
  #listConquests(advertiserID: ID!): ListConquestPreviewsResponse!
  # For advertiser to see a specific campaign (conquest page)
  #getConquest(conquestID: ID!): GetConquestResponse!
  # For an advertiser to get their spendings report of total offers (analytics page)
  # generateAdvertiserSpendingReport(advertiserID: ID!): GetAdvertiserEarningsReportResponse!
  #}

  #input UpgradeToAdvertiserPayload {
  #  userID: ID!
  #}

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

  #extend type Mutation {
  # Upgrade a regular user and give them an advertiser account
  #upgradeToAdvertiser(
  #  payload: UpgradeToAdvertiserPayload!
  #): UpgradeToAdvertiserResponse!
  # Create a new tournament campaign (conquest)
  #createConquest(payload: CreateConquestPayload!): CreateConquestResponse!
  # Update a tournament campaign (conquest)
  #updateConquest(payload: UpdateConquestPayload!): UpdateConquestResponse!
  #}
`;

export default AdvertiserTypeDefs;
