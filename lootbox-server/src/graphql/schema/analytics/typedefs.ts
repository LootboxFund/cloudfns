import { gql } from "apollo-server";

const AnalyticsTypeDefs = gql`
  type AnalyticsAdEvent {
    id: ID!
    timestamp: Int!
    adID: ID
    adSetID: ID
    action: AdEventAction!
    activationEventMmpAlias: String
    activationID: ID
    organizerID: ID
    promoterID: ID
    tournamentID: ID
    advertiserID: ID
  }

  type AnalyticsMemo {
    id: ID!
    timestamp: Int!
    affiliateID: ID!
    affiliateType: AffiliateType!
    offerID: ID!
    advertiserID: ID!
    adEventID: ID!
    activationID: ID!
    mmpAlias: String!
    mmp: MeasurementPartnerType!
    tournamentID: ID
    amount: Float!
  }

  # --------------- _________Report ---------------
  # type _____ResponseSuccess {
  #   data: [AnalyticsAdEvent!]!
  # }
  # union _____Response = _____ResponseSuccess | ResponseError

  # --------------- reportAdvertiserOfferPerformance ---------------
  type ReportAdvertiserOfferPerformanceResponseSuccess {
    events: [AnalyticsAdEvent!]!
    memos: [AnalyticsMemo!]!
  }
  union ReportAdvertiserOfferPerformanceResponse =
      ReportAdvertiserOfferPerformanceResponseSuccess
    | ResponseError

  # --------------- reportAdvertiserTournamentPerf ---------------
  input ReportAdvertiserTournamentPerfInput {
    tournamentID: ID!
    advertiserID: ID!
  }
  type ReportAdvertiserTournamentPerfResponseSuccess {
    events: [AnalyticsAdEvent!]!
    memos: [AnalyticsMemo!]!
  }
  union ReportAdvertiserTournamentPerfResponse =
      ReportAdvertiserTournamentPerfResponseSuccess
    | ResponseError

  # --------------- reportAdvertiserAffiliatePerf ---------------
  input ReportAdvertiserAffiliatePerfInput {
    affiliateID: ID!
    affiliateType: AffiliateType!
    advertiserID: ID!
  }
  type ReportAdvertiserAffiliatePerfResponseSuccess {
    events: [AnalyticsAdEvent!]!
    memos: [AnalyticsMemo!]!
  }
  union ReportAdvertiserAffiliatePerfResponse =
      ReportAdvertiserAffiliatePerfResponseSuccess
    | ResponseError

  # --------------- reportOrganizerTournamentReport ---------------
  input ReportOrganizerTournamentPerfInput {
    tournamentID: ID!
    organizerID: ID!
  }
  type ReportOrganizerTournamentResponseSuccess {
    events: [AnalyticsAdEvent!]!
    memos: [AnalyticsMemo!]!
  }
  union ReportOrganizerTournamentResponse =
      ReportOrganizerTournamentResponseSuccess
    | ResponseError

  # --------------- reportOrganizerOfferPerf ---------------
  input ReportOrganizerOfferPerfInput {
    offerID: ID!
    organizerID: ID!
  }
  type ReportOrganizerOfferPerfResponseSuccess {
    events: [AnalyticsAdEvent!]!
    memos: [AnalyticsMemo!]!
  }
  union ReportOrganizerOfferPerfResponse =
      ReportOrganizerOfferPerfResponseSuccess
    | ResponseError

  # --------------- reportPromoterTournamentPerf ---------------
  input ReportPromoterTournamentPerfInput {
    tournamentID: ID!
    promoterID: ID!
  }
  type ReportPromoterTournamentPerfResponseSuccess {
    events: [AnalyticsAdEvent!]!
    memos: [AnalyticsMemo!]!
  }
  union ReportPromoterTournamentPerfResponse =
      ReportPromoterTournamentPerfResponseSuccess
    | ResponseError

  type BaseClaimStatsForTournament {
    # totalClaimCount: Int!
    # completedClaimCount: Int!
    # viralClaimCount: Int!
    # bonusRewardClaimCount: Int!
    # oneTimeClaimCount: Int!
    # completionRate: Int!
    totalClaimCount: Int!
    completedClaimCount: Int!
    viralClaimCount: Int!
    referralBonusClaimCount: Int!
    participationRewardCount: Int!
    airdropClaimCount: Int!
    pendingClaims: Int!
    originalClaims: Int!
    impressions: Int!
    allFans: Int!
    originalFans: Int!
    viralFans: Int!
    completionRate: Int!
    airdropCompletionRate: Int!
    totalMaxTickets: Int!
    participationFans: Int!
  }
  type BaseClaimStatsForTournamentResponseSuccess {
    stats: BaseClaimStatsForTournament!
  }

  union BaseClaimStatsForTournamentResponse =
      BaseClaimStatsForTournamentResponseSuccess
    | ResponseError

  type LootboxCompletedClaimsForTournamentRow {
    lootboxID: ID!
    lootboxName: String!
    maxTickets: Int!
    lootboxImg: String!
    claimCount: Int!
  }

  type LootboxCompletedClaimsForTournamentResponseSuccess {
    data: [LootboxCompletedClaimsForTournamentRow!]!
  }

  union LootboxCompletedClaimsForTournamentResponse =
      LootboxCompletedClaimsForTournamentResponseSuccess
    | ResponseError

  input DailyClaimStatisticsForTournamentInput {
    tournamentID: ID!
    # Like "2020-01-01"
    startDate: String!
    # Like "2020-01-12"
    endDate: String!
  }

  type DailyClaimStatisticsForTournamentRow {
    date: String!
    claimCount: Int!
    weekNormalized: Int!
    day: Int!
  }

  type DailyClaimStatisticsForTournamentResponseSuccess {
    data: [DailyClaimStatisticsForTournamentRow!]!
  }

  union DailyClaimStatisticsForTournamentResponse =
      DailyClaimStatisticsForTournamentResponseSuccess
    | ResponseError

  type ReferrerClaimsForTournamentRow {
    userName: String!
    userAvatar: String!
    userID: String!
    claimCount: Int!
  }

  type ReferrerClaimsForTournamentResponseSuccess {
    data: [ReferrerClaimsForTournamentRow!]!
  }

  union ReferrerClaimsForTournamentResponse =
      ReferrerClaimsForTournamentResponseSuccess
    | ResponseError

  type CampaignClaimsForTournamentRow {
    referralCampaignName: String!
    referralSlug: String!
    userAvatar: String!
    username: String!
    userID: String!
    claimCount: Int!
  }

  type CampaignClaimsForTournamentResponseSuccess {
    data: [CampaignClaimsForTournamentRow!]!
  }

  union CampaignClaimsForTournamentResponse =
      CampaignClaimsForTournamentResponseSuccess
    | ResponseError

  type BaseClaimStatsForLootbox {
    totalClaimCount: Int!
    completedClaimCount: Int!
    viralClaimCount: Int!
    bonusRewardClaimCount: Int!
    oneTimeClaimCount: Int!
    completionRate: Int!
    maxTickets: Int!
  }

  type BaseClaimStatsForLootboxResponseSuccess {
    stats: BaseClaimStatsForLootbox!
  }

  union BaseClaimStatsForLootboxResponse =
      BaseClaimStatsForLootboxResponseSuccess
    | ResponseError

  type ReferrerClaimsForLootboxRow {
    userName: String!
    userAvatar: String!
    userID: String!
    claimCount: Int!
  }

  type ReferrerClaimsForLootboxResponseSuccess {
    data: [ReferrerClaimsForLootboxRow!]!
  }

  union ReferrerClaimsForLootboxResponse =
      ReferrerClaimsForLootboxResponseSuccess
    | ResponseError

  type CampaignClaimsForLootboxRow {
    referralCampaignName: String!
    referralSlug: String!
    userAvatar: String!
    username: String!
    userID: String!
    claimCount: Int!
  }

  type CampaignClaimsForLootboxResponseSuccess {
    data: [CampaignClaimsForLootboxRow!]!
  }

  union CampaignClaimsForLootboxResponse =
      CampaignClaimsForLootboxResponseSuccess
    | ResponseError

  type ClaimerStatsForTournamentRow {
    claimerUserID: ID!
    username: String!
    userAvatar: String!
    claimCount: Int!
    claimType: String!
    totalUserClaimCount: Int!
    referralType: String!
  }

  type ClaimerStatsForTournamentResponseSuccess {
    data: [ClaimerStatsForTournamentRow!]!
  }

  union ClaimerStatsForTournamentResponse =
      ClaimerStatsForTournamentResponseSuccess
    | ResponseError

  type ClaimerStatsForLootboxTournamentRow {
    claimerUserID: String!
    lootboxID: String!
    username: String!
    userAvatar: String!
    claimCount: Int!
    claimType: String!
    totalUserClaimCount: Int!
    referralType: String!
  }

  type ClaimerStatsForLootboxTournamentResponseSuccess {
    data: [ClaimerStatsForLootboxTournamentRow!]!
  }

  union ClaimerStatsForLootboxTournamentResponse =
      ClaimerStatsForLootboxTournamentResponseSuccess
    | ResponseError

  # -------------------- Fans List For Tournament Analytics --------------------
  type FanListRowForTournament {
    userID: ID!
    username: String!
    avatar: String!
    claimsCount: Int!
    referralsCount: Int!
    participationRewardsCount: Int!
    joinedDate: Timestamp!
    favoriteLootbox: FansListFavoriteLootbox
  }
  type FansListFavoriteLootbox {
    lootboxID: ID!
    stampImage: String!
    name: String!
    count: Int!
  }
  type FansListForTournamentResponseSuccess {
    tournamentID: ID!
    fans: [FanListRowForTournament!]!
  }
  union FansListForTournamentResponse =
      FansListForTournamentResponseSuccess
    | ResponseError

  # -------------------- Fans List For Lootbox Analytics --------------------
  type FanListRowForLootbox {
    userID: ID!
    username: String!
    avatar: String!
    claimsCount: Int!
    referralsCount: Int!
    participationRewardsCount: Int!
    joinedDate: Timestamp!
  }
  type FansListForLootboxResponseSuccess {
    lootboxID: ID!
    fans: [FanListRowForLootbox!]!
  }
  union FansListForLootboxResponse =
      FansListForLootboxResponseSuccess
    | ResponseError

  input OfferActivationsForEventPayload {
    eventID: ID!
    offerID: ID!
  }

  type OfferActivationsForEventRow {
    activationName: String!
    adEventCount: Int!
    activationDescription: String!
    activationID: String!
  }

  type OfferActivationsForEventResponseSuccess {
    data: [OfferActivationsForEventRow!]!
  }

  union OfferActivationsForEventResponse =
      OfferActivationsForEventResponseSuccess
    | ResponseError

  type OfferActivationsRow {
    activationName: String!
    adEventCount: Int!
    activationDescription: String!
    activationID: String!
  }

  input OfferActivationsPayload {
    offerID: ID!
  }

  type OfferActivationsResponseSuccess {
    data: [OfferActivationsRow!]!
  }

  union OfferActivationsResponse =
      OfferActivationsResponseSuccess
    | ResponseError

  extend type Query {
    # advertiser to see how an offer performs across all tournaments & affiliates
    reportAdvertiserOfferPerformance(
      offerID: ID!
    ): ReportAdvertiserOfferPerformanceResponse!
    # advertiser to see how a tournament performs across all offers & affiliates
    reportAdvertiserTournamentPerf(
      payload: ReportAdvertiserTournamentPerfInput!
    ): ReportAdvertiserTournamentPerfResponse!
    # advertiser to see how an affiliate performs across all offers & tournaments
    reportAdvertiserAffiliatePerf(
      payload: ReportAdvertiserAffiliatePerfInput!
    ): ReportAdvertiserAffiliatePerfResponse!
    # organizer to see how a tournament performs across all offers
    reportOrganizerTournamentPerf(
      payload: ReportOrganizerTournamentPerfInput!
    ): ReportOrganizerTournamentResponse!
    # organizer to see how an offer performs across all tournaments
    reportOrganizerOfferPerf(
      payload: ReportOrganizerOfferPerfInput!
    ): ReportOrganizerOfferPerfResponse!
    # promoter to see how they performed in a tournament
    reportPromoterTournamentPerf(
      payload: ReportPromoterTournamentPerfInput!
    ): ReportPromoterTournamentPerfResponse!
    baseClaimStatsForTournament(
      tournamentID: ID!
    ): BaseClaimStatsForTournamentResponse!
    lootboxCompletedClaimsForTournament(
      tournamentID: ID!
    ): LootboxCompletedClaimsForTournamentResponse!
    dailyClaimStatisticsForTournament(
      payload: DailyClaimStatisticsForTournamentInput!
    ): DailyClaimStatisticsForTournamentResponse!
    referrerClaimsForTournament(
      tournamentID: ID!
    ): ReferrerClaimsForTournamentResponse!
    campaignClaimsForTournament(
      tournamentID: ID!
    ): CampaignClaimsForTournamentResponse!
    baseClaimStatsForLootbox(
      lootboxID: ID!
      tournamentID: ID
    ): BaseClaimStatsForLootboxResponse!
    referrerClaimsForLootbox(
      lootboxID: ID!
      tournamentID: ID
    ): ReferrerClaimsForLootboxResponse!
    campaignClaimsForLootbox(
      lootboxID: ID!
      tournamentID: ID
    ): CampaignClaimsForLootboxResponse!
    claimerStatsForTournament(eventID: ID!): ClaimerStatsForTournamentResponse!
    claimerStatisticsForLootboxTournament(
      lootboxID: ID!
      tournamentID: ID!
    ): ClaimerStatsForLootboxTournamentResponse!
    fansListForTournament(tournamentID: ID!): FansListForTournamentResponse!
    fansListForLootbox(lootboxID: ID!): FansListForLootboxResponse!
    offerActivationsForEvent(
      payload: OfferActivationsForEventPayload!
    ): OfferActivationsForEventResponse!
    offerActivations(
      payload: OfferActivationsPayload!
    ): OfferActivationsResponse!
  }
`;

export default AnalyticsTypeDefs;
