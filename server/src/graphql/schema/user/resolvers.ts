import {
  QueryGetUserArgs,
  StatusCode,
  GetUserResponse,
  MutationCreateUserArgs,
  User,
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

const UserResolvers = {
  Query: {
    getUser: async (_, args: QueryGetUserArgs) => {
      try {
        const user = await getUser(args.id);
        if (!user) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "User not found",
            },
          };
        }
        return {
          user,
        };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err.message,
          },
        };
      }
    },
  },
  User: {
    wallets: async (user) => {
      return await getUserWallets(user.id);
    },
  },

  Mutation: {
    createUser: async (_, { payload }: MutationCreateUserArgs) => {
      if (payload.credentials.__typename === "CreateUserWithEmailCredentials") {
        return {
          error: {
            code: StatusCode.NotImplemented,
            message: "Please sign in using your wallet",
          },
        };
      }

      // Validate the signature is correct from the wallet
      // This will throw is not valid
      let address: Address;
      let nonce: string;

      try {
        const res = await validateSignature(
          payload.credentials.message,
          payload.credentials.signedMessage
        );

        address = res.address;
        nonce = res.nonce;
      } catch (err) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: err.message,
          },
        };
      }

      // Make sure the wallet is not already in use by someone
      try {
        const wallet = await getWalletByAddress(address);
        if (wallet) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Wallet already in use",
            },
          };
        }
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err.message,
          },
        };
      }

      // Create the user in the IDP
      const idpUser = await identityProvider.createUser({
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        emailVerified: true,
        claims: undefined,
      });

      // Create the user document in database
      let user: User;
      try {
        user = await createUser(idpUser, payload);
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err.message,
          },
        };
      }

      // Add the wallet to the user document
      try {
        const wallet = await createUserWallet({ userId: idpUser.id, address });
        user.wallets = [wallet];
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err.message,
          },
        };
      }

      return user;
    },
  },

  GetUserResponse: {
    __resolveType: (obj: GetUserResponse) => {
      if ("user" in obj) {
        return "UserResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

export default UserResolvers;
