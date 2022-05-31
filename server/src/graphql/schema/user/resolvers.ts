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
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Context } from "../../server";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { UserID } from "../../../lib/types";

const UserResolvers = {
  Query: {
    /** Note: wallets get added async below */
    getMyProfile: async (_, _args, context: Context) => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "You are not authenticated!",
          },
        };
      }

      try {
        const user = await getUser(context.userId);
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
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
  },
  User: {
    wallets: async (user: User) => {
      return await getUserWallets(user.id as UserID);
    },
  },

  Mutation: {
    createUserWithPassword: async (
      _,
      { payload }: MutationCreateUserWithPasswordArgs
    ) => {
      try {
        // Create the user in the IDP
        const idpUser = await identityProvider.createUser({
          email: payload.email,
          phoneNumber: payload.phoneNumber || undefined,
          emailVerified: false,
          password: payload.password,
        });

        const user = await createUser(idpUser, {
          firstName: payload.firstName || undefined,
          lastName: payload.lastName || undefined,
        });
        user.wallets = [];
        return { user };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    createUserWithWallet: async (
      _,
      { payload }: MutationCreateUserWithWalletArgs
    ) => {
      // Validate the signature is correct from the wallet
      let address: Address;
      let nonce: string;

      try {
        const res = await validateSignature(
          payload?.message,
          payload?.signedMessage
        );

        address = res.address;
        nonce = res.nonce;
      } catch (err) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: err instanceof Error ? err.message : "",
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
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      try {
        // Create the user in the IDP
        const idpUser = await identityProvider.createUser({
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          emailVerified: false,
        });

        const user = await createUser(idpUser, {
          firstName: payload.firstName || undefined,
          lastName: payload.lastName || undefined,
        });
        const wallet = await createUserWallet({
          userId: idpUser.id,
          address,
        });
        user.wallets = [wallet];
        return user;
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    /** Fetches a custom sign in token provided the wallet message + signature */
    authenticateWallet: async (
      _,
      { payload }: MutationAuthenticateWalletArgs
    ) => {
      // Validate the signature is correct from the wallet
      let address: Address;
      let nonce: string;

      try {
        const res = await validateSignature(
          payload.message,
          payload.signedMessage
        );

        address = res.address;
        nonce = res.nonce;
      } catch (err) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      // Make sure the wallet is not already in use by someone
      let wallet: Wallet | undefined;
      try {
        wallet = await getWalletByAddress(address);
        if (!wallet) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Wallet does not exist",
            },
          };
        }

        // Now that we have a userId in the wallet
        const idpUser = await identityProvider.getUserById(wallet.userId);

        if (!idpUser) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "No user found",
            },
          };
        } else if (!idpUser.isEnabled) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "User is not enabled",
            },
          };
        }

        // Now get the signin token from admin-sdk
        const signinToken = await identityProvider.getSigninToken(idpUser.id);

        // Sign in token can be used in the front end to sign users in
        return { token: signinToken };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    /** Connects a wallet to a user by adding it as a subcollection under the user */
    connectWallet: async (
      _,
      { payload }: MutationConnectWalletArgs,
      context: Context
    ) => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "You are not authenticated!",
          },
        };
      }

      // Validate the signature is correct from the wallet
      let address: Address;
      let nonce: string;

      try {
        const res = await validateSignature(
          payload.message,
          payload.signedMessage
        );

        address = res.address;
        nonce = res.nonce;
      } catch (err) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      // Make sure the wallet is not already in use by someone
      try {
        const _wallet = await getWalletByAddress(address);
        if (_wallet?.userId === context.userId) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Wallet already connected",
            },
          };
        } else if (!!_wallet) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Wallet already in use by another user",
            },
          };
        }

        // Connect the wallet to the user
        const wallet = await createUserWallet({
          userId: context.userId,
          address,
        });

        return { wallet };
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
  GetMyProfileResponse: {
    __resolveType: (obj: GetMyProfileResponse) => {
      if ("user" in obj) {
        return "GetMyProfileSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  CreateUserResponse: {
    __resolveType: (obj: CreateUserResponse) => {
      if ("user" in obj) {
        return "CreateUserResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ConnectWalletResponse: {
    __resolveType: (obj: ConnectWalletResponse) => {
      if ("token" in obj) {
        return "ConnectWalletResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  AuthenticateWalletResponse: {
    __resolveType: (obj: AuthenticateWalletResponse) => {
      if ("token" in obj) {
        return "AuthenticateWalletResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const userResolversComposition = {
  "Query.getMyProfile": [isAuthenticated()],
  "Mutation.connectWallet": [isAuthenticated()],
};

const resolvers = composeResolvers(UserResolvers, userResolversComposition);

export default resolvers;
