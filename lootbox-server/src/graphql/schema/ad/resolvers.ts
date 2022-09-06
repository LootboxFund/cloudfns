import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  getAdById,
  getClaimById,
  getCreativeById,
  getTournamentById,
} from "../../../api/firestore";
import { AdID, ClaimID, CreativeID, TournamentID } from "../../../lib/types";
import {
  Resolvers,
  QueryDecisionAdApiBetaArgs,
  DecisionAdApiBetaResponse,
  StatusCode,
  Ad,
  Creative,
} from "../../generated/types";

const AdResolvers: Resolvers = {
  Query: {
    decisionAdApiBeta: async (
      _,
      args: QueryDecisionAdApiBetaArgs
    ): Promise<DecisionAdApiBetaResponse> => {
      try {
        const tournament = await getTournamentById(
          args.tournamentId as TournamentID
        );

        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Tournament not found",
            },
          };
        }

        if (tournament.affiliateAdIds && tournament.affiliateAdIds.length > 0) {
          // get the first ad
          const ad = await getAdById(tournament.affiliateAdIds[0] as AdID);
          return { ad: !!ad ? ad : null };
        }
        return { ad: null };
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

  Ad: {
    creative: async (ad: Ad): Promise<Creative | null> => {
      const creative = await getCreativeById(ad.creativeId as CreativeID);
      if (!creative) {
        return null;
      } else {
        return creative;
      }
    },
  },

  DecisionAdApiBetaResponse: {
    __resolveType: (obj: DecisionAdApiBetaResponse) => {
      if ("ad" in obj) {
        return "DecisionAdApiBetaResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const adComposition = {};

const resolvers = composeResolvers(AdResolvers, adComposition);

export default resolvers;
