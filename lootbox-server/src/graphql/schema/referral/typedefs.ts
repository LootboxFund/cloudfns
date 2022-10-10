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
    promoterId: ID
    tournamentId: ID!
    tournamentName: String
    whitelistId: ID
    originLootboxId: ID
    lootboxID: ID
    lootboxAddress: ID
    isPostCosmic: Boolean
    lootboxName: String
    lootboxNFTBountyValue: String
    lootboxMaxTickets: Int
    rewardFromClaim: ID
    rewardFromFriendReferred: ID
    claimerUserId: ID
    status: ClaimStatus!
    type: ClaimType!
    timestamps: ClaimTimestamps!

    # GQL
    tournament: Tournament
    userLink: PublicUser
    chosenLootbox: Lootbox
    whitelist: MintWhitelistSignature # Whitelist when whitelistId is available
    # DEPRECATED
    chosenPartyBasket: PartyBasket @deprecated(reason: "Use Lootbox instead")
    originPartyBasketId: ID @deprecated(reason: "Use Lootbox instead")
    chosenPartyBasketId: ID @deprecated(reason: "Use Lootbox instead")
    chosenPartyBasketAddress: ID @deprecated(reason: "Use Lootbox instead")
    chosenPartyBasketName: String @deprecated(reason: "Use Lootbox instead")
    chosenPartyBasketNFTBountyValue: String
      @deprecated(reason: "Use Lootbox instead")
  }

  type ClaimEdge {
    node: Claim!
    cursor: Timestamp!
  }

  type Referral {
    id: ID!
    referrerId: ID!
    promoterId: ID
    creatorId: ID!
    slug: ID!
    tournamentId: ID!
    seedLootboxID: ID
    campaignName: String!
    nConversions: Int!
    timestamps: ReferralTimestamps!
    claims: [Claim!]
    tournament: Tournament
    type: ReferralType
    isPostCosmic: Boolean
    seedLootbox: Lootbox

    isRewardDisabled: Boolean @deprecated(reason: "Use ReferralType instead")
    seedPartyBasket: PartyBasket
      @deprecated(reason: "removing after Cosmic Lootbox Refactor")
    seedPartyBasketId: ID
      @deprecated(reason: "removing after Cosmic Lootbox Refactor")
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
    promoterId: ID # used for billing
    partyBasketId: ID # Optional
    lootboxID: ID # Optional
  }

  input CreateReferralPayload {
    campaignName: String
    tournamentId: ID!
    partyBasketId: ID
    lootboxID: ID # Optional
    isRewardDisabled: Boolean @deprecated(reason: "Use referral.type instead")
    type: ReferralType # todo: make this required
    referrerId: ID # If null / undefined, uses the caller user id
    promoterId: ID # used for billing
  }

  input CompleteClaimPayload {
    claimId: ID!
    chosenLootboxID: ID
    chosenPartyBasketId: ID # @deprecated(reason: "Use chosenLootboxId instead")
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
