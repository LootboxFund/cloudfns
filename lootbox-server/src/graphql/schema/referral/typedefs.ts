import { gql } from "apollo-server";

const ReferralTypeDefs = gql`
  type ReferralTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type ClaimTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  enum ReferralStatus {
    pending
    pending_verification
    verification_sent
    complete
  }

  type Referee {
    userId: ID!
    isNewUser: Boolean!
  }

  type ClaimMetadataPartyBasket {
    tournamentId: ID!
    chosenPartyBasketId: ID!
  }

  type ReferralMetadataPartyBasket {
    tournamentId: ID!
    seedPartyBasketId: ID
  }

  type Claim {
    id: ID!
    referrerId: ID!
    referee: Referee
    status: ReferralStatus!
    metadata: ClaimMetadataPartyBasket
    timestamps: ClaimTimestamps!
  }

  type Referral {
    id: ID!
    referrerId: ID!
    creatorId: ID!
    slug: ID!
    campaignName: String
    nConversions: Int!
    metadata: ReferralMetadataPartyBasket!
    timestamps: ReferralTimestamps!
    claims: [Claim]
  }

  input CreateReferralPayload {
    campaignName: String!
    tournamentId: ID!
    partyBasketId: ID
  }

  type CreateReferralResponseSuccess {
    referral: Referral
  }

  union CreateReferralResponse = CreateReferralResponseSuccess | ResponseError

  extend type Mutation {
    createReferral(payload: CreateReferralPayload!): CreateReferralResponse!
  }
`;

export default ReferralTypeDefs;
