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
  LootboxTournamentSnapshotArgs,
  LootboxTournamentSnapshot,
  AirdropMetadataCreateInput,
  LootboxAirdropMetadataQuestion,
  BulkCreateLootboxResponse,
  MutationBulkCreateLootboxArgs,
  BulkLootboxCreatedPartialError,
  MutationDepositVoucherRewardsArgs,
  GetVoucherOfDepositForFanResponse,
  QueryGetVoucherOfDepositForFanArgs,
} from "../../generated/types";
import {
  getLootbox,
  getLootboxByAddress,
  getUser,
  editLootbox,
  paginateLootboxFeedQuery,
  getTicket,
  paginateLootboxUserClaims,
  getUserClaimCountForLootbox,
  getLootboxByUserIDAndNonce,
  getLootboxUnassignedClaimForUser,
  getLootboxTournamentSnapshot,
  getLootboxTournamentSnapshotByLootboxID,
  extractOrGenerateLootboxCreateInput,
  getQuestion,
  depositVoucherRewards,
  getDepositsOfLootbox,
  getVoucherForDepositForFan,
} from "../../../api/firestore";
import {
  Address,
  DepositID,
  LootboxMintSignatureNonce,
  LootboxTicketID,
  LootboxType,
  Lootbox_Firestore,
  QuestionAnswerID,
  QuestionAnswer_Firestore,
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
import { batcher } from "../../../lib/utils";
import { ethers } from "ethers";
import { getWhitelisterPrivateKey } from "../../../api/secrets";
import { convertLootboxTournamentSnapshotDBToGQL } from "../../../lib/tournament";
import { QueryGetLootboxDepositsArgs } from "../../generated/types";
import {
  DepositVoucherRewardsResponse,
  GetLootboxDepositsResponse,
} from "../../generated/types";

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
        console.error(err);
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
    getLootboxDeposits: async (
      _,
      { lootboxID }: QueryGetLootboxDepositsArgs,
      context: Context
    ): Promise<GetLootboxDepositsResponse> => {
      const deposits = await getDepositsOfLootbox(
        lootboxID as LootboxID,
        context.userId as unknown as UserID
      );
      return {
        deposits,
      };
    },
    getVoucherOfDepositForFan: async (
      _,
      { payload }: QueryGetVoucherOfDepositForFanArgs,
      context: Context
    ): Promise<GetVoucherOfDepositForFanResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }
      const { depositID, ticketID } = payload;
      try {
        const voucher = await getVoucherForDepositForFan({
          depositID: depositID as DepositID,
          ticketID: ticketID as LootboxTicketID,
          userID: context.userId as unknown as UserID,
        });
        if (!voucher) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Voucher not found",
            },
          };
        }
        return {
          voucher,
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
      // const fullPayload = await extractOrGenerateLootboxCreateInput(
      //   payload,
      //   context.userId
      // );

      try {
        const lootbox = await LootboxService.create(
          {
            description: payload.description,
            backgroundImage: payload.backgroundImage,
            logoImage: payload.logo,
            themeColor: payload.themeColor,
            nftBountyValue: payload.nftBountyValue,
            maxTickets: payload.maxTickets,
            joinCommunityUrl: payload.joinCommunityUrl || undefined,
            lootboxName: payload.name,
            tournamentID: payload.tournamentID as unknown as TournamentID,
            type: payload.type ? (payload.type as LootboxType) : undefined,
            isSharingDisabled: payload.isSharingDisabled || false,
            airdropMetadata: payload.airdropMetadata
              ? (payload.airdropMetadata as AirdropMetadataCreateInput)
              : undefined,
          },
          context.userId as unknown as UserID
        );

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
    bulkCreateLootbox: async (
      _,
      { payload }: MutationBulkCreateLootboxArgs,
      context: Context
    ): Promise<BulkCreateLootboxResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      if (payload.lootboxes.length > 30) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Must be less than 30 lootboxes",
          },
        };
      }

      const createdLootboxes: Lootbox_Firestore[] = [];
      const partialErrors: BulkLootboxCreatedPartialError[] = [];

      for (let idx = 0; idx < payload.lootboxes.length; idx++) {
        const lootboxPayload = payload.lootboxes[idx];

        try {
          const lootbox = await LootboxService.create(
            {
              description: lootboxPayload.description,
              backgroundImage: lootboxPayload.backgroundImage,
              logoImage: lootboxPayload.logo,
              themeColor: lootboxPayload.themeColor,
              nftBountyValue: lootboxPayload.nftBountyValue,
              maxTickets: lootboxPayload.maxTickets,
              joinCommunityUrl: lootboxPayload.joinCommunityUrl || undefined,
              lootboxName: lootboxPayload.name,
              tournamentID:
                lootboxPayload.tournamentID as unknown as TournamentID,
              type: lootboxPayload.type
                ? (lootboxPayload.type as LootboxType)
                : undefined,
              isSharingDisabled: lootboxPayload.isSharingDisabled || false,
              airdropMetadata: lootboxPayload.airdropMetadata
                ? (lootboxPayload.airdropMetadata as AirdropMetadataCreateInput)
                : undefined,
            },
            context.userId as unknown as UserID
          );

          createdLootboxes.push(lootbox);
        } catch (err) {
          console.log("Partial Error creating Lootbox!");
          console.error(err);
          partialErrors.push({
            index: idx,
            error: "An error occurred creating this lootbox",
          });
        }
      }

      return {
        lootboxes: createdLootboxes.map(convertLootboxDBToGQL),
        partialErrors,
      };
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
        const res = await LootboxService.edit(
          payload.lootboxID as LootboxID,
          {
            name: payload.name || undefined,
            description: payload.description || undefined,
            maxTickets: payload.maxTickets || undefined,
            nftBountyValue: payload.nftBountyValue || undefined,
            joinCommunityUrl: payload.joinCommunityUrl || undefined,
            status: payload.status,
            logo: payload.logo || undefined,
            backgroundImage: payload.backgroundImage || undefined,
            themeColor: payload.themeColor || undefined,
            isSharingDisabled: payload.isSharingDisabled || undefined,
            maxTicketsPerUser: payload.maxTicketsPerUser || undefined,
          },
          context.userId as unknown as UserID
        );

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
    depositVoucherRewards: async (
      _,
      { payload }: MutationDepositVoucherRewardsArgs,
      context: Context
    ): Promise<DepositVoucherRewardsResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "User is not authenticated",
          },
        };
      }

      try {
        const depositID = await depositVoucherRewards(payload, context.userId);
        return { depositID };
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
    tournamentSnapshot: async (
      lootbox: Lootbox,
      { tournamentID }: LootboxTournamentSnapshotArgs
    ): Promise<LootboxTournamentSnapshot | null> => {
      if (!tournamentID || !lootbox.id) {
        return null;
      }

      const snapshot = await getLootboxTournamentSnapshotByLootboxID(
        tournamentID as TournamentID,
        lootbox.id as LootboxID
      );

      if (!snapshot) {
        return null;
      }

      return convertLootboxTournamentSnapshotDBToGQL(snapshot);
    },
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
    airdropQuestions: async (
      lootbox: Lootbox,
      _,
      context: Context
    ): Promise<LootboxAirdropMetadataQuestion[]> => {
      const questionIDs = (lootbox?.airdropMetadata?.questions ||
        []) as QuestionAnswerID[];
      const questions = (
        await Promise.all(questionIDs.map((qid) => getQuestion(qid)))
      ).filter((q) => q) as QuestionAnswer_Firestore[];
      return questions.map((q) => ({
        id: q.id,
        batch: q.batch,
        order: q.order,
        question: q.question,
        type: q.type,
        mandatory: q.mandatory || false,
        options: q.options || "",
      }));
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

  BulkCreateLootboxResponse: {
    __resolveType: (obj: BulkCreateLootboxResponse) => {
      if ("lootboxes" in obj) {
        return "BulkCreateLootboxResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  DepositVoucherRewardsResponse: {
    __resolveType: (obj: DepositVoucherRewardsResponse) => {
      if ("depositID" in obj) {
        return "DepositVoucherRewardsResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  GetLootboxDepositsResponse: {
    __resolveType: (obj: GetLootboxDepositsResponse) => {
      if ("deposits" in obj) {
        return "GetLootboxDepositsResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  GetVoucherOfDepositForFanResponse: {
    __resolveType: (obj: GetVoucherOfDepositForFanResponse) => {
      if ("voucher" in obj) {
        return "GetVoucherOfDepositForFanResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const lootboxResolverComposition = {
  "Query.getLootboxDeposits": [isAuthenticated()],
  "Mutation.bulkWhitelist": [isAuthenticated()],
  "Mutation.whitelistAllUnassignedClaims": [isAuthenticated()],
  "Mutation.editLootbox": [isAuthenticated()],
  "Mutation.mintLootboxTicket": [isAuthenticated()],
  "Mutation.createLootbox": [isAuthenticated()],
  "Mutation.whitelistMyLootboxClaims": [isAuthenticated()],
  "Mutation.bulkCreateLootbox": [isAuthenticated()],
};

const lootboxResolvers = composeResolvers(
  LootboxResolvers,
  lootboxResolverComposition
);

export default lootboxResolvers;
