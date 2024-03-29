import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  Address,
  AffiliateID,
  LootboxID,
  LootboxTournamentSnapshotID,
  LootboxTournamentSnapshot_Firestore,
  Lootbox_Firestore,
  OfferID,
  Tournament_Firestore,
  UserID,
  UserIdpID,
  Affiliate_Firestore,
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
  getLootboxSnapshotsForTournament,
  getLootbox,
  paginateLootboxSnapshotsForTournament,
  getLootboxByAddress,
  getLootboxTournamentSnapshot,
  bulkEditLootboxTournamentSnapshots,
  bulkDeleteLootboxTournamentSnapshots,
  getTournamentByInviteSlug,
} from "../../../api/firestore";
import {
  addOfferAdSetToTournament,
  addUpdatePromoterRateQuoteInTournament,
  removeOfferAdSetFromTournament,
  // transformOffersToArray,
  removePromoterFromTournament,
  renderDealConfigsOfTournament,
  getAffiliate,
  getAffiliateByUserIdpID,
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
  MutationAddOfferAdSetToTournamentArgs,
  AddOfferAdSetToTournamentResponse,
  RemovePromoterFromTournamentResponse,
  AdSetPreview,
  DealConfigTournament,
  OrganizerProfile,
  MutationAddUpdatePromoterRateQuoteInTournamentArgs,
  Lootbox,
  TournamentPaginateLootboxSnapshotsArgs,
  TournamentLootboxSnapshotsArgs,
  PaginateLootboxTournamentSnapshots,
  MutationBulkEditLootboxTournamentSnapshotsArgs,
  BulkEditLootboxTournamentSnapshotsResponse,
  QueryListPotentialAirdropClaimersArgs,
  ClaimerCsvDataResponse,
  MutationClaimerCsvDataArgs,
  MutationOfferEventClaimsCsvArgs,
  OfferEventClaimsCsvResponse,
  QueryEventPartnerViewArgs,
  EventPartnerViewResponse,
  EventPartnerView,
} from "../../generated/types";
import { Context } from "../../server";
import {
  MutationRemovePromoterFromTournamentArgs,
  ListPotentialAirdropClaimersResponse,
} from "../../generated/types";
import { AddUpdatePromoterRateQuoteInTournamentResponse } from "../../generated/types";
import {
  MutationRemoveOfferAdSetFromTournamentArgs,
  RemoveOfferAdSetFromTournamentResponse,
} from "../../generated/types";
import {
  convertLootboxTournamentSnapshotDBToGQL,
  convertLootboxTournamentSnapshotStatusDBToGQL,
  convertLootboxTournamentSnapshotStatusGQLToDB,
  convertStreamDBToGQL,
  convertTournamentDBToGQL,
  convertTournamentDBToParnterViewGQL,
} from "../../../lib/tournament";
import { convertLootboxDBToGQL } from "../../../lib/lootbox";
import { listPotentialAirdropClaimers } from "../../../api/firestore/airdrop";
import { getRandomUserName } from "../../../api/lexica-images";
import {} from "../../../api/firestore/affiliate.type";
import * as analyticsService from "../../../service/analytics";
import { saveCsvToStorage } from "../../../api/storage";
import { nanoid } from "nanoid";
import { manifest } from "../../../manifest";
import { parseCSVRows } from "../../../lib/csv";
import { toFilename } from "../../../lib/parser";
import * as tournamentService from "../../../service/tournament";
import { NoAffiliateError } from "../../../api/firestore/affiliate.errorCodes";

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
    listPotentialAirdropClaimers: async (
      _,
      { payload }: QueryListPotentialAirdropClaimersArgs,
      context: Context
    ): Promise<ListPotentialAirdropClaimersResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
      const { tournamentID, offerID } = payload;
      try {
        const { offer, potentialClaimers } = await listPotentialAirdropClaimers(
          {
            tournamentID: tournamentID as TournamentID,
            offerID: offerID as OfferID,
          },
          context.userId
        );
        if (!potentialClaimers) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this tournament`,
            },
          };
        }
        return { offer, potentialClaimers };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    eventPartnerView: async (
      _,
      { slug }: QueryEventPartnerViewArgs,
      context: Context
    ): Promise<EventPartnerViewResponse> => {
      try {
        const event = await getTournamentByInviteSlug(slug);

        if (!event) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Event not found`,
            },
          };
        }

        return {
          event: convertTournamentDBToParnterViewGQL(event),
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
  Tournament: {
    paginateLootboxSnapshots: async (
      tournament: Tournament,
      { first, after }: TournamentPaginateLootboxSnapshotsArgs
    ): Promise<PaginateLootboxTournamentSnapshots> => {
      const response = await paginateLootboxSnapshotsForTournament(
        tournament.id as TournamentID,
        first
        // TODO: only use this when we change the typedefs to InputCursor (see ./typedefs.ts)
        // after || undefined
      );
      return response;
    },
    lootboxSnapshots: async (
      tournament: Tournament,
      { status }: TournamentLootboxSnapshotsArgs
    ): Promise<LootboxTournamentSnapshot[]> => {
      if (!!tournament.isPostCosmic) {
        const snapshots = await getLootboxSnapshotsForTournament(
          tournament.id as TournamentID,
          status ? convertLootboxTournamentSnapshotStatusGQLToDB(status) : null
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
  },

  Mutation: {
    claimerCSVData: async (
      _: any,
      { payload }: MutationClaimerCsvDataArgs,
      context: Context
    ): Promise<ClaimerCsvDataResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
      try {
        const { data, tournament } =
          await analyticsService.getEventClaimerCSVData({
            eventID: payload.eventID as TournamentID,
            callerUserID: context.userId,
          });

        const csvContent = parseCSVRows(data);
        const filename =
          toFilename(tournament.title || tournament.id) +
          "_" +
          nanoid(6) +
          ".csv";

        const downloadUrl = await saveCsvToStorage({
          fileName: `event_claimer_export/${filename}`,
          data: csvContent,
          bucket: manifest.firebase.storageBucket,
        });

        return { csvDownloadURL: downloadUrl };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
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
        const tournamentDB = await tournamentService.create(
          {
            title: payload.title,
            description: payload.description || "",
            tournamentLink: payload.tournamentLink,
            coverPhoto: payload.coverPhoto,
            prize: payload.prize,
            tournamentDate: payload.tournamentDate,
            communityURL: payload.communityURL,
            privacyScope: payload.privacyScope || undefined,
          },
          context.userId
        );

        return { tournament: convertTournamentDBToGQL(tournamentDB) };
      } catch (err: any) {
        // if (err instanceof NoAffiliateError) {  // Why does this not work?!?!
        if (err?.name === "NoAffiliateError") {
          return {
            error: {
              code: StatusCode.AffiliateNotFound,
              message: "You must be an affiliate to create a tournament",
            },
          };
        } else {
          return {
            error: {
              code: StatusCode.ServerError,
              message: err instanceof Error ? err.message : "",
            },
          };
        }
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
        const { id, ...rest } = payload;

        const tournamentDB = await tournamentService.edit(
          payload.id as TournamentID,
          {
            communityURL: rest.communityURL,
            coverPhoto: rest.coverPhoto,
            description: rest.description,
            magicLink: rest.magicLink,
            maxTicketsPerUser: rest.maxTicketsPerUser,
            playbookUrl: rest.playbookUrl,
            privacyScope: rest.privacyScope,
            prize: rest.prize,
            seedMaxLootboxTicketsPerUser: rest.seedMaxLootboxTicketsPerUser,
            title: rest.title,
            tournamentDate: rest.tournamentDate,
            tournamentLink: rest.tournamentLink,
            visibility: rest.visibility,
            maxPlayerLootboxes: rest.maxPlayerLootboxes,
            maxPromoterLootboxes: rest.maxPromoterLootboxes,
            seedLootboxLogoURLs: rest.seedLootboxLogoURLs,
            seedLootboxFanTicketPrize: rest.seedLootboxFanTicketPrize,
            playerDestinationURL: rest.playerDestinationURL,
            promoterDestinationURL: rest.promoterDestinationURL,
          },
          context.userId
        );

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
    bulkEditLootboxTournamentSnapshots: async (
      _,
      { payload }: MutationBulkEditLootboxTournamentSnapshotsArgs,
      context: Context
    ): Promise<BulkEditLootboxTournamentSnapshotsResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      // VALIDATION
      // Payload
      if (
        (payload?.impressionPriority == null &&
          payload.status == null &&
          payload.delete == null) ||
        payload.lootboxSnapshotIDs.length === 0
      ) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: `Nothing to update`,
          },
        };
      }

      // if (payload.lootboxSnapshotIDs.length > 50) {
      //   return {
      //     error: {
      //       code: StatusCode.BadRequest,
      //       message: `Can only edit 50 Lootboxes at a time`,
      //     },
      //   };
      // }

      let tournament: Tournament_Firestore | undefined;
      try {
        tournament = await getTournamentById(
          payload.tournamentID as TournamentID
        );
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Tournament not found`,
            },
          };
        } else if (
          (context.userId as unknown as UserID) !== tournament.creatorId
        ) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `You do not own this tournament`,
            },
          };
        }
      } catch (err) {
        console.error("error getting tournament", err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
          },
        };
      }

      let snapshots: LootboxTournamentSnapshot_Firestore[];

      try {
        // Make sure user has permission for each snapshot
        snapshots = await Promise.all(
          (payload.lootboxSnapshotIDs as LootboxTournamentSnapshotID[]).map(
            (id) =>
              getLootboxTournamentSnapshot(
                payload.tournamentID as TournamentID,
                id
              )
          )
        );

        if (
          snapshots.some((snap) => snap.tournamentID !== payload.tournamentID)
        ) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: `Some snapshots do not belong to this tournament`,
            },
          };
        }
      } catch (err) {
        console.error("error getting snapshots", err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
          },
        };
      }

      // Update the snapshots...
      try {
        if (payload.delete) {
          await bulkDeleteLootboxTournamentSnapshots(
            payload.tournamentID as TournamentID,
            payload.lootboxSnapshotIDs as LootboxTournamentSnapshotID[]
          );
        } else {
          await bulkEditLootboxTournamentSnapshots(
            payload.tournamentID as TournamentID,
            payload.lootboxSnapshotIDs as LootboxTournamentSnapshotID[],
            {
              status: payload.status
                ? convertLootboxTournamentSnapshotStatusGQLToDB(payload.status)
                : undefined,
              impressionPriority: payload.impressionPriority,
            }
          );
        }

        return {
          lootboxTournamentSnapshotIDs: payload.lootboxSnapshotIDs,
        };
      } catch (err) {
        console.error("error updating snapshots", err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
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

    offerEventClaimsCSV: async (
      _: any,
      { payload }: MutationOfferEventClaimsCsvArgs,
      context: Context
    ): Promise<OfferEventClaimsCsvResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
      try {
        const { data, tournament } =
          await analyticsService.eventOfferClaimsWithQA({
            eventID: payload.eventID as TournamentID,
            offerID: payload.offerID as OfferID,
            callerUserID: context.userId,
          });

        const csvContent = parseCSVRows(data);
        const filename =
          toFilename(tournament.title || tournament.id) +
          "_" +
          nanoid(6) +
          ".csv";

        const downloadUrl = await saveCsvToStorage({
          fileName: `offer_claims_export/${filename}`,
          data: csvContent,
          bucket: manifest.firebase.storageBucket,
        });

        return { csvDownloadURL: downloadUrl };
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
  BulkEditLootboxTournamentSnapshotsResponse: {
    __resolveType: (obj: BulkEditLootboxTournamentSnapshotsResponse) => {
      if ("lootboxTournamentSnapshotIDs" in obj) {
        return "BulkEditLootboxTournamentSnapshotsResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ListPotentialAirdropClaimersResponse: {
    __resolveType: (obj: ListPotentialAirdropClaimersResponse) => {
      if ("potentialClaimers" in obj) {
        return "ListPotentialAirdropClaimersResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  ClaimerCSVDataResponse: {
    __resolveType: (obj: ClaimerCsvDataResponse) => {
      if ("csvDownloadURL" in obj) {
        return "ClaimerCSVDataResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  OfferEventClaimsCSVResponse: {
    __resolveType: (obj: OfferEventClaimsCsvResponse) => {
      if ("csvDownloadURL" in obj) {
        return "OfferEventClaimsCSVResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  EventPartnerViewResponse: {
    __resolveType: (obj: EventPartnerViewResponse) => {
      if ("event" in obj) {
        return "EventPartnerViewResponseSuccess";
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
  "Mutation.bulkEditLootboxTournamentSnapshots": [isAuthenticated()],
  // "Mutation.removeOfferAdSetFromTournament": [isAuthenticated()],
  "Query.myTournament": [isAuthenticated()],
  "Mutation.claimerCSVData": [isAuthenticated()],
  "Mutation.offerEventClaimsCSV": [isAuthenticated()],
};

const resolvers = composeResolvers(
  TournamentResolvers,
  tournamentResolverComposition
);

export default resolvers;
