import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  Address,
  AffiliateID,
  LootboxID,
  LootboxTournamentSnapshotID,
  Lootbox_Firestore,
  UserID,
  UserIdpID,
} from "@wormgraph/helpers";
import {
  getLootboxSnapshotsForTournamentDeprecated,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  paginateBattleFeedQuery,
  createTournamentStreams,
  getTournamentStreams,
  getStreamById,
  deleteStream,
  updateStream,
  getPartyBasketsForLootbox,
  getLootboxSnapshotsForTournament,
  getLootbox,
  paginateLootboxSnapshotsForTournament,
  getLootboxByAddress,
} from "../../../api/firestore";
import {
  addOfferAdSetToTournament,
  addUpdatePromoterRateQuoteInTournament,
  removeOfferAdSetFromTournament,
  // transformOffersToArray,
  removePromoterFromTournament,
  renderDealConfigsOfTournament,
  getAffiliate,
} from "../../../api/firestore/affiliate";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { StreamID, TournamentID } from "@wormgraph/helpers";
import {
  CreateTournamentResponse,
  MutationCreateTournamentArgs,
  MyTournamentResponse,
  StatusCode,
  Tournament,
  TournamentResponse,
  MutationEditTournamentArgs,
  EditTournamentResponse,
  LootboxTournamentSnapshot,
  DeleteTournamentResponse,
  MutationDeleteTournamentArgs,
  BattleFeedResponse,
  QueryMyTournamentArgs,
  QueryTournamentArgs,
  QueryBattleFeedArgs,
  Stream,
  MutationAddStreamArgs,
  MutationEditStreamArgs,
  AddStreamResponse,
  EditStreamResponse,
  MutationDeleteStreamArgs,
  DeleteStreamResponse,
  PartyBasket,
  PartyBasketStatus,
  MutationAddOfferAdSetToTournamentArgs,
  AddOfferAdSetToTournamentResponse,
  RemovePromoterFromTournamentResponse,
  AdSetPreview,
  DealConfigTournament,
  OrganizerProfile,
  MutationAddUpdatePromoterRateQuoteInTournamentArgs,
  Lootbox,
  TournamentPaginateLootboxSnapshotsArgs,
  PaginateLootboxTournamentSnapshots,
} from "../../generated/types";
import { Context } from "../../server";
import { MutationRemovePromoterFromTournamentArgs } from "../../generated/types";
import { AddUpdatePromoterRateQuoteInTournamentResponse } from "../../generated/types";
import {
  MutationRemoveOfferAdSetFromTournamentArgs,
  RemoveOfferAdSetFromTournamentResponse,
} from "../../generated/types";
import {
  convertLootboxTournamentSnapshotDBToGQL,
  convertStreamDBToGQL,
  convertTournamentDBToGQL,
} from "../../../lib/tournament";
import { convertLootboxDBToGQL } from "../../../lib/lootbox";

const TournamentResolvers = {
  Query: {
    tournament: async (
      _,
      { id }: QueryTournamentArgs
    ): Promise<TournamentResponse> => {
      try {
        const tournamentDB = await getTournamentById(id as TournamentID);
        if (!tournamentDB || !!tournamentDB.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: convertTournamentDBToGQL(tournamentDB) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    myTournament: async (
      _,
      { id }: QueryMyTournamentArgs,
      context: Context
    ): Promise<TournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      try {
        const tournamentDB = await getTournamentById(id as TournamentID);
        if (!tournamentDB || !!tournamentDB.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        } else if (
          (tournamentDB.creatorId as unknown as UserIdpID) !== context.userId
        ) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this tournament`,
            },
          };
        }

        return { tournament: convertTournamentDBToGQL(tournamentDB) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    battleFeed: async (
      _,
      { first, after }: QueryBattleFeedArgs
    ): Promise<BattleFeedResponse> => {
      const response = await paginateBattleFeedQuery(
        first,
        after as TournamentID | null | undefined
      );
      return response;
    },
  },
  Tournament: {
    paginateLootboxSnapshots: async (
      tournament: Tournament,
      { first, after }: TournamentPaginateLootboxSnapshotsArgs
    ): Promise<PaginateLootboxTournamentSnapshots> => {
      const response = await paginateLootboxSnapshotsForTournament(
        tournament.id as TournamentID,
        first,
        after as LootboxTournamentSnapshotID | null
      );
      return response;
    },
    lootboxSnapshots: async (
      tournament: Tournament
    ): Promise<LootboxTournamentSnapshot[]> => {
      if (!!tournament.isPostCosmic) {
        const snapshots = await getLootboxSnapshotsForTournament(
          tournament.id as TournamentID
        );
        return snapshots.map(convertLootboxTournamentSnapshotDBToGQL);
      } else {
        return getLootboxSnapshotsForTournamentDeprecated(
          tournament.id as TournamentID
        );
      }
    },
    streams: async (tournament: Tournament): Promise<Stream[]> => {
      const streamsDB = await getTournamentStreams(
        tournament.id as TournamentID
      );
      return streamsDB.map(convertStreamDBToGQL);
    },
    organizerProfile: async (
      tournament: Tournament
    ): Promise<OrganizerProfile | undefined> => {
      if (tournament.organizer) {
        const aff = await getAffiliate(tournament.organizer as AffiliateID);
        if (aff) {
          return {
            id: aff.id,
            name: aff.name,
            avatar: aff.avatar,
          };
        }
        return;
      }
      return;
    },
    dealConfigs: async (
      tournament: Tournament
    ): Promise<DealConfigTournament[]> => {
      return renderDealConfigsOfTournament(tournament.id as TournamentID);
    },
  },

  LootboxTournamentSnapshot: {
    lootbox: async (snapshot: LootboxTournamentSnapshot): Promise<Lootbox> => {
      let lootbox: Lootbox_Firestore | undefined;
      if (!!snapshot.lootboxID) {
        lootbox = await getLootbox(snapshot.lootboxID as LootboxID);
      } else {
        // DEPRECATED lookup via lootbox address. Can remove this after comismic.
        lootbox = await getLootboxByAddress(snapshot.address as Address);
      }
      if (!lootbox) {
        throw new Error(`Lootbox not found`);
      }
      return convertLootboxDBToGQL(lootbox);
    },
    /** @deprecated to be removed after Party Basket */
    partyBaskets: async (
      snapshot: LootboxTournamentSnapshot
    ): Promise<PartyBasket[]> => {
      const partyBaskets = await getPartyBasketsForLootbox(
        snapshot.address as Address
      );
      return partyBaskets.filter(
        (p) => p.status !== PartyBasketStatus.Disabled
      );
    },
  },

  Mutation: {
    createTournament: async (
      _,
      { payload }: MutationCreateTournamentArgs,
      context: Context
    ): Promise<CreateTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
      try {
        const tournamentDB = await createTournament({
          title: payload.title,
          description: payload.description,
          tournamentLink: payload.tournamentLink,
          creatorId: context.userId as unknown as UserID,
          coverPhoto: payload.coverPhoto,
          prize: payload.prize,
          tournamentDate: payload.tournamentDate,
          communityURL: payload.communityURL,
          organizer: (payload.organizer || "") as AffiliateID,
        });

        return { tournament: convertTournamentDBToGQL(tournamentDB) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    editTournament: async (
      _,
      { payload }: MutationEditTournamentArgs,
      context: Context
    ): Promise<EditTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      try {
        // Make sure the user owns the tournament
        const tournamentDB = await getTournamentById(
          payload.id as TournamentID
        );
        if (!tournamentDB) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        } else if (
          (tournamentDB.creatorId as unknown as UserIdpID) !== context.userId
        ) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this tournament`,
            },
          };
        } else if (!!tournamentDB?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.InvalidOperation,
              message: `Tournament is deleted`,
            },
          };
        }

        const { id, ...rest } = payload;

        const updatedTournamentDB = await updateTournament(
          id as TournamentID,
          rest
        );

        return { tournament: convertTournamentDBToGQL(updatedTournamentDB) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    deleteTournament: async (
      _,
      { id }: MutationDeleteTournamentArgs,
      context: Context
    ): Promise<DeleteTournamentResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      try {
        // Make sure the user owns the tournament
        const tournamentDB = await getTournamentById(id as TournamentID);
        if (!tournamentDB || !!tournamentDB.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        } else if (
          (tournamentDB.creatorId as unknown as UserIdpID) !== context.userId
        ) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this tournament`,
            },
          };
        }

        const deletedTournamentDB = await deleteTournament(id as TournamentID);

        return { tournament: convertTournamentDBToGQL(deletedTournamentDB) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    addStream: async (
      _,
      { payload }: MutationAddStreamArgs,
      context: Context
    ): Promise<AddStreamResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      try {
        // Make sure the user owns the tournament
        const tournament = await getTournamentById(
          payload.tournamentId as TournamentID
        );
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        } else if (
          (tournament.creatorId as unknown as UserIdpID) !== context.userId
        ) {
          /**
           * TODO: later, we will allow players to create their own tournament streams,
           * so this "if statement" might look like:
           *
           * else if (tournament.creatorId !== context.userId || !tournament.players.includes(context.userId)) {
           *  throw not allowed error
           * }
           */

          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this tournament`,
            },
          };
        } else if (!!tournament?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.InvalidOperation,
              message: `Tournament is deleted`,
            },
          };
        }

        const [streamDB] = await createTournamentStreams(
          context.userId,
          payload.tournamentId as TournamentID,
          [payload.stream]
        );

        return { stream: convertStreamDBToGQL(streamDB) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    deleteStream: async (
      _,
      { id: streamId }: MutationDeleteStreamArgs,
      context: Context
    ): Promise<DeleteStreamResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      try {
        // Make sure the user owns the stream
        const streamDB = await getStreamById(streamId as StreamID);

        if (!streamDB || !!streamDB?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Stream not found`,
            },
          };
        } else if (
          (streamDB.creatorId as unknown as UserIdpID) !== context.userId
        ) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this stream`,
            },
          };
        }

        const deletedStreamDB = await deleteStream(
          streamId as StreamID,
          streamDB.tournamentId as TournamentID
        );

        return { stream: convertStreamDBToGQL(deletedStreamDB) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    editStream: async (
      _,
      { payload }: MutationEditStreamArgs,
      context: Context
    ): Promise<EditStreamResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      try {
        // Make sure the user owns the stream
        const stream = await getStreamById(payload.id as StreamID);

        if (!stream || !!stream?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Stream not found`,
            },
          };
        } else if (
          (stream.creatorId as unknown as UserIdpID) !== context.userId
        ) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this stream`,
            },
          };
        }

        const { id: streamId, ...rest } = payload;

        const updatedStream = await updateStream(
          streamId as StreamID,
          stream.tournamentId as TournamentID,
          rest
        );

        return { stream: convertStreamDBToGQL(updatedStream) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    addOfferAdSetToTournament: async (
      _,
      { payload }: MutationAddOfferAdSetToTournamentArgs,
      context: Context
    ): Promise<AddOfferAdSetToTournamentResponse> => {
      try {
        // Make sure the user owns the tournament
        const tournament = await addOfferAdSetToTournament(
          payload,
          context.userId
        );
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: tournament as unknown as Tournament };
      } catch (e) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: e instanceof Error ? e.message : "",
          },
        };
      }
    },
    removeOfferAdSetFromTournament: async (
      _,
      { payload }: MutationRemoveOfferAdSetFromTournamentArgs,
      context: Context
    ): Promise<RemoveOfferAdSetFromTournamentResponse> => {
      try {
        // Make sure the user owns the tournament
        const tournament = await removeOfferAdSetFromTournament(
          payload,
          context.userId
        );
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: tournament as unknown as Tournament };
      } catch (e) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: e instanceof Error ? e.message : "",
          },
        };
      }
    },
    addUpdatePromoterRateQuoteInTournament: async (
      _,
      { payload }: MutationAddUpdatePromoterRateQuoteInTournamentArgs,
      context: Context
    ): Promise<AddUpdatePromoterRateQuoteInTournamentResponse> => {
      try {
        // Make sure the user owns the tournament
        const tournament = await addUpdatePromoterRateQuoteInTournament(
          payload,
          context.userId
        );
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: tournament as unknown as Tournament };
      } catch (e) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: e instanceof Error ? e.message : "",
          },
        };
      }
    },
    removePromoterFromTournament: async (
      _,
      { payload }: MutationRemovePromoterFromTournamentArgs,
      context: Context
    ): Promise<RemovePromoterFromTournamentResponse> => {
      try {
        // Make sure the user owns the tournament
        const tournament = await removePromoterFromTournament(
          payload,
          context.userId
        );
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: tournament as unknown as Tournament };
      } catch (e) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: e instanceof Error ? e.message : "",
          },
        };
      }
    },
  },

  TournamentResponse: {
    __resolveType: (obj: TournamentResponse) => {
      if ("tournament" in obj) {
        return "TournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  MyTournamentResponse: {
    __resolveType: (obj: MyTournamentResponse) => {
      if ("tournament" in obj) {
        return "MyTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  CreateTournamentResponse: {
    __resolveType: (obj: CreateTournamentResponse) => {
      if ("tournament" in obj) {
        return "CreateTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  EditTournamentResponse: {
    __resolveType: (obj: EditTournamentResponse) => {
      if ("tournament" in obj) {
        return "EditTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  BattleFeedResponse: {
    __resolveType: (obj: BattleFeedResponse) => {
      if ("edges" in obj) {
        return "BattleFeedResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  DeleteTournamentResponse: {
    __resolveType: (obj: EditTournamentResponse) => {
      if ("tournament" in obj) {
        return "DeleteTournamentResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  AddStreamResponse: {
    __resolveType: (obj: AddStreamResponse) => {
      if ("stream" in obj) {
        return "AddStreamResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  DeleteStreamResponse: {
    __resolveType: (obj: DeleteStreamResponse) => {
      if ("stream" in obj) {
        return "DeleteStreamResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  EditStreamResponse: {
    __resolveType: (obj: EditStreamResponse) => {
      if ("stream" in obj) {
        return "EditStreamResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  AddOfferAdSetToTournamentResponse: {
    __resolveType: (obj: AddOfferAdSetToTournamentResponse) => {
      if ("tournament" in obj) {
        return "AddOfferAdSetToTournamentResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  RemoveOfferAdSetFromTournamentResponse: {
    __resolveType: (obj: RemoveOfferAdSetFromTournamentResponse) => {
      if ("tournament" in obj) {
        return "RemoveOfferAdSetFromTournamentResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  AddUpdatePromoterRateQuoteInTournamentResponse: {
    __resolveType: (obj: AddUpdatePromoterRateQuoteInTournamentResponse) => {
      if ("tournament" in obj) {
        return "UpdatePromoterRateQuoteInTournamentResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  RemovePromoterFromTournamentResponse: {
    __resolveType: (obj: RemovePromoterFromTournamentResponse) => {
      if ("tournament" in obj) {
        return "RemovePromoterFromTournamentResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const tournamentResolverComposition = {
  "Mutation.createTournament": [isAuthenticated()],
  "Mutation.editTournament": [isAuthenticated()],
  "Mutation.deleteTournament": [isAuthenticated()],
  "Mutation.addStream": [isAuthenticated()],
  "Mutation.deleteStream": [isAuthenticated()],
  "Mutation.editStream": [isAuthenticated()],
  "Mutation.addOfferAdSetToTournament": [isAuthenticated()],
  "Mutation.removeOfferAdSetFromTournament": [isAuthenticated()],
  "Mutation.addUpdatePromoterRateQuoteInTournament": [isAuthenticated()],
  "Mutation.removePromoterFromTournament": [isAuthenticated()],
  // "Mutation.removeOfferAdSetFromTournament": [isAuthenticated()],
  "Query.myTournament": [isAuthenticated()],
};

const resolvers = composeResolvers(
  TournamentResolvers,
  tournamentResolverComposition
);

export default resolvers;
