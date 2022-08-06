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
    referralId: ID!
    referralSlug: ID!
    tournamentId: ID!
    referrerId: ID
    chosenPartyBasketId: ID
    rewardFromClaim: ID
    claimerUserId: ID
    claimerIsNewUeser: Boolean
    status: ClaimStatus!
    type: ClaimType!
    timestamps: ClaimTimestamps!
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
    claims: [Claim]
  }

  input CreateReferralPayload {
    campaignName: String!
    tournamentId: ID!
    partyBasketId: ID
  }

  input CompleteClaimPayload {
    claimId: ID!
    chosenPartyBasketId: ID!
    isNewUser: Boolean!
  }

  input StartClaimPayload {
    referralSlug: ID!
  }

  type CreateReferralResponseSuccess {
    referral: Referral!
  }

  type CompleteClaimResponseSuccess {
    claim: Claim!
  }

  type StartClaimResponseSuccess {
    claim: Claim!
  }

  union StartClaimResponse = StartClaimResponseSuccess | ResponseError

  union CompleteClaimResponse = CompleteClaimResponseSuccess | ResponseError

  union CreateReferralResponse = CreateReferralResponseSuccess | ResponseError

  extend type Mutation {
    createReferral(payload: CreateReferralPayload!): CreateReferralResponse!
    startClaim(payload: StartClaimPayload!): StartClaimResponse!
    completeClaim(payload: CompleteClaimPayload!): CompleteClaimResponse!
  }
`;

export default ReferralTypeDefs;
