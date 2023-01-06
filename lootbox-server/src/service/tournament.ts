import {
  TournamentID,
  TournamentPrivacyScope,
  Tournament_Firestore,
  UserID,
  UserIdpID,
} from "@wormgraph/helpers";
import { validate } from "graphql";
import {
  createTournament,
  CreateTournamentArgs,
  getAffiliateByUserIdpID,
  getTournamentById,
  updateTournament,
  UpdateTournamentPayload,
} from "../api/firestore";
import { Affiliate_Firestore } from "../api/firestore/affiliate.type";
import { getRandomUserName } from "../api/lexica-images";
import { isInteger } from "../lib/number";

interface CreateTournamentServiceRequest {
  description: string;
  title?: string | null;
  tournamentLink?: string | null;
  coverPhoto?: string | null;
  prize?: string | null;
  tournamentDate?: number | null;
  communityURL?: string | null;
  privacyScope: TournamentPrivacyScope[];
  maxTicketsPerUser?: number;
  seedMaxLootboxTicketsPerUser?: number;
}

export const create = async (
  payload: CreateTournamentServiceRequest,
  callerUserID: UserIdpID
) => {
  let affiliate: Affiliate_Firestore;
  try {
    affiliate = await getAffiliateByUserIdpID(callerUserID);
  } catch (err) {
    throw new Error("You must be an affiliate to create a tournament");
  }

  let title = payload.title;
  if (!title) {
    title = await getRandomUserName({
      type: "event",
    });
  }

  const creationRequest: CreateTournamentArgs = {
    title,
    description: payload.description,
    tournamentLink: payload.tournamentLink,
    creatorId: callerUserID as unknown as UserID,
    coverPhoto: payload.coverPhoto,
    prize: payload.prize,
    tournamentDate: payload.tournamentDate || undefined,
    communityURL: payload.communityURL,
    organizer: affiliate.id,
    privacyScope: payload.privacyScope || [],
    maxTicketsPerUser: payload.maxTicketsPerUser
      ? Math.round(payload.maxTicketsPerUser)
      : 100,
    seedMaxLootboxTicketsPerUser: payload.seedMaxLootboxTicketsPerUser
      ? Math.round(payload.seedMaxLootboxTicketsPerUser)
      : 5,
  };

  validateTournamentCreationRequest(creationRequest);

  const tournament = await createTournament(creationRequest);

  return tournament;
};

const validateTournamentCreationRequest = (req: CreateTournamentArgs) => {
  if (!req.organizer) {
    throw new Error("Organizer not found");
  }
  if (
    req.privacyScope &&
    req.privacyScope.some(
      (priv) => !Object.values(TournamentPrivacyScope).includes(priv)
    )
  ) {
    throw new Error("Invalid privacy scope");
  }

  if (req.maxTicketsPerUser != undefined && req.maxTicketsPerUser < 0) {
    throw new Error("Max Tickets per user must be greater than zero");
  }

  if (req.maxTicketsPerUser != undefined && !isInteger(req.maxTicketsPerUser)) {
    throw new Error("Max Tickets per user must be an integer");
  }

  if (
    req.seedMaxLootboxTicketsPerUser != undefined &&
    req.seedMaxLootboxTicketsPerUser < 0
  ) {
    throw new Error(
      "Seed Max Lootbox Tickets per user must be greater than zero"
    );
  }

  if (
    req.seedMaxLootboxTicketsPerUser != undefined &&
    !isInteger(req.seedMaxLootboxTicketsPerUser)
  ) {
    throw new Error("Seed Max Lootbox Tickets per user must be an integer");
  }

  //   if (req.tournamentDate && typeof req.tournamentDate !== "number") {
  //     throw new Error("Invalid tournament date");
  //   }
  return true;
};

interface EditTournamentServiceRequest {
  communityURL?: string | null;
  coverPhoto?: string | null;
  description?: string | null;
  magicLink?: string | null;
  maxTicketsPerUser?: number | null;
  playbookUrl?: string | null;
  privacyScope?: TournamentPrivacyScope[] | null;
  prize?: string | null;
  seedMaxLootboxTicketsPerUser?: number | null;
  title?: string | null;
  tournamentDate?: number | null;
  tournamentLink?: string | null;
}

export const edit = async (
  tournamentID: TournamentID,
  req: EditTournamentServiceRequest,
  callerUserID: UserIdpID
) => {
  // Make sure the user owns the tournament
  let tournamentDB: Tournament_Firestore | undefined;
  let affiliate: Affiliate_Firestore;
  try {
    [tournamentDB, affiliate] = await Promise.all([
      getTournamentById(tournamentID),
      getAffiliateByUserIdpID(callerUserID),
    ]);
  } catch (err) {
    throw new Error("You must be an affiliate to create a tournament");
  }

  if (!tournamentDB) {
    throw new Error("Tournament not found");
  } else if (
    (tournamentDB.creatorId as unknown as UserIdpID) !== callerUserID
  ) {
    throw new Error("You do not own this tournament");
  } else if (!!tournamentDB?.timestamps?.deletedAt) {
    throw new Error("Tournament is deleted");
  }

  validateTournamentEditRequest(req);

  const updatedTournamentDB = await updateTournament(tournamentID, req);

  return updatedTournamentDB;
};

const validateTournamentEditRequest = (req: UpdateTournamentPayload) => {
  if (
    req.privacyScope &&
    req.privacyScope.some(
      (priv) => !Object.values(TournamentPrivacyScope).includes(priv)
    )
  ) {
    throw new Error("Invalid privacy scope");
  }

  if (req.maxTicketsPerUser != undefined && req.maxTicketsPerUser < 0) {
    throw new Error("Max Tickets per user must be greater than zero");
  }

  if (req.maxTicketsPerUser != undefined && !isInteger(req.maxTicketsPerUser)) {
    throw new Error("Max Tickets per user must be an integer");
  }

  if (
    req.seedMaxLootboxTicketsPerUser != undefined &&
    req.seedMaxLootboxTicketsPerUser < 0
  ) {
    throw new Error(
      "Seed Max Lootbox Tickets per user must be greater than zero"
    );
  }

  if (
    req.seedMaxLootboxTicketsPerUser != undefined &&
    !isInteger(req.seedMaxLootboxTicketsPerUser)
  ) {
    throw new Error("Seed Max Lootbox Tickets per user must be an integer");
  }

  if ("id" in req) {
    throw new Error("Cannot edit tournament ID");
  }

  return true;
};
