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
    one_time
  }

  enum ReferralType {
    viral
    one_time
    genesis
  }

  enum ClaimStatus {
    pending
    pending_verification
    verification_sent
    complete
  }

  type Claim {
    id: ID!
    referrerId: ID # not used for reward claims
    referralCampaignName: String
    referralId: ID!
    referralSlug: ID!
    referralType: ReferralType
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
    rewardFromFriendReferred: ID
    claimerUserId: ID
    status: ClaimStatus!
    type: ClaimType!
    timestamps: ClaimTimestamps!
    chosenPartyBasket: PartyBasket
    tournament: Tournament
    userLink: PublicUser
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
    isRewardDisabled: Boolean @deprecated(reason: "Use ReferralType instead")
    type: ReferralType
  }

  type ReferralResponseSuccess {
    referral: Referral!
  }

  union ReferralResponse = ReferralResponseSuccess | ResponseError

  input BulkCreateReferralPayload {
    tournamentId: ID!
    type: ReferralType!
    numReferrals: Int!
    campaignName: String
    referrerId: ID # If null / undefined, uses the caller user id
    partyBasketId: ID # Optional
  }

  input CreateReferralPayload {
    campaignName: String
    tournamentId: ID!
    partyBasketId: ID
    isRewardDisabled: Boolean @deprecated(reason: "User referral.type instead")
    type: ReferralType # todo: make this required
  }

  input CompleteClaimPayload {
    claimId: ID!
    chosenPartyBasketId: ID!
  }

  input CreateClaimPayload {
    referralSlug: ID!
  }

  input GenerateClaimsCsvPayload {
    tournamentId: ID!
  }

  type CreateReferralResponseSuccess {
    referral: Referral!
  }

  type BulkCreateReferralResponseSuccess {
    csv: String!
  }

  type CompleteClaimResponseSuccess {
    claim: Claim!
  }

  type CreateClaimResponseSuccess {
    claim: Claim!
  }

  type GenerateClaimsCsvResponseSuccess {
    csv: String!
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

  type BulkReferralCSVRow {
    error: String!
    url: String!
  }

  union CreateClaimResponse = CreateClaimResponseSuccess | ResponseError

  union CompleteClaimResponse = CompleteClaimResponseSuccess | ResponseError

  union BulkCreateReferralResponse =
      BulkCreateReferralResponseSuccess
    | ResponseError

  union CreateReferralResponse = CreateReferralResponseSuccess | ResponseError

  union UserClaimsResponse = UserClaimsResponseSuccess | ResponseError

  union GenerateClaimsCsvResponse =
      GenerateClaimsCsvResponseSuccess
    | ResponseError

  extend type Query {
    referral(slug: ID!): ReferralResponse!
    userClaims(userId: ID!, first: Int!, after: Timestamp): UserClaimsResponse!
      @deprecated(reason: "Use public user resolver")
  }

  extend type Mutation {
    bulkCreateReferral(
      payload: BulkCreateReferralPayload!
    ): BulkCreateReferralResponse!
    createReferral(payload: CreateReferralPayload!): CreateReferralResponse!
    createClaim(payload: CreateClaimPayload!): CreateClaimResponse!
    completeClaim(payload: CompleteClaimPayload!): CompleteClaimResponse!
    generateClaimsCsv(
      payload: GenerateClaimsCsvPayload!
    ): GenerateClaimsCsvResponse!
  }
`;

export default ReferralTypeDefs;
