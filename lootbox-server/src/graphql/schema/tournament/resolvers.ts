import {
  StatusCode,
  GetMyProfileResponse,
  MutationCreateUserWithPasswordArgs,
  MutationConnectWalletArgs,
  CreateUserResponse,
  ConnectWalletResponse,
  MutationAuthenticateWalletArgs,
  MutationCreateUserWithWalletArgs,
  Wallet,
  AuthenticateWalletResponse,
  Tournament,
} from "../../generated/types";
import {
  getUser,
  getUserWallets,
  getWalletByAddress,
  createUser,
  createUserWallet,
} from "../../../api/firestore";
import { validateSignature } from "../../../api/ethers";
import { Address } from "@wormgraph/helpers";
import identityProvider from "../../../api/identityProvider";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Context } from "../../server";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { UserID } from "../../../lib/types";

const UserResolvers = {
  Query: {},
  Tournament: {
    lootboxes: async (tournament: Tournament) => {
      // return await getUserWallets(user.id as UserID);
    },
  },

  Mutation: {},
};

const userResolversComposition = {
  "Query.getTournament": [],
  "Mutation.tournament": [isAuthenticated()],
};

const resolvers = composeResolvers(UserResolvers, userResolversComposition);

export default resolvers;
