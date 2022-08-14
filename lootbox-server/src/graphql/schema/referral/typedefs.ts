import { gql } from "apollo-server";

const ReferralTypeDefs = gql`
  type ReferralTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type ClaimTimestamps {
    createdAt: Timestamp!
    completedAt: Timestamp
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  enum ClaimType {
    referral
    reward
  }

  enum ClaimStatus {
    pending
    pending_verification
    verification_sent
    complete
  }

  type Claim {
    id: ID!
    referrerId: ID
    referralCampaignName: String
    referralId: ID!
    referralSlug: ID!
    tournamentId: ID!
    tournamentName: String
    originPartyBasketId: ID
    chosenPartyBasketId: ID
    chosenPartyBasketAddress: ID
    chosenPartyBasketName: String
    chosenPartyBasketNFTBountyValue: String
    lootboxAddress: ID
    lootboxName: String
    rewardFromClaim: ID
    claimerUserId: ID
    status: ClaimStatus!
    type: ClaimType!
    timestamps: ClaimTimestamps!
    chosenPartyBasket: PartyBasket
  }

  type ClaimEdge {
    node: Claim!
    cursor: Timestamp!
  }

  type Referral {
    id: ID!
    referrerId: ID!
    creatorId: ID!
    slug: ID!
    tournamentId: ID!
    seedPartyBasketId: ID
    campaignName: String!
    nConversions: Int!
    timestamps: ReferralTimestamps!
    claims: [Claim!]
    tournament: Tournament
    seedPartyBasket: PartyBasket
  }

  type ReferralResponseSuccess {
    referral: Referral!
  }

  union ReferralResponse = ReferralResponseSuccess | ResponseError

  input CreateReferralPayload {
    campaignName: String
    tournamentId: ID!
    partyBasketId: ID
  }

  input CompleteClaimPayload {
    claimId: ID!
    chosenPartyBasketId: ID!
  }

  input CreateClaimPayload {
    referralSlug: ID!
  }

  type CreateReferralResponseSuccess {
    referral: Referral!
  }

  type CompleteClaimResponseSuccess {
    claim: Claim!
  }

  type CreateClaimResponseSuccess {
    claim: Claim!
  }

  type ClaimPageInfo {
    endCursor: Timestamp # Time of last claim timestamps.createdAt
    hasNextPage: Boolean!
  }

  type UserClaimsResponseSuccess {
    totalCount: Int!
    pageInfo: ClaimPageInfo!
    edges: [ClaimEdge!]!
  }

  union CreateClaimResponse = CreateClaimResponseSuccess | ResponseError

  union CompleteClaimResponse = CompleteClaimResponseSuccess | ResponseError

  union CreateReferralResponse = CreateReferralResponseSuccess | ResponseError

  union UserClaimsResponse = UserClaimsResponseSuccess | ResponseError

  extend type Query {
    referral(slug: ID!): ReferralResponse!
    userClaims(userId: ID!, first: Int!, after: Timestamp): UserClaimsResponse!
      @deprecated(reason: "Use public user resolver")
  }

  extend type Mutation {
    createReferral(payload: CreateReferralPayload!): CreateReferralResponse!
    createClaim(payload: CreateClaimPayload!): CreateClaimResponse!
    completeClaim(payload: CompleteClaimPayload!): CompleteClaimResponse!
  }
`;

export default ReferralTypeDefs;
