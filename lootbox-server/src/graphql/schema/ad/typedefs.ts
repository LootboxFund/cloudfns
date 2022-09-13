import { gql } from "apollo-server";

const AdTypeDefs = gql`
  enum AdStatus {
    Active
    Inactive
    PendingReview
    Rejected
  }

  enum AdSetStatus {
    Active
    Inactive
    PendingReview
    Rejected
  }

  enum Placement {
    AfterTicketClaim
    BeforePayout
    AfterPayout
    DailySpin
    TicketCarousel
  }

  enum AdEventAction {
    View
    Click
    TimerElapsed
    VideoTimestamp
  }

  type AdTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type AdSet {
    id: ID!
    name: String!
    description: String
    status: AdSetStatus!
    advertiserID: ID!
    placement: Placement!
    adIDs: [ID!]!
    offerIDs: [ID!]!
  }

  type Ad {
    id: ID!
    advertiserID: ID!
    status: AdStatus!
    name: String
    placement: Placement!
    timestamps: AdTimestamps!

    impressions: Int!
    clicks: Int!
    uniqueClicks: Int!

    creative: Creative!
    events: [AdEvent!]!
  }

  type EventMetadata {
    clickUrl: String
    verificationUrl: String
    timeElapsed: Int
  }

  type AdEvent {
    id: ID!
    timestamp: Timestamp!
    adId: ID!
    adSetId: ID!
    sessionId: ID! # unique for this users session
    campaignId: ID!
    action: AdEventAction!
    claimId: ID
    metadata: EventMetadata
    nonce: ID! # unique - prevents duplicate events
  }

  enum CreativeType {
    image
    video
  }
  input CreativeInput {
    creativeType: CreativeType!
    creativeLinks: [String!]!
    callToActionText: String!
    thumbnail: String!
    infographicLink: String
    creativeAspectRatio: String
    themeColor: String
  }
  type Creative {
    adID: ID!
    advertiserID: ID!
    creativeType: CreativeType!
    creativeLinks: [String!]!
    callToActionText: String
    thumbnail: String
    infographicLink: String
    creativeAspectRatio: String!
    themeColor: String
  }

  #type DecisionAdApiBetaResponseSuccess {
  #  ad: Ad
  #}

  #union DecisionAdApiBetaResponse =
  #    DecisionAdApiBetaResponseSuccess
  #  | ResponseError

  # -------- List Ads of Advertiser --------
  input ListAdsOfAdvertiserPayload {
    advertiserID: ID
  }
  type ListAdsOfAdvertiserResponseSuccess {
    ads: [Ad!]!
  }
  union ListAdsOfAdvertiserResponse =
      ListAdsOfAdvertiserResponseSuccess
    | ResponseError

  # -------- List AdSets of Advertiser --------
  input ListAdSetsOfAdvertiserPayload {
    advertiserID: ID
  }
  type ListAdSetsOfAdvertiserResponseSuccess {
    adSets: [AdSet!]!
  }
  union ListAdSetsOfAdvertiserResponse =
      ListAdSetsOfAdvertiserResponseSuccess
    | ResponseError

  extend type Query {
    # decisionAdApiBeta(tournamentId: ID!): DecisionAdApiBetaResponse!
    listAdsOfAdvertiser(
      payload: ListAdsOfAdvertiserPayload!
    ): ListAdsOfAdvertiserResponse!
    listAdSetsOfAdvertiser(
      payload: ListAdSetsOfAdvertiserPayload!
    ): ListAdSetsOfAdvertiserResponse!
    # viewAdSet(adSetID: ID!): ViewAdSetResponse!
    # viewAd(adID: ID!): ViewAdResponse!
  }

  # -------- Create Ad --------
  input CreateAdPayload {
    name: String!
    description: String
    status: AdStatus!
    placement: Placement!
    creative: CreativeInput!
    advertiserID: ID!
  }
  type CreateAdResponseSuccess {
    ad: Ad!
  }
  union CreateAdResponse = CreateAdResponseSuccess | ResponseError

  # -------- Edit Ad --------
  input EditAdPayload {
    id: ID!
    name: String
    description: String
    status: AdStatus
    creative: CreativeInput!
  }
  type EditAdResponseSuccess {
    ad: Ad!
  }
  union EditAdResponse = EditAdResponseSuccess | ResponseError

  # -------- Create AdSet --------
  input CreateAdSetPayload {
    name: String!
    description: String
    advertiserID: ID!
    status: AdSetStatus
    placement: Placement
    adIDs: [ID!]!
    offerIDs: [ID!]!
  }
  type CreateAdSetResponseSuccess {
    adSet: AdSet!
  }
  union CreateAdSetResponse = CreateAdSetResponseSuccess | ResponseError

  # -------- Edit AdSet --------
  input EditAdSetPayload {
    id: ID!
    name: String
    description: String
    status: AdSetStatus
    adIDs: [ID!]
    offerIDs: [ID!]
  }
  type EditAdSetResponseSuccess {
    adSet: AdSet!
  }
  union EditAdSetResponse = EditAdSetResponseSuccess | ResponseError

  extend type Mutation {
    createAd(payload: CreateAdPayload!): CreateAdResponse!
    editAd(payload: EditAdPayload!): EditAdResponse!
    createAdSet(payload: CreateAdSetPayload!): CreateAdSetResponse!
    editAdSet(payload: EditAdSetPayload!): EditAdSetResponse!
  }
`;

export default AdTypeDefs;
