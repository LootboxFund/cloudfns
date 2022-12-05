import { BigQuery } from "@google-cloud/bigquery";
import { LootboxID, TournamentID } from "@wormgraph/helpers";

const bigquery = new BigQuery();

const convertBaseLootboxStatistics = (
  data: any
): BaseLootboxStatisticsResponse => {
  // Convert data into type T and return it
  return {
    totalClaimCount: data?.totalClaimCount || 0,
    completedClaimCount: data?.completedClaimCount || 0,
    viralClaimCount: data?.viralClaimCount || 0,
    bonusRewardClaimCount: data?.bonusRewardClaimCount || 0,
    oneTimeClaimCount: data?.oneTimeClaimCount || 0,
    completionRate: data?.completionRate || 0,
    maxTickets: data?.maxTickets || 0,
  };
};

export interface BaseLootboxStatisticsRequest {
  queryParams: {
    lootboxID: LootboxID;
    tournamentID?: TournamentID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  claimTable: string;
  lootboxTable: string;
  location: string; // Might be US or maybe the same location as the google cloud project
}

export interface BaseLootboxStatisticsResponse {
  totalClaimCount: number;
  completedClaimCount: number;
  viralClaimCount: number;
  bonusRewardClaimCount: number;
  oneTimeClaimCount: number;
  completionRate: number;
  maxTickets: number;
}
/**
 * Fetches base statistics for claims of a tournament
 */
export const baseLootboxStatistics = async ({
  queryParams,
  claimTable,
  lootboxTable,
  location,
}: BaseLootboxStatisticsRequest): Promise<BaseLootboxStatisticsResponse> => {
  console.log(
    "Querying BigQuery (BASE STATS)",
    `

    lootboxID: ${queryParams.lootboxID}
    lootboxTable: ${lootboxTable}
    claimTable: ${claimTable}
    location: ${location}
  
  `
  );

  // Queries the claim table to return base statistics about a tournament
  // Use parameterized queries to prevent SQL injection attacks
  // See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
  const query = `
    SELECT
      COUNT(*) AS totalClaimCount,
      COUNT(CASE WHEN claimsData.status = 'complete' THEN 1 ELSE null END) AS completedClaimCount,
      COUNT(CASE WHEN claimsData.status = 'complete' AND claimsData.type = 'referral' THEN 1 ELSE null END) AS viralClaimCount,
      COUNT(CASE WHEN claimsData.status = 'complete' AND claimsData.type = 'reward' THEN 1 ELSE null END) AS bonusRewardClaimCount,
      COUNT(CASE WHEN claimsData.status = 'complete' AND claimsData.type = 'one_time' THEN 1 ELSE null END) AS oneTimeClaimCount,
      ROUND( SAFE_DIVIDE(100* COUNT(CASE
            WHEN claimsData.status = 'complete' AND NOT claimsData.type = 'reward' THEN 1
          ELSE
          NULL
        END
          ), COUNT(CASE
            WHEN NOT claimsData.type = 'reward' THEN 1
          ELSE
          NULL
        END
          )) ) AS completionRate,
      lootboxData.maxTickets AS maxTickets
    FROM \`${claimTable}\` AS claimsData
    LEFT JOIN \`${lootboxTable}\` AS lootboxData
    ON claimsData.lootboxID = lootboxData.id
    where claimsData.lootboxID = @lootboxID${
      queryParams.tournamentID
        ? " AND claimsData.tournamentID = @tournamentID"
        : ""
    }
    GROUP BY lootboxData.id, lootboxData.maxTickets
    limit 1;
  `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: location,
    params: {
      lootboxID: queryParams.lootboxID,
      tournamentID: queryParams.tournamentID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return convertBaseLootboxStatistics(rows[0]);
};

export interface BaseClaimStatisticsForTournamentRequest {
  queryParams: {
    tournamentID: TournamentID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  table: string;
  location: string; // Might be US or maybe the same location as the google cloud project
}

export interface BaseClaimStatisticsForTournamentResponse {
  totalClaimCount: number;
  completedClaimCount: number;
  viralClaimCount: number;
  bonusRewardClaimCount: number;
  oneTimeClaimCount: number;
}

export interface LootboxCompletedClaimsForTournamentRequest {
  queryParams: {
    tournamentID: TournamentID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  claimTable: string;
  lootboxTable: string;
  lootboxSnapshotTable: string;
  location: string; // Might be US or maybe the same location as the google cloud project
}

export interface LootboxCompletedClaimsForTournamentRow {
  lootboxID: LootboxID;
  lootboxName: string;
  maxTickets: number;
  lootboxImg: string;
  claimCount: number;
}
export interface LootboxCompletedClaimsForTournamentResponse {
  data: LootboxCompletedClaimsForTournamentRow[];
}

const convertCompletedClaimStatisticsForTournamentRow = (
  data: any
): LootboxCompletedClaimsForTournamentRow => {
  // Convert data into type T and return it
  return {
    lootboxID: data?.lootboxID || "",
    lootboxName: data?.lootboxName || "",
    maxTickets: data?.maxTickets || 0,
    lootboxImg: data?.lootboxImg || "",
    claimCount: data?.claimCount || 0,
  };
};

export interface ReferrerForLootboxRequest {
  queryParams: {
    tournamentID: TournamentID;
    lootboxID: LootboxID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  claimTable: string;
  userTable: string;
  location: string; // Might be US or maybe the same location as the google cloud project
}

export interface ReferrerClaimsForLootboxRow {
  userName: string;
  userAvatar: string;
  userID: string;
  claimCount: number;
}
export interface ReferrerClaimsForLootboxResponse {
  data: ReferrerClaimsForLootboxRow[];
}

const convertUserClaimStatisticsForLootboxRow = (
  data: any
): ReferrerClaimsForLootboxRow => {
  // Convert data into type T and return it
  return {
    userName: data?.userName || "",
    userAvatar: data?.userAvatar || "",
    userID: data?.userID || "",
    claimCount: data?.claimCount || 0,
  };
};

/**
 * Fetches statistics for claims of a tournament
 */
export const referrerClaimsForLootbox = async ({
  queryParams,
  claimTable,
  userTable,
  location,
}: ReferrerForLootboxRequest): Promise<ReferrerClaimsForLootboxResponse> => {
  console.log(
    "Querying BigQuery (LOOTBOX TOURNAMENT COMPLETED CLAIMS)",
    `

    tournamentID: ${queryParams.tournamentID}
    lootboxID: ${queryParams.lootboxID}
    claimTable: ${claimTable}
    userTable: ${userTable}
    location: ${location}

  `
  );

  /**
   * Queries the claim table to return base statistics about a tournament
   * Use parameterized queries to prevent SQL injection attacks
   * See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
   */
  const query = `
    WITH
    AllLootboxClaims AS (
      SELECT
        claims.id AS claimID,
        claims.status AS claimStatus,
        claims.tournamentId AS tournamentID,
        users.id AS userID,
        users.username AS userName,
        users.avatar AS userAvatar
      FROM
        \`${userTable}\` AS users
      LEFT JOIN
        \`${claimTable}\` AS claims
      ON
        claims.referrerId = users.id
      WHERE
        claims.status = 'complete' AND claims.tournamentId = @eventID AND claims.lootboxID = @lootboxID
    )
    SELECT
      userName,
      userAvatar,
      userID,
      COUNT(CASE claimStatus WHEN 'complete' THEN 1 ELSE null END) as claimCount
    FROM
      AllLootboxClaims
    GROUP BY
      userID,
      userName,
      userAvatar
    ORDER BY claimCount DESC
    LIMIT 1000;
  `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: location,
    params: {
      eventID: queryParams.tournamentID,
      lootboxID: queryParams.lootboxID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return { data: rows.map(convertUserClaimStatisticsForLootboxRow) };
};
