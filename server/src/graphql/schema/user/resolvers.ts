import {
  QueryGetUserArgs,
  StatusCode,
  GetUserResponse,
  MutationCreateUserArgs,
  User,
  MutationConnectWalletArgs,
  Wallet,
  CreateUserResponse,
  ConnectWalletResponse,
  CreateUserWithWalletCredentials,
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

const UserResolvers = {
  Query: {
    /** Note: wallets get added async below */
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
            message: err instanceof Error ? err.message : "",
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
      if (payload.password) {
        try {
          // Create the user in the IDP
          const idpUser = await identityProvider.createUser({
            email: payload.email,
            phoneNumber: payload.phoneNumber,
            emailVerified: false,
            password: payload.password,
          });

          const user = await createUser(idpUser, payload);
          user.wallets = [];
          return user;
        } catch (err) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: err instanceof Error ? err.message : "",
            },
          };
        }
      } else {
        // Create user with wallet

        if (
          !payload?.walletCredentials?.message ||
          !payload?.walletCredentials?.signedMessage
        ) {
          return {
            error: {
              code: StatusCode.NotImplemented,
              message: "Please sign in using your wallet",
            },
          };
        }

        // Validate the signature is correct from the wallet
        let address: Address;
        let nonce: string;

        try {
          const res = await validateSignature(
            payload?.walletCredentials?.message,
            payload?.walletCredentials?.signedMessage
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

          const user = await createUser(idpUser, payload);
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
      }
    },
    /** Connects a wallet to a user by adding it as a subcollection under the user */
    connectWallet: async (
      _,
      { payload }: MutationConnectWalletArgs,
      context: Context
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
          userId: context.userId as string,
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
    // /** This should be a mutation, because it will write to the db the nonce, in order to ensure uniqueness */
    // authenticateWallet: async (_, { payload }: MutationConnectWalletArgs) => {
    //   // Validate the signature is correct from the wallet
    //   let address: Address;
    //   let nonce: string;

    //   try {
    //     const res = await validateSignature(
    //       payload.message,
    //       payload.signedMessage
    //     );

    //     address = res.address;
    //     nonce = res.nonce;
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }

    //   // Make sure the wallet is not already in use by someone
    //   let wallet: Wallet | undefined;
    //   try {
    //     wallet = await getWalletByAddress(address);
    //     if (!wallet) {
    //       return {
    //         error: {
    //           code: StatusCode.BadRequest,
    //           message: "Wallet does not exist",
    //         },
    //       };
    //     }

    //     // Now that we have a userId in the wallet
    //     const idpUser = await identityProvider.getUserById(wallet.userId);

    //     if (!idpUser) {
    //       return {
    //         error: {
    //           code: StatusCode.Unauthorized,
    //           message: "No user found",
    //         },
    //       };
    //     } else if (!idpUser.isEnabled) {
    //       return {
    //         error: {
    //           code: StatusCode.Unauthorized,
    //           message: "User is not enabled",
    //         },
    //       };
    //     }

    //     // Now get the signin token from admin-sdk
    //     const signinToken = await identityProvider.getSigninToken(idpUser.id);

    //     // Sign in token can be used in the front end to sign users in
    //     return signinToken;
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
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
  CreateUserResponse: {
    __resolveType: (obj: CreateUserResponse) => {
      if ("id" in obj) {
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
};

export default UserResolvers;
