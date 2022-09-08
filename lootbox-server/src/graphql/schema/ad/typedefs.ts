import { gql } from "apollo-server";

const AdTypeDefs = gql`
  enum AdStatus {
    active
    inactive
    pending_review
    rejected
  }

  enum AdType {
    noob_cup
  }

  enum AdEventAction {
    view
    click
    timerElapsed
    videoTimestamp
  }

  type AdTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type Ad {
    id: ID!
    campaignId: ID!
    flightId: ID!
    creativeId: ID!
    creatorId: ID!
    status: AdStatus!
    name: String
    type: AdType!

    timestamps: AdTimestamps!

    impressions: Int!
    clicks: Int!
    uniqueClicks: Int!

    creative: Creative

    events: [AdEvent]
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
    flightId: ID!
    sessionId: ID! # unique for this users session
    campaignId: ID!
    action: AdEventAction!
    metadata: EventMetadata
    nonce: ID! # unique - prevents duplicate events
  }

  type DecisionAdApiBetaResponseSuccess {
    ad: Ad
  }

  union DecisionAdApiBetaResponse =
      DecisionAdApiBetaResponseSuccess
    | ResponseError

  extend type Query {
    decisionAdApiBeta(tournamentId: ID!): DecisionAdApiBetaResponse!
  }
`;

export default AdTypeDefs;
