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
    referrerId: ID
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

  type ClaimsCsvRow {
    # tournament
    tournamentId: String!
    tournamentName: String!

    # referral
    referralId: String!
    referralCampaignName: String!
    referralSlug: String!
    referralLink: String!
    referralType: String!

    # claim
    claimId: String!
    claimStatus: ClaimStatus!
    claimType: ClaimType!
    rewardFromClaim: String!
    rewardFromFriendReferred: String!

    # user (claimer) & referrer
    claimerId: String!
    claimerUsername: String!
    claimerProfileLink: String!
    claimerSocial_Facebook: String!
    claimerSocial_Twitter: String!
    claimerSocial_Instagram: String!
    claimerSocial_TikTok: String!
    claimerSocial_Discord: String!
    claimerSocial_Snapchat: String!
    claimerSocial_Twitch: String!
    claimerSocial_Web: String!

    # socials for referrer
    referrerId: String!
    referrerUsername: String!
    referrerProfileLink: String!
    referrerSocial_Facebook: String!
    referrerSocial_Twitter: String!
    referrerSocial_Instagram: String!
    referrerSocial_TikTok: String!
    referrerSocial_Discord: String!
    referrerSocial_Snapchat: String!
    referrerSocial_Twitch: String!
    referrerSocial_Web: String!

    # lootbox + party baskets
    lootboxAddress: String!
    lootboxName: String!
    lootboxLink: String!

    partyBasketId: String!
    partyBasketName: String!
    partyBasketRedeemLink: String!
    partyBasketManageLink: String!
    partyBasketAddress: String!
    partyBasketNFTBountyValue: String!

    originPartyBasketId: String!
    # originPartyBasketName: String!
    # originPartyBasketLink: String!
    # originPartyBasketAddress: String!

    # timestamp
    claimCreatedAt: Timestamp!
    claimUpdatedAt: Timestamp!
  }

  union ReferralResponse = ReferralResponseSuccess | ResponseError

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

  union CreateClaimResponse = CreateClaimResponseSuccess | ResponseError

  union CompleteClaimResponse = CompleteClaimResponseSuccess | ResponseError

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
    createReferral(payload: CreateReferralPayload!): CreateReferralResponse!
    createClaim(payload: CreateClaimPayload!): CreateClaimResponse!
    completeClaim(payload: CompleteClaimPayload!): CompleteClaimResponse!
    generateClaimsCsv(
      payload: GenerateClaimsCsvPayload!
    ): GenerateClaimsCsvResponse!
  }
`;

export default ReferralTypeDefs;
