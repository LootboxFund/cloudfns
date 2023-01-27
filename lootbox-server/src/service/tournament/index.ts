import {
  TournamentID,
  TournamentPrivacyScope,
  TournamentVisibility_Firestore,
  Tournament_Firestore,
  UserID,
  UserIdpID,
  Affiliate_Firestore,
} from "@wormgraph/helpers";
import {
  createTournament,
  CreateTournamentArgs,
  getAffiliateByUserIdpID,
  getTournamentById,
  updateTournament,
  UpdateTournamentPayload,
} from "../../api/firestore";
import { getRandomUserName } from "../../api/lexica-images";
import { TournamentVisibility } from "../../graphql/generated/types";
import { isInteger } from "../../lib/number";
import {
  convertTournamentVisiblityDB,
  createEventInviteSlug,
} from "../../lib/tournament";

interface CreateTournamentServiceRequest {
  description: string;
  title?: string | null;
  tournamentLink?: string | null;
  coverPhoto?: string | null;
  prize?: string | null;
  tournamentDate?: number | null;
  communityURL?: string | null;
  privacyScope?: TournamentPrivacyScope[];
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
    privacyScope:
      payload.privacyScope == undefined
        ? [
            // Default to full permissions
            TournamentPrivacyScope.DataSharing,
            TournamentPrivacyScope.MarketingEmails,
          ]
        : payload.privacyScope,
    maxTicketsPerUser: payload.maxTicketsPerUser
      ? Math.round(payload.maxTicketsPerUser)
      : 100,
    seedMaxLootboxTicketsPerUser: payload.seedMaxLootboxTicketsPerUser
      ? Math.round(payload.seedMaxLootboxTicketsPerUser)
      : 5,
    inviteSlug: createEventInviteSlug(title),
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

  if (req.tournamentDate && typeof req.tournamentDate !== "number") {
    throw new Error("Invalid tournament date type. Should be number");
  }

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
  visibility?: string | null;
  maxPlayerLootboxes?: number | null;
  maxPromoterLootboxes?: number | null;
  seedLootboxLogoURLs?: string[] | null;
  seedLootboxFanTicketPrize?: string | null;
  playerDestinationURL?: string | null;
  promoterDestinationURL?: string | null;
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

  if (!affiliate) {
    throw new Error("Could not find affiliate for user");
  }

  const request: UpdateTournamentPayload = {};

  if (req.communityURL != undefined) {
    request.communityURL = req.communityURL;
  }

  if (req.coverPhoto != undefined) {
    request.coverPhoto = req.coverPhoto;
  }

  if (req.description != undefined) {
    request.description = req.description;
  }

  if (req.magicLink != undefined) {
    request.magicLink = req.magicLink;
  }

  if (req.maxTicketsPerUser != undefined) {
    request.maxTicketsPerUser = req.maxTicketsPerUser;
  }

  if (req.playbookUrl != undefined) {
    request.playbookUrl = req.playbookUrl;
  }

  if (req.privacyScope != undefined) {
    request.privacyScope = req.privacyScope;
  }

  if (req.prize != undefined) {
    request.prize = req.prize;
  }

  if (req.seedMaxLootboxTicketsPerUser != undefined) {
    request.seedMaxLootboxTicketsPerUser = req.seedMaxLootboxTicketsPerUser;
  }

  if (req.title != undefined) {
    request.title = req.title;
  }

  if (req.tournamentDate != undefined) {
    request.tournamentDate = req.tournamentDate;
  }

  if (req.tournamentLink != undefined) {
    request.tournamentLink = req.tournamentLink;
  }

  if (req.visibility != undefined) {
    request.visibility = convertTournamentVisiblityDB(
      req.visibility as TournamentVisibility
    );
  }

  if (req.maxPlayerLootboxes != undefined) {
    request.maxPlayerLootboxes = req.maxPlayerLootboxes;
  }

  if (req.maxPromoterLootboxes != undefined) {
    request.maxPromoterLootboxes = req.maxPromoterLootboxes;
  }

  if (req.seedLootboxLogoURLs !== undefined) {
    request.seedLootboxLogoURLs = req.seedLootboxLogoURLs || [];
  }

  if (req.seedLootboxFanTicketPrize !== undefined) {
    request.seedLootboxFanTicketPrize = req.seedLootboxFanTicketPrize;
  }

  if (req.playerDestinationURL !== undefined) {
    request.playerDestinationURL = req.playerDestinationURL;
  }

  if (req.promoterDestinationURL !== undefined) {
    request.promoterDestinationURL = req.promoterDestinationURL;
  }

  validateTournamentEditRequest(request);

  const updatedTournamentDB = await updateTournament(tournamentID, request);

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

  if (
    req.visibility &&
    !Object.values(TournamentVisibility_Firestore).includes(req.visibility)
  ) {
    throw new Error("Invalid event visibility");
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

  if (req.maxPlayerLootboxes && req.maxPlayerLootboxes < 0) {
    throw new Error("Max Player Lootboxes must be greater than zero");
  }

  if (req.maxPlayerLootboxes && !isInteger(req.maxPlayerLootboxes)) {
    throw new Error("Max Player Lootboxes must be an integer");
  }

  if (req.maxPromoterLootboxes && req.maxPromoterLootboxes < 0) {
    throw new Error("Max Promoter Lootboxes must be greater than zero");
  }

  if (req.maxPromoterLootboxes && !isInteger(req.maxPromoterLootboxes)) {
    throw new Error("Max Promoter Lootboxes must be an integer");
  }

  return true;
};
