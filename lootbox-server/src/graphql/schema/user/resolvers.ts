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
  LootboxSnapshot,
  MutationRemoveWalletArgs,
  RemoveWalletResponse,
  Tournament,
  PartyBasket,
  MutationUpdateUserArgs,
  UpdateUserResponse,
} from "../../generated/types";
import {
  getUser,
  getUserWallets,
  getWalletByAddress,
  createUser,
  createUserWallet,
  getLootboxSnapshotsForWallet,
  deleteWallet,
  getUserTournaments,
  getUserPartyBasketsForLootbox,
  updateUser,
} from "../../../api/firestore";
import { validateSignature } from "../../../api/ethers";
import { Address } from "@wormgraph/helpers";
import identityProvider from "../../../api/identityProvider";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Context } from "../../server";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { UserID, WalletID } from "../../../lib/types";
import { IIdpUser } from "../../../api/identityProvider/interface";
import { generateUsername } from "../../../lib/rng";

const UserResolvers = {
  Query: {
    /** Note: wallets get added async below */
    getMyProfile: async (
      _,
      _args,
      context: Context
    ): Promise<GetMyProfileResponse> => {
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
    wallets: async (user: User): Promise<Wallet[]> => {
      return await getUserWallets(user.id as UserID);
    },
    tournaments: async (user: User): Promise<Tournament[]> => {
      const tournaments = await getUserTournaments(user.id as UserID);
      return tournaments.filter((tourny) => !tourny.timestamps.deletedAt);
    },
    partyBaskets: async (
      user: User,
      lootbox: Address
    ): Promise<PartyBasket[]> => {
      const partyBaskets = await getUserPartyBasketsForLootbox(
        user.id as UserID,
        lootbox
      );
      return partyBaskets.filter(
        (partyBasket) => !partyBasket.timestamps.deletedAt
      );
    },
  },
  Wallet: {
    lootboxSnapshots: async (wallet: Wallet): Promise<LootboxSnapshot[]> => {
      return await getLootboxSnapshotsForWallet(wallet.address as Address);
    },
  },

  Mutation: {
    /**
     * Used primarily in phone sign up
     * User IDP object gets created in the frontend, so we expect this call to be authenticated
     * However, corresponding user database object does not get created, so this function will create that object
     * if it dosent exist. If it already exists, this function returns the existing user object from the database
     */
    createUserRecord: async (
      _,
      __,
      context: Context
    ): Promise<CreateUserResponse> => {
      if (!context.userId) {
        // Phone number auth - the user actually gets created in the frontend
        // So this request should be authenticated
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "You are not authenticated!",
          },
        };
      }

      let idpUser: IIdpUser;

      try {
        const _idpUser = await identityProvider.getUserById(context.userId);
        if (!_idpUser) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "User not found",
            },
          };
        }
        idpUser = { ..._idpUser };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      try {
        const dbUser = await getUser(context.userId);
        if (!!dbUser) {
          // User is already created
          return { user: dbUser };
        }

        // Update the idp username if needed
        // let updatedUserIdp: IIdpUser | undefined = undefined;
        if (!idpUser.username) {
          const updatedUserIdp = await identityProvider.updateUser(
            context.userId,
            {
              username: generateUsername(),
            }
          );
          idpUser = { ...updatedUserIdp };
        }

        // User does not exist in database, create it
        const user = await createUser(idpUser);

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
    createUserWithPassword: async (
      _,
      { payload }: MutationCreateUserWithPasswordArgs
    ): Promise<CreateUserResponse> => {
      try {
        // Create the user in the IDP
        const username = generateUsername();
        const idpUser = await identityProvider.createUser({
          email: payload.email,
          phoneNumber: payload.phoneNumber || undefined,
          emailVerified: false,
          password: payload.password,
          username,
        });

        const user = await createUser(idpUser);
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
    ): Promise<CreateUserResponse> => {
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
        const username = generateUsername();

        // Create the user in the IDP
        const idpUser = await identityProvider.createUser({
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          emailVerified: false,
          username,
        });

        const user = await createUser(idpUser);
        const wallet = await createUserWallet({
          userId: idpUser.id,
          address,
        });
        user.wallets = [wallet];
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
    /** Fetches a custom sign in token provided the wallet message + signature */
    authenticateWallet: async (
      _,
      { payload }: MutationAuthenticateWalletArgs
    ): Promise<AuthenticateWalletResponse> => {
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
              message:
                "Wallet is not associated with any user. Try email login if you forgot which wallet you used.",
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
    ): Promise<ConnectWalletResponse> => {
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

    removeWallet: async (
      _,
      { payload }: MutationRemoveWalletArgs,
      context: Context
    ): Promise<RemoveWalletResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthenticated",
          },
        };
      }

      // Make sure the wallet belongs to the user
      try {
        const userWallets = await getUserWallets(
          context.userId as unknown as UserID
        );

        const wallet = userWallets.find(
          (wallet: Wallet) => wallet.id === payload.id
        );

        if (!wallet) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Wallet does not exist",
            },
          };
        } else if (wallet.userId !== context.userId) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "You do not own this wallet",
            },
          };
        } else if (userWallets.length === 1) {
          return {
            error: {
              code: StatusCode.InvalidOperation,
              message: "You must have at least one wallet",
            },
          };
        }

        await deleteWallet(context.userId, payload.id as WalletID);

        return { id: wallet.id };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    updateUser: async (
      _,
      { payload }: MutationUpdateUserArgs,
      context: Context
    ): Promise<UpdateUserResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthenticated",
          },
        };
      }

      // Manually validate payload :(
      if (!Object.values(payload).some((a) => a != undefined)) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "No fields to update",
          },
        };
      } else if (payload.username != undefined && payload.username.length < 3) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Username must be at least 3 characters",
          },
        };
      }

      try {
        // Make sure the user exists
        const [userIdp, userRecord] = await Promise.all([
          identityProvider.getUserById(context.userId),
          getUser(context.userId),
        ]);

        if (
          !userIdp ||
          !userRecord ||
          !userIdp.isEnabled ||
          !!userRecord?.deletedAt
        ) {
          console.error("User not found");
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "User not found",
            },
          };
        }

        const newUserIdp = await identityProvider.updateUser(context.userId, {
          avatar: !!payload.avatar ? payload.avatar : undefined,
          username: !!payload.username ? payload.username : undefined,
        });

        const newUserRecord = await updateUser(context.userId, {
          avatar: newUserIdp.avatar,
          username: newUserIdp.username,
        });

        // let newUserRecord: User;
        // try {
        //   newUserRecord = await updateUser(context.userId, {
        //     avatar: newUserIdp.avatar,
        //     username: newUserIdp.username,
        //   });
        // } catch (err) {
        //   console.error(err);
        //   console.debug("Error updating user record... unrolling changes...");
        //   await identityProvider.updateUser(context.userId, {
        //     avatar: userIdp.avatar,
        //     username: userIdp.username,
        //   });
        //   return {
        //     error: {
        //       code: StatusCode.ServerError,
        //       message: err instanceof Error ? err.message : "",
        //     },
        //   };
        // }

        return {
          user: newUserRecord,
        };
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: "Error updating user",
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
  UpdateUserResponse: {
    __resolveType: (obj: UpdateUserResponse) => {
      if ("user" in obj) {
        return "UpdateUserResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ConnectWalletResponse: {
    __resolveType: (obj: ConnectWalletResponse) => {
      if ("wallet" in obj) {
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
  RemoveWalletResponse: {
    __resolveType: (obj: RemoveWalletResponse) => {
      if ("id" in obj) {
        return "RemoveWalletResponseSuccess";
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
  "Mutation.removeWallet": [isAuthenticated()],
  "Mutation.createUserRecord": [isAuthenticated()],
  "Mutation.updateUser": [isAuthenticated()],
};

const resolvers = composeResolvers(UserResolvers, userResolversComposition);

export default resolvers;
