import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  getLootboxSnapshotsForTournament,
  getTournamentById,
  createTournament,
} from "../../../api/firestore";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { TournamentID } from "../../../lib/types";
import {
  CreateTournamentResponse,
  LootboxSnapshot,
  MutationCreateTournamentArgs,
  StatusCode,
  Tournament,
  TournamentResponse,
} from "../../generated/types";
import { Context } from "../../server";

const TournamentResolvers = {
  Query: {
    tournament: async (
      _,
      { id },
      context: Context
    ): Promise<TournamentResponse> => {
      try {
        const tournament = await getTournamentById(id);
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
  },
  Tournament: {
    lootboxSnapshots: async (
      tournament: Tournament
    ): Promise<LootboxSnapshot[]> => {
      return getLootboxSnapshotsForTournament(tournament.id as TournamentID);
    },
  },

  Mutation: {
    createTournament: async (
      _,
      { payload }: MutationCreateTournamentArgs
    ): Promise<CreateTournamentResponse> => {
      try {
        const tournament = await createTournament({
          title: payload.title,
          description: payload.description,
          tournamentLink: payload.tournamentLink,
        });

        return { tournament };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
  },

  TournamentResponse: {
    __resolveType: (obj: TournamentResponse) => {
      if ("tournament" in obj) {
        return "TournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  CreateTournamentResponse: {
    __resolveType: (obj: CreateTournamentResponse) => {
      if ("tournament" in obj) {
        return "CreateTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const tournamentResolverComposition = {
  "Mutation.createTournament": [isAuthenticated()],
};

const resolvers = composeResolvers(
  TournamentResolvers,
  tournamentResolverComposition
);

export default resolvers;
