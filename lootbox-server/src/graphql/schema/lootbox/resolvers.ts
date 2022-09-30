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
  LootboxStatus,
  BulkMintWhitelistResponse,
  MutationBulkMintWhitelistArgs,
  MintLootboxTicketResponse,
  MutationMintLootboxTicketArgs,
  QueryGetLootboxByIdArgs,
  GetLootboxByIdResponse,
} from "../../generated/types";
import {
  getLootbox,
  getLootboxByAddress,
  getUser,
  getUserMintSignaturesForLootbox,
  getUserPartyBasketsForLootbox,
  editLootbox,
  paginateLootboxFeedQuery,
  getTicketByWeb3ID,
} from "../../../api/firestore";
import {
  Address,
  ClaimID,
  LootboxMintWhitelistID,
  LootboxTicketID_Web3,
} from "@wormgraph/helpers";
import { Context } from "../../server";
import { LootboxID, UserID } from "../../../lib/types";
import {
  convertLootboxDBToGQL,
  convertLootboxStatusGQLToDB,
  convertMintWhitelistSignatureDBToGQL,
} from "../../../lib/lootbox";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { ethers } from "ethers";
import * as lootboxService from "../../../service/lootbox";

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
    mintLootboxTicket: async (
      _,
      { payload }: MutationMintLootboxTicketArgs,
      context: Context
    ): Promise<MintLootboxTicketResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "User is not authenticated",
          },
        };
      }
      try {
        const [user, lootbox, existingTicket] = await Promise.all([
          getUser(context.userId),
          getLootbox(payload.lootboxID as LootboxID),
          getTicketByWeb3ID(
            payload.lootboxID as LootboxID,
            payload.ticketID as LootboxTicketID_Web3
          ),
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
        if (!!existingTicket) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Ticket already minted!",
            },
          };
        }

        const ticket = await lootboxService.mintNewTicketCallback({
          lootbox: convertLootboxDBToGQL(lootbox),
          payload: {
            minterUserID: context.userId as unknown as UserID,
            ticketID: payload.ticketID as LootboxTicketID_Web3,
            minterAddress: payload.minterAddress as Address,
            mintWhitelistID: payload.mintWhitelistID as LootboxMintWhitelistID,
            claimID: !!payload.claimID
              ? (payload.claimID as ClaimID)
              : undefined,
          },
        });

        return { ticket };
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
    bulkMintWhitelist: async (
      _,
      { payload }: MutationBulkMintWhitelistArgs,
      context: Context
    ): Promise<BulkMintWhitelistResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      const { lootboxAddress, whitelistAddresses } = payload;

      if (whitelistAddresses.length > 100) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: `Too many addresses. Max 100.`,
          },
        };
      }

      if (!ethers.utils.isAddress(lootboxAddress)) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: `Invalid Lootbox address.`,
          },
        };
      }

      let lootbox: Lootbox;

      try {
        const lootboxDB = await getLootboxByAddress(lootboxAddress as Address);
        if (!lootboxDB) {
          throw new Error("Lootbox Not Found");
        }
        lootbox = convertLootboxDBToGQL(lootboxDB);
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      if (lootbox.status === LootboxStatus.Disabled) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Lootbox is disabled",
          },
        };
      }

      if (lootbox.status === LootboxStatus.SoldOut) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Lootbox is sold out",
          },
        };
      }

      if (lootbox.creatorID !== context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `You do not own this Lootbox`,
          },
        };
      }

      try {
        const { signatures, errors } =
          await lootboxService.bulkSignMintWhitelistSignatures(
            whitelistAddresses as Address[],
            lootbox
          );

        return {
          signatures,
          errors: errors.every((err) => !!err) ? errors : null,
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

  Lootbox: {
    mintWhitelistSignatures: async (
      lootbox: Lootbox,
      _,
      context: Context
    ): Promise<MintWhitelistSignature[]> => {
      if (!context.userId) {
        return [];
      }

      try {
        const mintSignatures = await getUserMintSignaturesForLootbox(
          lootbox.id as LootboxID,
          context.userId
        );

        return mintSignatures.map(convertMintWhitelistSignatureDBToGQL);
      } catch (err) {
        console.error(err);
        return [];
      }
    },
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

  BulkMintWhitelistResponse: {
    __resolveType: (obj: BulkMintWhitelistResponse) => {
      if ("signatures" in obj) {
        return "BulkMintWhitelistResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  MintLootboxTicketResponse: {
    __resolveType: (obj: MintLootboxTicketResponse) => {
      if ("ticket" in obj) {
        return "MintLootboxTicketResponseSuccess";
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
  "Mutation.bulkMintWhitelist": [isAuthenticated()],
  "Mutation.mintLootboxTicket": [isAuthenticated()],
};

const lootboxResolvers = composeResolvers(
  LootboxResolvers,
  lootboxResolverComposition
);

export default lootboxResolvers;
