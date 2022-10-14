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
} from "../../../api/firestore";
import {
  Address,
  LootboxMintSignatureNonce,
  LootboxTicketID,
} from "@wormgraph/helpers";
import { Context } from "../../server";
import { LootboxID, UserID } from "@wormgraph/helpers";
import {
  convertLootboxDBToGQL,
  convertLootboxStatusGQLToDB,
  convertLootboxTicketDBToGQL,
} from "../../../lib/lootbox";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { composeResolvers } from "@graphql-tools/resolvers-composition";

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
        if (
          !!lootbox?.timestamps.deletedAt ||
          (context.userId as unknown as UserID) !== lootbox.creatorID
        ) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: "You do not own this Lootbox",
            },
          };
        }
        if (!!payload.maxTickets && payload.maxTickets < lootbox.maxTickets) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "MaxTickets must be increasing.",
            },
          };
        }
        const res = await editLootbox(payload.lootboxID as LootboxID, {
          name: payload.name || undefined,
          description: payload.description || undefined,
          maxTickets: payload.maxTickets || undefined,
          nftBountyValue: payload.nftBountyValue || undefined,
          symbol: payload.symbol || undefined,
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
    // bulkMintWhitelist: async (
    //   _,
    //   { payload }: MutationBulkMintWhitelistArgs,
    //   context: Context
    // ): Promise<BulkMintWhitelistResponse> => {
    //   if (!context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `Unauthorized`,
    //       },
    //     };
    //   }

    //   const { lootboxAddress, whitelistAddresses } = payload;

    //   if (whitelistAddresses.length > 100) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: `Too many addresses. Max 100.`,
    //       },
    //     };
    //   }

    //   if (!ethers.utils.isAddress(lootboxAddress)) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: `Invalid Lootbox address.`,
    //       },
    //     };
    //   }

    //   let lootbox: Lootbox_Firestore;

    //   try {
    //     lootbox = (await getLootboxByAddress(
    //       lootboxAddress as Address
    //     )) as Lootbox_Firestore;
    //     if (!lootbox) {
    //       throw new Error("Lootbox Not Found");
    //     }
    //     // lootbox = convertLootboxDBToGQL(lootboxDB);
    //   } catch (err) {
    //     console.error(err);
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }

    //   if (lootbox.status === LootboxStatus_Firestore.disabled) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: "Lootbox is disabled",
    //       },
    //     };
    //   }

    //   if (lootbox.status === LootboxStatus_Firestore.soldOut) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: "Lootbox is sold out",
    //       },
    //     };
    //   }

    //   if ((lootbox.creatorID as unknown as UserIdpID) !== context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `You do not own this Lootbox`,
    //       },
    //     };
    //   }

    //   try {
    //     const { signatures, errors } =
    //       await lootboxService.bulkSignMintWhitelistSignatures(
    //         whitelistAddresses as Address[],
    //         lootbox
    //       );

    //     return {
    //       signatures,
    //       errors: errors.every((err) => !!err) ? errors : null,
    //     };
    //   } catch (err) {
    //     console.error(err);
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
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
};

const lootboxResolverComposition = {
  "Mutation.createPartyBasket": [isAuthenticated()],
  "Mutation.bulkWhitelist": [isAuthenticated()],
  "Mutation.editPartyBasket": [isAuthenticated()],
  "Mutation.whitelistAllUnassignedClaims": [isAuthenticated()],
  "Mutation.editLootbox": [isAuthenticated()],
  "Mutation.mintLootboxTicket": [isAuthenticated()],
};

const lootboxResolvers = composeResolvers(
  LootboxResolvers,
  lootboxResolverComposition
);

export default lootboxResolvers;
