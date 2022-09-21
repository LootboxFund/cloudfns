import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  AdvertiserID,
  AffiliateID,
  AffiliateType,
  OfferID,
  TournamentID,
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
} from "../../generated/types";
import { Context } from "../../server";
import { QueryReportOrganizerOfferPerfArgs } from "../../generated/types";
import {
  Affiliate,
  ReportOrganizerOfferPerfResponse,
} from "../../generated/types";
import {
  ReportAdvertiserAffiliatePerfResponse,
  QueryReportAdvertiserAffiliatePerfArgs,
} from "../../generated/types";

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
};

const analyticsComposition = {};

const resolvers = composeResolvers(AnalyticsResolvers, analyticsComposition);

export default resolvers;
