import {
  GetLootboxByAddressResponse,
  Lootbox,
  QueryGetLootboxByAddressArgs,
  Resolvers,
  StatusCode,
  QueryLootboxFeedArgs,
  LootboxFeedResponse,
  MintWhitelistSignature,
  MutationEditLootboxArgs,
  EditLootboxResponse,
  QueryGetLootboxByIdArgs,
  GetLootboxByIdResponse,
  LootboxTicket,
  LootboxUserClaimPageInfoResponse,
  LootboxUserClaimsArgs,
  QueryMyLootboxByNonceArgs,
  MyLootboxByNonceResponse,
  CreateLootboxResponse,
  MutationCreateLootboxArgs,
  WhitelistMyLootboxClaimsResponse,
  MutationWhitelistMyLootboxClaimsArgs,
  User,
} from "../../generated/types";
import {
  getLootbox,
  getLootboxByAddress,
  getUser,
  getUserPartyBasketsForLootbox,
  editLootbox,
  paginateLootboxFeedQuery,
  getTicket,
  paginateLootboxUserClaims,
  getUserClaimCountForLootbox,
  getLootboxByUserIDAndNonce,
  getLootboxUnassignedClaimForUser,
} from "../../../api/firestore";
import {
  Address,
  LootboxMintSignatureNonce,
  LootboxTicketID,
  TournamentID,
} from "@wormgraph/helpers";
import { Context } from "../../server";
import { LootboxID, UserID } from "@wormgraph/helpers";
import {
  convertLootboxDBToGQL,
  convertLootboxStatusGQLToDB,
  convertLootboxTicketDBToGQL,
  isLootboxDeployed,
} from "../../../lib/lootbox";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import * as LootboxService from "../../../service/lootbox";
import { validateSignature } from "../../../lib/whitelist";
import { batcher } from "../../../lib/utils";
import { ethers } from "ethers";
import { getWhitelisterPrivateKey } from "../../../api/secrets";

const LootboxResolvers: Resolvers = {
  Query: {
    getLootboxByID: async (
      _,
      args: QueryGetLootboxByIdArgs
    ): Promise<GetLootboxByIdResponse> => {
      try {
        const lootboxID = args.id as LootboxID;
        const lootbox = await getLootbox(lootboxID);
        if (!lootbox) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Lootbox not found",
            },
          };
        }
        return {
          lootbox: convertLootboxDBToGQL(lootbox),
        };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An Error Occurred",
          },
        };
      }
    },
    getLootboxByAddress: async (
      _,
      args: QueryGetLootboxByAddressArgs
    ): Promise<GetLootboxByAddressResponse> => {
      try {
        const lootboxDB = await getLootboxByAddress(args.address as Address);
        if (!lootboxDB) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Lootbox not found",
            },
          };
        }
        return {
          lootbox: convertLootboxDBToGQL(lootboxDB),
        };
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
    lootboxFeed: async (
      _,
      { first, after }: QueryLootboxFeedArgs
    ): Promise<LootboxFeedResponse> => {
      const response = await paginateLootboxFeedQuery(
        first,
        after as LootboxID | null | undefined
      );
      return response;
    },
    myLootboxByNonce: async (
      _,
      { nonce }: QueryMyLootboxByNonceArgs,
      context: Context
    ): Promise<MyLootboxByNonceResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      const lootbox = await getLootboxByUserIDAndNonce(
        context.userId as unknown as UserID,
        nonce as LootboxMintSignatureNonce
      );

      if (!lootbox) {
        return {
          error: {
            code: StatusCode.NotFound,
            message: "Lootbox not found",
          },
        };
      }

      return {
        lootbox: convertLootboxDBToGQL(lootbox),
      };
    },
  },

  Mutation: {
    createLootbox: async (
      _,
      { payload }: MutationCreateLootboxArgs,
      context: Context
    ): Promise<CreateLootboxResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      try {
        const lootbox = await LootboxService.create({
          lootboxDescription: payload.description,
          backgroundImage: payload.backgroundImage,
          logoImage: payload.logo,
          themeColor: payload.themeColor,
          nftBountyValue: payload.nftBountyValue,
          maxTickets: payload.maxTickets,
          joinCommunityUrl: payload.joinCommunityUrl || undefined,
          symbol: payload.name.slice(0, 12),
          creatorID: context.userId as unknown as UserID,
          lootboxName: payload.name,
          tournamentID: payload.tournamentID as TournamentID | undefined,
        });

        return { lootbox: convertLootboxDBToGQL(lootbox) };
      } catch (err) {
        console.log("Error creating Lootbox!");
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    editLootbox: async (
      _,
      { payload }: MutationEditLootboxArgs,
      context: Context
    ): Promise<EditLootboxResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "User is not authenticated",
          },
        };
      }

      try {
        const [user, lootbox] = await Promise.all([
          getUser(context.userId),
          getLootbox(payload.lootboxID as LootboxID),
        ]);
        if (!user || !!user.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "User not found",
            },
          };
        }
        if (!lootbox || !!lootbox.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Lootbox not found",
            },
          };
        }
        if ((context.userId as unknown as UserID) !== lootbox.creatorID) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "You do not own this Lootbox",
            },
          };
        }
        const res = await editLootbox(payload.lootboxID as LootboxID, {
          name: payload.name || undefined,
          description: payload.description || undefined,
          maxTickets: payload.maxTickets || undefined,
          nftBountyValue: payload.nftBountyValue || undefined,
          // symbol: payload.symbol || undefined,
          joinCommunityUrl: payload.joinCommunityUrl || undefined,
          status: payload.status
            ? convertLootboxStatusGQLToDB(payload.status)
            : undefined,
          logo: payload.logo || undefined,
          backgroundImage: payload.backgroundImage || undefined,
          themeColor: payload.themeColor || undefined,
        });

        return { lootbox: convertLootboxDBToGQL(res) };
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
    whitelistMyLootboxClaims: async (
      _,
      { payload }: MutationWhitelistMyLootboxClaimsArgs,
      context: Context
    ): Promise<WhitelistMyLootboxClaimsResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "User is not authenticated",
          },
        };
      }

      if (!ethers.utils.isAddress(payload.walletAddress)) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Invalid address",
          },
        };
      }

      try {
        const [user, lootbox] = await Promise.all([
          getUser(context.userId),
          getLootbox(payload.lootboxID as LootboxID),
        ]);
        if (!user || !!user.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "User not found",
            },
          };
        }
        if (!lootbox || !!lootbox.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Lootbox not found",
            },
          };
        }

        // Make sure the lootbox is deployed on the blockchain
        if (!isLootboxDeployed(lootbox)) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message:
                "Lootbox has not been deployed on the blockchain yet. Please ask the Lootbox owner to deploy it.",
            },
          };
        }

        // Gets WHITELISTER_PRIVATE_KEY
        // This will THROW if not found
        const whitelisterPrivateKey = await getWhitelisterPrivateKey();

        // get eligible claims to whitelist claims
        const unassignedClaims = await getLootboxUnassignedClaimForUser(
          lootbox.id,
          context.userId as unknown as UserID
        );

        // whitelist these bad boys
        if (unassignedClaims.length === 0) {
          return {
            signatures: [],
          };
        }

        // might as well batch them just in case
        const batchedClaimArray = batcher(unassignedClaims, 50);

        const result: MintWhitelistSignature[] = [];

        for (let batchClaims of batchedClaimArray) {
          const signatureResults = await Promise.allSettled(
            batchClaims.map((claim) => {
              return LootboxService.whitelist(
                whitelisterPrivateKey,
                payload.walletAddress as Address,
                lootbox,
                claim
              );
            })
          );

          const createdSignatures: MintWhitelistSignature[] = signatureResults
            .filter(
              (res) => res.status === "fulfilled" && res.value != undefined
            )
            // @ts-ignore
            .map((res) => res.value);

          result.push(...createdSignatures);
        }

        return {
          signatures: result,
        };
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

  MintWhitelistSignature: {
    lootboxTicket: async (
      daddy: MintWhitelistSignature
    ): Promise<LootboxTicket | null> => {
      if (!daddy.lootboxTicketID) {
        return null;
      }

      const ticket = await getTicket(
        daddy.lootboxID as LootboxID,
        daddy.lootboxTicketID as LootboxTicketID
      );

      if (!ticket) {
        return null;
      }

      return convertLootboxTicketDBToGQL(ticket);
    },
  },

  LootboxUserClaimPageInfoResponse: {
    totalCount: async (
      parent: LootboxUserClaimPageInfoResponse,
      _,
      context: Context
    ): Promise<number | null> => {
      if (!parent._lootboxID || !context.userId) {
        return null;
      }

      return await getUserClaimCountForLootbox(
        parent._lootboxID as LootboxID,
        context.userId as unknown as UserID
      );
    },
  },

  Lootbox: {
    userClaims: async (
      lootbox: Lootbox,
      { first, cursor }: LootboxUserClaimsArgs,
      context: Context
    ): Promise<LootboxUserClaimPageInfoResponse> => {
      if (!context.userId || !lootbox.id) {
        return {
          _lootboxID: lootbox.id,
          totalCount: null, // This gets filled by the resolver. We leave it out of this call to avoid an extra query
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
          edges: [],
        };
      }
      const response = await paginateLootboxUserClaims(
        lootbox.id as LootboxID,
        context.userId as unknown as UserID,
        first,
        {
          startAfter: cursor?.startAfter,
          endBefore: cursor?.endBefore,
        }
      );

      return {
        _lootboxID: lootbox.id,
        totalCount: null, // This gets filled by the resolver. We leave it out of this call to avoid an extra query
        pageInfo: response.pageInfo,
        edges: response.edges,
      };
    },

    // mintWhitelistSignatures: async (
    //   lootbox: Lootbox,
    //   _,
    //   context: Context
    // ): Promise<MintWhitelistSignature[]> => {
    //   if (!context.userId) {
    //     return [];
    //   }

    //   try {
    //     const mintSignatures = await getUserMintSignaturesForLootbox(
    //       lootbox.id as LootboxID,
    //       context.userId
    //     );

    //     return mintSignatures.map(convertMintWhitelistSignatureDBToGQL);
    //   } catch (err) {
    //     console.error(err);
    //     return [];
    //   }
    // },
    // tournamentSnapshots: async (
    //   lootbox: Lootbox
    // ): Promise<LootboxTournamentSnapshot[]> => {
    //   const snapshots = await getTournamentSnapshotsForLootbox(
    //     lootbox.id as LootboxID
    //   );
    // },
    /** @deprecated will be removed and replaced with cosmic lootbox */
    partyBaskets: async (lootbox: Lootbox, _, context: Context) => {
      if (!context.userId) {
        return [];
      }
      try {
        const baskets = await getUserPartyBasketsForLootbox(
          context.userId as unknown as UserID,
          lootbox.address as Address
        );
        return baskets;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
  },

  LootboxFeedResponse: {
    __resolveType: (obj: LootboxFeedResponse) => {
      if ("edges" in obj) {
        return "LootboxFeedResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  GetLootboxByIDResponse: {
    __resolveType: (obj: GetLootboxByIdResponse) => {
      if ("lootbox" in obj) {
        return "LootboxResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  GetLootboxByAddressResponse: {
    __resolveType: (obj: GetLootboxByAddressResponse) => {
      if ("lootbox" in obj) {
        return "LootboxResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  EditLootboxResponse: {
    __resolveType: (obj: EditLootboxResponse) => {
      if ("lootbox" in obj) {
        return "EditLootboxResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  MyLootboxByNonceResponse: {
    __resolveType: (obj: MyLootboxByNonceResponse) => {
      if ("lootbox" in obj) {
        return "MyLootboxByNonceResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  CreateLootboxResponse: {
    __resolveType: (obj: CreateLootboxResponse) => {
      if ("lootbox" in obj) {
        return "CreateLootboxResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  WhitelistMyLootboxClaimsResponse: {
    __resolveType: (obj: WhitelistMyLootboxClaimsResponse) => {
      if ("signatures" in obj) {
        return "WhitelistMyLootboxClaimsResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const lootboxResolverComposition = {
  "Mutation.createPartyBasket": [isAuthenticated()],
  "Mutation.bulkWhitelist": [isAuthenticated()],
  "Mutation.editPartyBasket": [isAuthenticated()],
  "Mutation.whitelistAllUnassignedClaims": [isAuthenticated()],
  "Mutation.editLootbox": [isAuthenticated()],
  "Mutation.mintLootboxTicket": [isAuthenticated()],
  "Mutation.createLootbox": [isAuthenticated()],
  "Mutation.whitelistMyLootboxClaims": [isAuthenticated()],
};

const lootboxResolvers = composeResolvers(
  LootboxResolvers,
  lootboxResolverComposition
);

export default lootboxResolvers;
