import { gql } from "apollo-server";

const AdTypeDefs = gql`
  enum AdStatus {
    Active
    Inactive
    PendingReview
    Rejected
    Archived
    Planned
  }

  enum AdSetStatus {
    Active
    Inactive
    PendingReview
    Rejected
    Archived
    Planned
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
    Activation
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
    thumbnail: String
    status: AdSetStatus!
    advertiserID: ID!
    placement: Placement!
    offerIDs: [ID!]!
    adIDs: [ID!]!
    ads: [Ad!]
  }

  type Ad {
    id: ID!
    advertiserID: ID!
    status: AdStatus!
    name: String!
    placement: Placement!
    timestamps: AdTimestamps!
    publicInfo: String!
    description: String
    impressions: Int!
    clicks: Int!
    uniqueClicks: Int!

    creative: Creative!
  }

  type EventMetadata {
    clickUrl: String
    verificationUrl: String
    timeElapsed: Int
  }

  type AdEventAffiliateAttribution {
    organizerID: ID
    promoterID: ID
    userID: ID
    tournamentID: ID
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
    affiliateAttribution: AdEventAffiliateAttribution
    nonce: ID! # unique - prevents duplicate events
  }

  enum AspectRatio {
    Square1x1
    Portrait9x16
    Portrait2x3
    Landscape16x9
    Tablet4x5
  }

  enum CreativeType {
    image
    video
  }
  input CreativeInputCreate {
    creativeType: CreativeType!
    creativeLinks: [String!]!
    callToAction: String!
    thumbnail: String!
    infographicLink: String
    aspectRatio: AspectRatio!
    themeColor: String
  }
  input CreativeInputEdit {
    creativeType: CreativeType
    creativeLinks: [String!]
    callToAction: String
    thumbnail: String
    infographicLink: String
    aspectRatio: AspectRatio
    themeColor: String
  }
  type Creative {
    adID: ID!
    advertiserID: ID!
    creativeType: CreativeType!
    creativeLinks: [String!]!
    callToAction: String!
    thumbnail: String!
    infographicLink: String
    aspectRatio: AspectRatio!
    themeColor: String!
  }

  type AdServed {
    adID: ID!
    adSetID: ID!
    advertiserID: ID!
    advertiserName: String!
    offerID: ID!
    creative: Creative!
    flightID: ID!
    placement: Placement!
    pixelUrl: String!
    clickDestination: String!
  }

  # -------- Decision Ad API Beta V2 --------
  input DecisionAdApiBetaV2Payload {
    userID: ID!
    tournamentID: ID!
    placement: Placement!
    sessionID: ID!
    promoterID: ID
    claimID: ID
  }

  type DecisionAdApiBetaV2ResponseSuccess {
    ad: AdServed
  }

  union DecisionAdApiBetaV2Response =
      DecisionAdApiBetaV2ResponseSuccess
    | ResponseError

  # -------- List Ads of Advertiser --------
  type ListAdsOfAdvertiserResponseSuccess {
    ads: [Ad!]!
  }
  union ListAdsOfAdvertiserResponse =
      ListAdsOfAdvertiserResponseSuccess
    | ResponseError

  # -------- List AdSets of Advertiser --------
  type ListAdSetsOfAdvertiserResponseSuccess {
    adSets: [AdSet!]!
  }
  union ListAdSetsOfAdvertiserResponse =
      ListAdSetsOfAdvertiserResponseSuccess
    | ResponseError

  # -------- View AdSet --------
  type ViewAdSetResponseSuccess {
    adSet: AdSet!
  }
  union ViewAdSetResponse = ViewAdSetResponseSuccess | ResponseError
  type ViewAdResponseSuccess {
    ad: Ad!
  }
  union ViewAdResponse = ViewAdResponseSuccess | ResponseError

  # -------- View Ad --------

  extend type Query {
    decisionAdApiBetaV2(
      payload: DecisionAdApiBetaV2Payload!
    ): DecisionAdApiBetaV2Response!
    listAdsOfAdvertiser(advertiserID: ID!): ListAdsOfAdvertiserResponse!
    listAdSetsOfAdvertiser(advertiserID: ID!): ListAdSetsOfAdvertiserResponse!
    viewAdSet(adSetID: ID!): ViewAdSetResponse!
    viewAd(adID: ID!): ViewAdResponse!
  }

  # -------- Create Ad --------
  input CreateAdPayload {
    name: String!
    description: String
    publicInfo: String!
    status: AdStatus!
    placement: Placement!
    creative: CreativeInputCreate!
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
    publicInfo: String
    status: AdStatus
    creative: CreativeInputEdit
    placement: Placement
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
    status: AdSetStatus!
    placement: Placement!
    thumbnail: String
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
    placement: Placement
    thumbnail: String
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
