import {
  getLootbox,
  getLootboxTournamentSnapshotByLootboxID,
  getTournamentById,
} from "../api/firestore";
import { LootboxID, TournamentID, UserID } from "@wormgraph/helpers";
import {
  baseLootboxStatistics,
  referrerClaimsForLootbox,
} from "../api/analytics/lootbox";
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
