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
    totalClaimCount: Int!
    completedClaimCount: Int!
    viralClaimCount: Int!
    bonusRewardClaimCount: Int!
    oneTimeClaimCount: Int!
  }
  type BaseClaimStatsForTournamentResponseSuccess {
    stats: BaseClaimStatsForTournament!
  }

  union BaseClaimStatsForTournamentResponse =
      BaseClaimStatsForTournamentResponseSuccess
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
  }
`;

export default AnalyticsTypeDefs;
