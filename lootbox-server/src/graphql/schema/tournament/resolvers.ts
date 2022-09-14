import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Address } from "@wormgraph/helpers";
import {
  getLootboxSnapshotsForTournament,
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
} from "../../../api/firestore";
import {
  addOfferAdSetToTournament,
  updatePromoterRateQuoteInTournament,
  removeOfferAdSetFromTournament,
  transformOffersToArray,
  removePromoterFromTournament,
} from "../../../api/firestore/affiliate";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { StreamID, TournamentID } from "../../../lib/types";
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
} from "../../generated/types";
import { Context } from "../../server";
import { MutationRemovePromoterFromTournamentArgs } from "../../generated/types";
import {
  UpdatePromoterRateQuoteInTournamentResponse,
  MutationUpdatePromoterRateQuoteInTournamentArgs,
} from "../../generated/types";
import {
  TournamentOffers,
  MutationRemoveOfferAdSetFromTournamentArgs,
  RemoveOfferAdSetFromTournamentResponse,
} from "../../generated/types";

const TournamentResolvers = {
  Query: {
    tournament: async (
      _,
      { id }: QueryTournamentArgs
    ): Promise<TournamentResponse> => {
      try {
        const tournament = await getTournamentById(id as TournamentID);
        if (!tournament || !!tournament.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament };
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
        const tournament = await getTournamentById(id as TournamentID);
        if (!tournament || !!tournament.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        } else if (tournament.creatorId !== context.userId) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this tournament`,
            },
          };
        }

        return { tournament };
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
    lootboxSnapshots: async (
      tournament: Tournament
    ): Promise<LootboxTournamentSnapshot[]> => {
      return getLootboxSnapshotsForTournament(tournament.id as TournamentID);
    },
    streams: async (tournament: Tournament): Promise<Stream[]> => {
      return getTournamentStreams(tournament.id as TournamentID);
    },
    offers: async (tournament: Tournament): Promise<TournamentOffers[]> => {
      return transformOffersToArray(tournament.id as TournamentID);
    },
  },

  LootboxTournamentSnapshot: {
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
        const tournament = await createTournament({
          title: payload.title,
          description: payload.description,
          tournamentLink: payload.tournamentLink,
          creatorId: context.userId,
          coverPhoto: payload.coverPhoto,
          prize: payload.prize,
          tournamentDate: payload.tournamentDate,
          communityURL: payload.communityURL,
        });

        let streams: Stream[] = [];
        if (payload.streams) {
          try {
            streams = await createTournamentStreams(
              context.userId,
              tournament.id as TournamentID,
              payload.streams
            );
          } catch (err) {
            console.error("Error making streams", err);
          }
        }
        return { tournament: { ...tournament, streams } };
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
        const tournament = await getTournamentById(payload.id as TournamentID);
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        } else if (tournament.creatorId !== context.userId) {
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

        const { id, ...rest } = payload;

        const updatedTournament = await updateTournament(
          id as TournamentID,
          rest
        );

        return { tournament: updatedTournament };
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
        const tournament = await getTournamentById(id as TournamentID);
        if (!tournament || !!tournament.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        } else if (tournament.creatorId !== context.userId) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this tournament`,
            },
          };
        }

        const deletedTournament = await deleteTournament(id as TournamentID);

        return { tournament: deletedTournament };
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
        } else if (tournament.creatorId !== context.userId) {
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

        const [stream] = await createTournamentStreams(
          context.userId,
          payload.tournamentId as TournamentID,
          [payload.stream]
        );

        return { stream };
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
        const stream = await getStreamById(streamId as StreamID);

        if (!stream || !!stream?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Stream not found`,
            },
          };
        } else if (stream.creatorId !== context.userId) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this stream`,
            },
          };
        }

        const deletedStream = await deleteStream(
          streamId as StreamID,
          stream.tournamentId as TournamentID
        );

        return { stream: deletedStream };
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
        } else if (stream.creatorId !== context.userId) {
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

        return { stream: updatedStream };
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        // Make sure the user owns the tournament
        const tournament = await addOfferAdSetToTournament(payload);
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: tournament as Tournament };
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        // Make sure the user owns the tournament
        const tournament = await removeOfferAdSetFromTournament(payload);
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: tournament as Tournament };
      } catch (e) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: e instanceof Error ? e.message : "",
          },
        };
      }
    },
    updatePromoterRateQuoteInTournament: async (
      _,
      { payload }: MutationUpdatePromoterRateQuoteInTournamentArgs,
      context: Context
    ): Promise<UpdatePromoterRateQuoteInTournamentResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        // Make sure the user owns the tournament
        const tournament = await updatePromoterRateQuoteInTournament(payload);
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: tournament as Tournament };
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        // Make sure the user owns the tournament
        const tournament = await removePromoterFromTournament(payload);
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        }
        return { tournament: tournament as Tournament };
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
  UpdatePromoterRateQuoteInTournamentResponse: {
    __resolveType: (obj: UpdatePromoterRateQuoteInTournamentResponse) => {
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

  // Tournament: {
  // organizer: async (tournament: Tournament): Promise<Organizer | null> => {}
  // promoters: async (tournament: Tournament): Promise<Promoter[] | null> => {
  //      tournament.promoters = null // would show null
  //      tournament.organizer = null // also be null
  // }
  // },
};

const tournamentResolverComposition = {
  "Mutation.createTournament": [isAuthenticated()],
  "Mutation.editTournament": [isAuthenticated()],
  "Mutation.deleteTournament": [isAuthenticated()],
  "Mutation.addStream": [isAuthenticated()],
  "Mutation.deleteStream": [isAuthenticated()],
  "Mutation.editStream": [isAuthenticated()],
  "Mutation.addOfferAdSetToTournament": [],
  // "Mutation.removeOfferAdSetFromTournament": [isAuthenticated()],
  "Query.myTournament": [isAuthenticated()],
};

const resolvers = composeResolvers(
  TournamentResolvers,
  tournamentResolverComposition
);

export default resolvers;
