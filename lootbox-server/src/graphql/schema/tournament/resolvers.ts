// import {
//   StatusCode,
//   GetMyProfileResponse,
//   MutationCreateUserWithPasswordArgs,
//   MutationConnectWalletArgs,
//   CreateUserResponse,
//   ConnectWalletResponse,
//   MutationAuthenticateWalletArgs,
//   MutationCreateUserWithWalletArgs,
//   Wallet,
//   AuthenticateWalletResponse,
//   Tournament,
// } from "../../generated/types";
// import {
//   getUser,
//   getUserWallets,
//   getWalletByAddress,
//   createUser,
//   createUserWallet,
// } from "../../../api/firestore";
// import { validateSignature } from "../../../api/ethers";
// import { Address } from "@wormgraph/helpers";
// import identityProvider from "../../../api/identityProvider";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  getLootboxSnapshotsForTournament,
  getTournamentById,
} from "../../../api/firestore";
import { TournamentID } from "../../../lib/types";
import {
  LootboxSnapshot,
  StatusCode,
  Tournament,
  TournamentResponse,
} from "../../generated/types";
import { Context } from "../../server";
// import { Context } from "../../server";
// import { isAuthenticated } from "../../../lib/permissionGuard";
// import { UserID } from "../../../lib/types";

const TournamentResolvers = {
  Query: {
    tournament: async (
      _,
      { id },
      constext: Context
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
  Mutation: {},
};

const tournamentResolverComposition = {};

const resolvers = composeResolvers(
  TournamentResolvers,
  tournamentResolverComposition
);

export default resolvers;
