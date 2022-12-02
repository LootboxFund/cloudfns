import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  AdvertiserID,
  AffiliateID,
  AffiliateType,
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
} from "../../generated/types";
import { Context } from "../../server";
import { QueryReportOrganizerOfferPerfArgs } from "../../generated/types";
import { ReportOrganizerOfferPerfResponse } from "../../generated/types";
import {
  ReportAdvertiserAffiliatePerfResponse,
  QueryReportAdvertiserAffiliatePerfArgs,
} from "../../generated/types";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { getTournamentById } from "../../../api/firestore";
import {
  baseClaimStatisticsForTournament,
  dailyClaimStatisticsForTournament,
  lootboxCompletedClaimsForTournament,
} from "../../../api/analytics";
import { manifest } from "../../../manifest";

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
          table: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
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
};

const analyticsComposition = {
  "Query.baseClaimStatsForTournament": [isAuthenticated()],
  "Query.lootboxCompletedClaimsForTournament": [isAuthenticated()],
  "Query.dailyClaimStatisticsForTournament": [isAuthenticated()],
};

const resolvers = composeResolvers(AnalyticsResolvers, analyticsComposition);

export default resolvers;
