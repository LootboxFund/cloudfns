import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  AdvertiserID,
  AffiliateID,
  AffiliateType,
  LootboxID,
  OfferID,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
import {
  reportAdvertiserAffiliatePerf,
  reportAdvertiserOfferPerformance,
  reportAdvertiserTournamentPerf,
  reportOrganizerOfferPerf,
  reportOrganizerTournamentPerformance,
  reportPromoterTournamentPerformance,
} from "../../../api/firestore/analytics";
import {
  QueryReportAdvertiserOfferPerformanceArgs,
  QueryReportAdvertiserTournamentPerfArgs,
  QueryReportOrganizerTournamentPerfArgs,
  QueryReportPromoterTournamentPerfArgs,
  ReportAdvertiserOfferPerformanceResponse,
  ReportAdvertiserTournamentPerfResponse,
  ReportOrganizerTournamentResponse,
  ReportPromoterTournamentPerfResponse,
  Resolvers,
  StatusCode,
  BaseClaimStatsForTournamentResponse,
  QueryBaseClaimStatsForTournamentArgs,
  LootboxCompletedClaimsForTournamentResponse,
  QueryLootboxCompletedClaimsForTournamentArgs,
  QueryDailyClaimStatisticsForTournamentArgs,
  DailyClaimStatisticsForTournamentResponse,
  QueryReportOrganizerOfferPerfArgs,
  ReportOrganizerOfferPerfResponse,
  ReportAdvertiserAffiliatePerfResponse,
  QueryReportAdvertiserAffiliatePerfArgs,
  QueryReferrerClaimsForTournamentArgs,
  ReferrerClaimsForTournamentResponse,
  QueryCampaignClaimsForTournamentArgs,
  CampaignClaimsForTournamentResponse,
  BaseClaimStatsForLootboxResponse,
  QueryBaseClaimStatsForLootboxArgs,
  ReferrerClaimsForLootboxResponse,
  QueryReferrerClaimsForLootboxArgs,
  CampaignClaimsForLootboxResponse,
  QueryCampaignClaimsForLootboxArgs,
  ClaimerStatsForTournamentResponse,
  QueryClaimerStatsForTournamentArgs,
  ClaimerStatsForLootboxTournamentResponse,
  QueryClaimerStatisticsForLootboxTournamentArgs,
  FansListForTournamentResponse,
  QueryFansListForTournamentArgs,
} from "../../generated/types";
import { Context } from "../../server";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { getTournamentById } from "../../../api/firestore";
import {
  baseClaimStatisticsForTournament,
  campaignClaimsForTournament,
  dailyClaimStatisticsForTournament,
  lootboxCompletedClaimsForTournament,
  referrerClaimsForTournament,
} from "../../../api/analytics";
import { manifest } from "../../../manifest";
import * as analytics from "../../../service/analytics";

const AnalyticsResolvers: Resolvers = {
  Query: {
    reportAdvertiserOfferPerformance: async (
      _,
      { offerID }: QueryReportAdvertiserOfferPerformanceArgs,
      context: Context
    ): Promise<ReportAdvertiserOfferPerformanceResponse> => {
      try {
        const report = await reportAdvertiserOfferPerformance(
          offerID as OfferID
        );
        if (!report) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not generate advertiserOffer report for Offer ID ${offerID}`,
            },
          };
        }
        return report;
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    reportAdvertiserTournamentPerf: async (
      _,
      { payload }: QueryReportAdvertiserTournamentPerfArgs,
      context: Context
    ): Promise<ReportAdvertiserTournamentPerfResponse> => {
      const { tournamentID, advertiserID } = payload;
      try {
        const report = await reportAdvertiserTournamentPerf(
          tournamentID as TournamentID,
          advertiserID as AdvertiserID
        );
        if (!report) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not generate advertiserTouranment report for Tournament ID ${tournamentID}`,
            },
          };
        }
        return report;
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    reportAdvertiserAffiliatePerf: async (
      _,
      { payload }: QueryReportAdvertiserAffiliatePerfArgs,
      context: Context
    ): Promise<ReportAdvertiserAffiliatePerfResponse> => {
      const { affiliateID, affiliateType, advertiserID } = payload;
      try {
        const report = await reportAdvertiserAffiliatePerf(
          affiliateID as AffiliateID,
          affiliateType as AffiliateType,
          advertiserID as AdvertiserID
        );
        if (!report) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not generate advertiserAffiliate report for Affiliate ID ${affiliateID} of type ${affiliateType}`,
            },
          };
        }
        return report;
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    reportOrganizerTournamentPerf: async (
      _,
      { payload }: QueryReportOrganizerTournamentPerfArgs,
      context: Context
    ): Promise<ReportOrganizerTournamentResponse> => {
      const { tournamentID, organizerID } = payload;
      try {
        const report = await reportOrganizerTournamentPerformance(
          tournamentID as TournamentID,
          organizerID as AffiliateID
        );
        if (!report) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not generate organizerTournament report for Tournament ID ${tournamentID}`,
            },
          };
        }
        return report;
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    reportOrganizerOfferPerf: async (
      _,
      { payload }: QueryReportOrganizerOfferPerfArgs,
      context: Context
    ): Promise<ReportOrganizerOfferPerfResponse> => {
      const { offerID, organizerID } = payload;
      try {
        const report = await reportOrganizerOfferPerf(
          offerID as OfferID,
          organizerID as AffiliateID
        );
        if (!report) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not generate organizerOffer report for Offer ID ${offerID} for Organizer ID ${organizerID}`,
            },
          };
        }
        return report;
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    reportPromoterTournamentPerf: async (
      _,
      { payload }: QueryReportPromoterTournamentPerfArgs,
      context: Context
    ): Promise<ReportPromoterTournamentPerfResponse> => {
      const { tournamentID, promoterID } = payload;
      try {
        const report = await reportPromoterTournamentPerformance(
          tournamentID as TournamentID,
          promoterID as AffiliateID
        );
        if (!report) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not generate promoterTournament report for Tournament ID ${tournamentID} for Promoter ID ${promoterID}`,
            },
          };
        }
        return report;
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    baseClaimStatsForTournament: async (
      _,
      { tournamentID }: QueryBaseClaimStatsForTournamentArgs,
      context: Context
    ): Promise<BaseClaimStatsForTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      // Make sure the caller owns the tournament
      try {
        const tournament = await getTournamentById(
          tournamentID as TournamentID
        );

        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament ${tournamentID} not found`,
            },
          };
        }

        if (tournament.creatorId !== (context.userId as unknown as UserID)) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "Unauthorized",
            },
          };
        }

        const baseStats = await baseClaimStatisticsForTournament({
          queryParams: {
            tournamentID: tournamentID as TournamentID,
          },
          // table: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
          lootboxTable:
            manifest.bigQuery.datasets.firestoreExport.tables.lootbox.id,
          claimTable:
            manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
          lootboxTournamentSnapshotTable:
            manifest.bigQuery.datasets.firestoreExport.tables.lootboxSnapshot
              .id,
          userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
          location: manifest.bigQuery.datasets.firestoreExport.location,
        });

        return { stats: baseStats };
      } catch (err) {
        console.error(
          "Error in baseClaimForTournamentStats fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
          },
        };
      }
    },
    lootboxCompletedClaimsForTournament: async (
      _,
      { tournamentID }: QueryLootboxCompletedClaimsForTournamentArgs,
      context: Context
    ): Promise<LootboxCompletedClaimsForTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      // Make sure the caller owns the tournament
      try {
        const tournament = await getTournamentById(
          tournamentID as TournamentID
        );

        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament ${tournamentID} not found`,
            },
          };
        }

        if (tournament.creatorId !== (context.userId as unknown as UserID)) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "Unauthorized",
            },
          };
        }

        const { data } = await lootboxCompletedClaimsForTournament({
          queryParams: {
            tournamentID: tournamentID as TournamentID,
          },
          claimTable:
            manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
          lootboxTable:
            manifest.bigQuery.datasets.firestoreExport.tables.lootbox.id,
          lootboxSnapshotTable:
            manifest.bigQuery.datasets.firestoreExport.tables.lootboxSnapshot
              .id,
          location: manifest.bigQuery.datasets.firestoreExport.location,
        });

        return { data };
      } catch (err) {
        console.error(
          "Error in baseClaimForTournamentStats fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
          },
        };
      }
    },
    dailyClaimStatisticsForTournament: async (
      _,
      { payload }: QueryDailyClaimStatisticsForTournamentArgs,
      context: Context
    ): Promise<DailyClaimStatisticsForTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      // Make sure the caller owns the tournament
      try {
        const tournament = await getTournamentById(
          payload.tournamentID as TournamentID
        );

        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament ${payload.tournamentID} not found`,
            },
          };
        }

        if (tournament.creatorId !== (context.userId as unknown as UserID)) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "Unauthorized",
            },
          };
        }

        const { data } = await dailyClaimStatisticsForTournament({
          queryParams: {
            eventID: payload.tournamentID as TournamentID,
            endDate: payload.endDate,
            startDate: payload.startDate,
          },
          claimTable:
            manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
          location: manifest.bigQuery.datasets.firestoreExport.location,
        });

        return { data };
      } catch (err) {
        console.error(
          "Error in dailyClaimStatisticsForTournament fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
          },
        };
      }
    },
    referrerClaimsForTournament: async (
      _,
      { tournamentID }: QueryReferrerClaimsForTournamentArgs,
      context: Context
    ): Promise<ReferrerClaimsForTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      // Make sure the caller owns the tournament
      try {
        const tournament = await getTournamentById(
          tournamentID as TournamentID
        );

        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament ${tournamentID} not found`,
            },
          };
        }

        if (tournament.creatorId !== (context.userId as unknown as UserID)) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "Unauthorized",
            },
          };
        }

        const { data } = await referrerClaimsForTournament({
          queryParams: {
            tournamentID: tournamentID as TournamentID,
          },
          claimTable:
            manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
          userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
          location: manifest.bigQuery.datasets.firestoreExport.location,
        });

        return { data };
      } catch (err) {
        console.error(
          "Error in referrerClaimsForTournament fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
          },
        };
      }
    },
    campaignClaimsForTournament: async (
      _,
      { tournamentID }: QueryCampaignClaimsForTournamentArgs,
      context: Context
    ): Promise<CampaignClaimsForTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      // Make sure the caller owns the tournament
      try {
        const tournament = await getTournamentById(
          tournamentID as TournamentID
        );

        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament ${tournamentID} not found`,
            },
          };
        }

        if (tournament.creatorId !== (context.userId as unknown as UserID)) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "Unauthorized",
            },
          };
        }

        const { data } = await campaignClaimsForTournament({
          queryParams: {
            tournamentID: tournamentID as TournamentID,
          },
          claimTable:
            manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
          userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
          location: manifest.bigQuery.datasets.firestoreExport.location,
        });

        return { data };
      } catch (err) {
        console.error(
          "Error in campaignClaimsForTournament fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
          },
        };
      }
    },

    baseClaimStatsForLootbox: async (
      _,
      { lootboxID, tournamentID }: QueryBaseClaimStatsForLootboxArgs,
      context: Context
    ): Promise<BaseClaimStatsForLootboxResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      try {
        const data = await analytics.baseClaimStatsForLootbox(
          {
            lootboxID: lootboxID as LootboxID,
            eventID: tournamentID as TournamentID,
          },
          context.userId as unknown as UserID
        );

        return { stats: data };
      } catch (err: any) {
        console.error(
          "Error in baseClaimStatsForLootbox fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: err?.message || "An error occured",
          },
        };
      }
    },

    referrerClaimsForLootbox: async (
      _,
      { lootboxID, tournamentID }: QueryReferrerClaimsForLootboxArgs,
      context: Context
    ): Promise<ReferrerClaimsForLootboxResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      try {
        const data = await analytics.lootboxReferrerStatistics(
          {
            lootboxID: lootboxID as LootboxID,
            eventID: tournamentID as TournamentID,
          },
          context.userId as unknown as UserID
        );

        return { data };
      } catch (err: any) {
        console.error(
          "Error in referrerClaimsForLootbox fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,

            message: err?.message || "An error occured",
          },
        };
      }
    },

    campaignClaimsForLootbox: async (
      _,
      { lootboxID, tournamentID }: QueryCampaignClaimsForLootboxArgs,
      context: Context
    ): Promise<CampaignClaimsForLootboxResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      try {
        const { data } = await analytics.lootboxCampaignStatistics(
          {
            lootboxID: lootboxID as LootboxID,
            eventID: tournamentID as TournamentID,
          },
          context.userId as unknown as UserID
        );

        return { data };
      } catch (err: any) {
        console.error(
          "Error in campaignClaimsForLootbox fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: err?.message || "An error occured",
          },
        };
      }
    },

    claimerStatsForTournament: async (
      _,
      { eventID }: QueryClaimerStatsForTournamentArgs,
      context: Context
    ): Promise<ClaimerStatsForTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      try {
        const { data } = await analytics.claimerStatisticsForTournament(
          {
            eventID: eventID as TournamentID,
          },
          context.userId as unknown as UserID
        );

        return {
          data: data.map((row) => {
            return {
              claimerUserID: row.claimerUserID,
              username: row.username,
              userAvatar: row.userAvatar,
              claimCount: row.claimCount,
              claimType: row.claimType,
              totalUserClaimCount: row.totalUserClaimCount,
              referralType: row.referralType,
            };
          }),
        };
      } catch (err: any) {
        console.error(
          "Error in claimerStatsForTournament fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: err?.message || "An error occured",
          },
        };
      }
    },

    claimerStatisticsForLootboxTournament: async (
      _,
      {
        tournamentID: eventID,
        lootboxID,
      }: QueryClaimerStatisticsForLootboxTournamentArgs,
      context: Context
    ): Promise<ClaimerStatsForLootboxTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      try {
        const { data } = await analytics.claimerStatisticsForLootboxTournament(
          {
            eventID: eventID as TournamentID,
            lootboxID: lootboxID as LootboxID,
          },
          context.userId as unknown as UserID
        );

        return {
          data: data.map((row) => {
            return {
              lootboxID: row.lootboxID,
              claimerUserID: row.claimerUserID,
              username: row.username,
              userAvatar: row.userAvatar,
              claimCount: row.claimCount,
              claimType: row.claimType,
              totalUserClaimCount: row.totalUserClaimCount,
              referralType: row.referralType,
            };
          }),
        };
      } catch (err: any) {
        console.error(
          "Error in claimerStatisticsForLootboxTournament fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: err?.message || "An error occured",
          },
        };
      }
    },

    fansListForTournament: async (
      _,
      { tournamentID }: QueryFansListForTournamentArgs,
      context: Context
    ): Promise<FansListForTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      try {
        const fans = await analytics.fansListForTournament(
          { tournamentID },
          context.userId
        );

        return {
          tournamentID: tournamentID,
          fans,
        };
      } catch (err: any) {
        console.error(
          "Error in claimerStatisticsForLootboxTournament fetching tournament",
          err
        );
        return {
          error: {
            code: StatusCode.ServerError,
            message: err?.message || "An error occured",
          },
        };
      }
    },
  },

  ReportAdvertiserOfferPerformanceResponse: {
    __resolveType: (obj: ReportAdvertiserOfferPerformanceResponse) => {
      if ("events" in obj && "memos" in obj) {
        return "ReportAdvertiserOfferPerformanceResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ReportAdvertiserTournamentPerfResponse: {
    __resolveType: (obj: ReportAdvertiserTournamentPerfResponse) => {
      if ("events" in obj && "memos" in obj) {
        return "ReportAdvertiserTournamentPerfResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ReportAdvertiserAffiliatePerfResponse: {
    __resolveType: (obj: ReportAdvertiserAffiliatePerfResponse) => {
      if ("events" in obj && "memos" in obj) {
        return "ReportAdvertiserAffiliatePerfResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },
  ReportOrganizerTournamentResponse: {
    __resolveType: (obj: ReportOrganizerTournamentResponse) => {
      if ("events" in obj && "memos" in obj) {
        return "ReportOrganizerTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ReportOrganizerOfferPerfResponse: {
    __resolveType: (obj: ReportOrganizerOfferPerfResponse) => {
      if ("events" in obj && "memos" in obj) {
        return "ReportOrganizerOfferPerfResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ReportPromoterTournamentPerfResponse: {
    __resolveType: (obj: ReportPromoterTournamentPerfResponse) => {
      if ("events" in obj && "memos" in obj) {
        return "ReportPromoterTournamentPerfResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  BaseClaimStatsForTournamentResponse: {
    __resolveType: (obj: BaseClaimStatsForTournamentResponse) => {
      if ("stats" in obj) {
        return "BaseClaimStatsForTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  LootboxCompletedClaimsForTournamentResponse: {
    __resolveType: (obj: LootboxCompletedClaimsForTournamentResponse) => {
      if ("data" in obj) {
        return "LootboxCompletedClaimsForTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  DailyClaimStatisticsForTournamentResponse: {
    __resolveType: (obj: DailyClaimStatisticsForTournamentResponse) => {
      if ("data" in obj) {
        return "DailyClaimStatisticsForTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  FansListForTournamentResponse: {
    __resolveType: (obj: FansListForTournamentResponse) => {
      if ("fans" in obj && "tournamentID" in obj) {
        return "FansListForTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },

  ReferrerClaimsForTournamentResponse: {
    __resolveType: (obj: ReferrerClaimsForTournamentResponse) => {
      if ("data" in obj) {
        return "ReferrerClaimsForTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  CampaignClaimsForTournamentResponse: {
    __resolveType: (obj: CampaignClaimsForTournamentResponse) => {
      if ("data" in obj) {
        return "CampaignClaimsForTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  BaseClaimStatsForLootboxResponse: {
    __resolveType: (obj: BaseClaimStatsForLootboxResponse) => {
      if ("stats" in obj) {
        return "BaseClaimStatsForLootboxResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  ReferrerClaimsForLootboxResponse: {
    __resolveType: (obj: ReferrerClaimsForLootboxResponse) => {
      if ("data" in obj) {
        return "ReferrerClaimsForLootboxResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  CampaignClaimsForLootboxResponse: {
    __resolveType: (obj: CampaignClaimsForLootboxResponse) => {
      if ("data" in obj) {
        return "CampaignClaimsForLootboxResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  ClaimerStatsForTournamentResponse: {
    __resolveType: (obj: ClaimerStatsForTournamentResponse) => {
      if ("data" in obj) {
        return "ClaimerStatsForTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  ClaimerStatsForLootboxTournamentResponse: {
    __resolveType: (obj: ClaimerStatsForLootboxTournamentResponse) => {
      if ("data" in obj) {
        return "ClaimerStatsForLootboxTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const analyticsComposition = {
  "Query.baseClaimStatsForTournament": [isAuthenticated()],
  "Query.lootboxCompletedClaimsForTournament": [isAuthenticated()],
  "Query.dailyClaimStatisticsForTournament": [isAuthenticated()],
  "Query.referrerClaimsForTournament": [isAuthenticated()],
  "Query.campaignClaimsForTournament": [isAuthenticated()],
  "Query.baseClaimStatsForLootbox": [isAuthenticated()],
  "Query.referrerClaimsForLootbox": [isAuthenticated()],
  "Query.campaignClaimsForLootbox": [isAuthenticated()],
  "Query.claimerStatsForTournament": [isAuthenticated()],
  "Query.claimerStatsForLootboxTournament": [isAuthenticated()],
};

const resolvers = composeResolvers(AnalyticsResolvers, analyticsComposition);

export default resolvers;
