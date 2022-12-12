import {
  getLootbox,
  getLootboxTournamentSnapshotByLootboxID,
  getTournamentById,
} from "../api/firestore";
import {
  ClaimType_Firestore,
  LootboxID,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
import {
  baseLootboxStatistics,
  campaignClaimsForLootbox,
  claimerStatsForLootboxTournament,
  referrerClaimsForLootbox,
} from "../api/analytics/lootbox";
import { claimerStatsForTournament } from "../api/analytics/tournament";
import { manifest } from "../manifest";

interface BaseClaimStatsForLootboxRequest {
  lootboxID: LootboxID;
  eventID: TournamentID;
}

export interface BaseLootboxStatisticsServiceResponse {
  totalClaimCount: number;
  completedClaimCount: number;
  viralClaimCount: number;
  bonusRewardClaimCount: number;
  oneTimeClaimCount: number;
  completionRate: number;
  maxTickets: number;
}
export const baseClaimStatsForLootbox = async (
  request: BaseClaimStatsForLootboxRequest,
  callerUserID: UserID
): Promise<BaseLootboxStatisticsServiceResponse> => {
  const [lootbox, lootboxSnapshot, event] = await Promise.all([
    getLootbox(request.lootboxID),
    getLootboxTournamentSnapshotByLootboxID(request.eventID, request.lootboxID),
    getTournamentById(request.eventID),
  ]);
  if (!lootbox || !!lootbox.timestamps.deletedAt) {
    throw new Error("Lootbox not found");
  }
  if (!event || !!event.timestamps.deletedAt) {
    throw new Error("Event not found");
  }

  if (!lootboxSnapshot || !!lootboxSnapshot.timestamps.deletedAt) {
    throw new Error("Lootbox snapshot not found");
  }

  if (lootbox.creatorID !== callerUserID && event.creatorId !== callerUserID) {
    // Only allow lootbox creator or event creator to view stats
    throw new Error("Unauthorized");
  }

  try {
    const data = await baseLootboxStatistics({
      queryParams: { lootboxID: request.lootboxID },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      lootboxTable:
        manifest.bigQuery.datasets.firestoreExport.tables.lootbox.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return {
      ...data,
    };
  } catch (err) {
    console.error("error fetching base lootbox stats", err);
    throw new Error("An error occurred");
  }
};

interface LootboxReferrerStatisticsRequest {
  lootboxID: LootboxID;
  eventID: TournamentID;
}

export type ReferrerClaimsForLootboxServiceResponse = {
  userName: string;
  userAvatar: string;
  userID: string;
  claimCount: number;
}[];

export const lootboxReferrerStatistics = async (
  request: LootboxReferrerStatisticsRequest,
  callerUserID: UserID
): Promise<ReferrerClaimsForLootboxServiceResponse> => {
  const [lootbox, lootboxSnapshot, event] = await Promise.all([
    getLootbox(request.lootboxID),
    getLootboxTournamentSnapshotByLootboxID(request.eventID, request.lootboxID),
    getTournamentById(request.eventID),
  ]);

  if (!lootbox || !!lootbox.timestamps.deletedAt) {
    throw new Error("Lootbox not found");
  }

  if (!event || !!event.timestamps.deletedAt) {
    throw new Error("Event not found");
  }

  if (!lootboxSnapshot || !!lootboxSnapshot.timestamps.deletedAt) {
    throw new Error("Lootbox snapshot not found");
  }

  if (lootbox.creatorID !== callerUserID && event.creatorId !== callerUserID) {
    // Only allow lootbox creator or event creator to view stats
    throw new Error("Unauthorized");
  }

  try {
    const { data } = await referrerClaimsForLootbox({
      queryParams: {
        lootboxID: request.lootboxID,
        tournamentID: request.eventID,
      },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return data;
  } catch (err) {
    console.error("error fetching referrer lootbox stats", err);
    throw new Error("An error occurred");
  }
};

interface LootboxCampaignStatisticsRequest {
  lootboxID: LootboxID;
  eventID: TournamentID;
}
interface LootboxCampaignStatisticsResponse {
  data: {
    referralCampaignName: string;
    referralSlug: string;
    userAvatar: string;
    username: string;
    userID: string;
    claimCount: number;
  }[];
}
export const lootboxCampaignStatistics = async (
  request: LootboxCampaignStatisticsRequest,
  callerUserID: UserID
): Promise<LootboxCampaignStatisticsResponse> => {
  const [lootbox, lootboxSnapshot, event] = await Promise.all([
    getLootbox(request.lootboxID),
    getLootboxTournamentSnapshotByLootboxID(request.eventID, request.lootboxID),
    getTournamentById(request.eventID),
  ]);

  if (!lootbox || !!lootbox.timestamps.deletedAt) {
    throw new Error("Lootbox not found");
  }

  if (!event || !!event.timestamps.deletedAt) {
    throw new Error("Event not found");
  }

  if (!lootboxSnapshot || !!lootboxSnapshot.timestamps.deletedAt) {
    throw new Error("Lootbox snapshot not found");
  }

  if (lootbox.creatorID !== callerUserID && event.creatorId !== callerUserID) {
    // Only allow lootbox creator or event creator to view stats
    throw new Error("Unauthorized");
  }

  try {
    const { data } = await campaignClaimsForLootbox({
      queryParams: {
        lootboxID: request.lootboxID,
        tournamentID: request.eventID,
      },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return {
      data,
    };
  } catch (err) {
    console.error("error fetching referrer lootbox stats", err);
    throw new Error("An error occurred");
  }
};

export interface ClaimerStatsForTournamentServiceRow {
  claimerUserID: UserID | "";
  username: string;
  userAvatar: string;
  claimCount: number;
  claimType: string;
  totalUserClaimCount: number;
  referralType: string;
}

export interface ClaimerStatsForTournamentSeviceResponse {
  data: ClaimerStatsForTournamentServiceRow[];
}

export const claimerStatisticsForTournament = async (
  request: { eventID: TournamentID },
  callerUserID: UserID
): Promise<ClaimerStatsForTournamentSeviceResponse> => {
  const tournament = await getTournamentById(request.eventID);

  if (!tournament) {
    throw new Error("Event not Found");
  }

  if (tournament.creatorId !== callerUserID) {
    throw new Error("Unauthorized");
  }

  try {
    const { data } = await claimerStatsForTournament({
      queryParams: {
        eventID: request.eventID,
      },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return {
      data,
    };
  } catch (err) {
    console.error("error fetching claimer stats for event", err);
    throw new Error("An error occurred");
  }
};

export interface ClaimerStatsForLootboxTournamentServiceRow {
  claimerUserID: UserID | "";
  lootboxID: LootboxID;
  username: string;
  userAvatar: string;
  claimCount: number;
  claimType: string;
  totalUserClaimCount: number;
  referralType: string;
}

export interface ClaimerStatsForLootboxTournamentSeviceResponse {
  data: ClaimerStatsForLootboxTournamentServiceRow[];
}

export const claimerStatisticsForLootboxTournament = async (
  request: { eventID: TournamentID; lootboxID: LootboxID },
  callerUserID: UserID
): Promise<ClaimerStatsForLootboxTournamentSeviceResponse> => {
  const [tournament, lootbox] = await Promise.all([
    getTournamentById(request.eventID),
    getLootbox(request.lootboxID),
  ]);

  if (!tournament) {
    throw new Error("Event not Found");
  }

  if (!lootbox) {
    throw new Error("Lootbox not Found");
  }

  if (
    tournament.creatorId !== callerUserID &&
    callerUserID !== lootbox.creatorID
  ) {
    throw new Error("Unauthorized");
  }

  try {
    const { data } = await claimerStatsForLootboxTournament({
      queryParams: {
        eventID: request.eventID,
        lootboxID: request.lootboxID,
      },
      claimTable: manifest.bigQuery.datasets.firestoreExport.tables.claim.id,
      userTable: manifest.bigQuery.datasets.firestoreExport.tables.user.id,
      location: manifest.bigQuery.datasets.firestoreExport.location,
    });

    return {
      data: data.map((row) => ({
        ...row,
        lootboxID: request.lootboxID,
      })),
    };
  } catch (err) {
    console.error("error fetching claimer stats for event", err);
    throw new Error("An error occurred");
  }
};
