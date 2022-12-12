import { BigQuery } from "@google-cloud/bigquery";
import {
  ClaimType_Firestore,
  LootboxID,
  ReferralType_Firestore,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";

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

export interface CampaignClaimsForLootboxRequest {
  queryParams: {
    tournamentID: TournamentID;
    lootboxID: LootboxID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  claimTable: string;
  userTable: string;
  location: string; // Might be US or maybe the same location as the google cloud project
}

export interface CampaignClaimsForLootboxRow {
  referralCampaignName: string;
  referralSlug: string;
  userAvatar: string;
  username: string;
  userID: string;
  claimCount: number;
}
export interface CampaignClaimsForLootboxResponse {
  data: CampaignClaimsForLootboxRow[];
}

const convertCampaignClaimsForLootboxRow = (
  data: any
): CampaignClaimsForLootboxRow => {
  // Convert data into type T and return it
  return {
    referralCampaignName: data?.referralCampaignName || "",
    referralSlug: data?.referralSlug || "",
    userAvatar: data?.userAvatar || "",
    username: data?.username || "",
    userID: data?.userID || "",
    claimCount: data?.claimCount || 0,
  };
};

/**
 * Fetches statistics for claims of a tournament
 */
export const campaignClaimsForLootbox = async ({
  queryParams,
  claimTable,
  userTable,
  location,
}: ReferrerForLootboxRequest): Promise<CampaignClaimsForLootboxResponse> => {
  console.log(
    "Querying BigQuery (LOOTBOX CAMPAIGN CLAIMS)",
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
    select 
      referralCampaignName,
      referralSlug,
      avatar as userAvatar,
      username,
      users.id as userID,
      COUNT(CASE WHEN claims.status = 'complete' THEN 1 ELSE null END) as claimCount
    from \`${claimTable}\`  as claims
    INNER JOIN 
      \`${userTable}\` as users
    ON claims.referrerId = users.id
    WHERE claims.tournamentId = @eventID
    AND claims.lootboxID = @lootboxID
    GROUP BY
      userID,
      referralCampaignName,
      referralSlug,
      username,
      avatar
    HAVING claimCount > 0
    ORDER BY claimCount DESC
    limit 1000;
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

  return { data: rows.map(convertCampaignClaimsForLootboxRow) };
};

export interface ClaimerStatsForLootboxRequest {
  queryParams: {
    eventID: TournamentID;
    lootboxID: LootboxID;
  };
  claimTable: string;
  userTable: string;
  location: string;
}
export interface ClaimerStatsForLootboxTournamentRow {
  claimerUserID: UserID | "";
  username: string | "";
  userAvatar: string | "";
  claimCount: number;
  claimType: ClaimType_Firestore | "";
  referralType: ReferralType_Firestore | "";
  totalUserClaimCount: number;
}
export interface ClaimerStatsForLootboxTournamentResponse {
  data: ClaimerStatsForLootboxTournamentRow[];
}
const convertClaimerStatsForLootboxTournamentRow = (
  data: any
): ClaimerStatsForLootboxTournamentRow => {
  return {
    claimerUserID: data?.claimerUserID || "",
    username: data?.username || "",
    userAvatar: data?.userAvatar || "",
    claimCount: data?.claimCount || 0,
    claimType: data?.claimType || "",
    totalUserClaimCount: data?.totalUserClaimCount || 0,
    referralType: data?.referralType || "",
  };
};
export const claimerStatsForLootboxTournament = async ({
  queryParams,
  claimTable,
  userTable,
  location,
}: ClaimerStatsForLootboxRequest): Promise<ClaimerStatsForLootboxTournamentResponse> => {
  console.log(
    "Querying BigQuery (LOOTBOX TOURNAMENT DAILY CLAIMS)",
    `

    tournamentID: ${queryParams.eventID}
    lootboxID: ${queryParams.lootboxID}
    claimTable: ${claimTable}
    userTable: ${userTable}
    location: ${location}
  
  `
  );

  /**
   * Queries the claim table to return claims per day
   * Use parameterized queries to prevent SQL injection attacks
   * See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
   */
  const query = `
    SELECT
      claims.claimerUserId AS claimerUserID,
      users.username AS username,
      users.avatar AS userAvatar,
      claims.type AS claimType,
      claims.referralType AS referralType,
      COUNT(*) AS claimCount,
      SUM(COUNT(claims.claimerUserId)) OVER (PARTITION BY claims.claimerUserId) AS totalUserClaimCount
    FROM
      \`${claimTable}\` AS claims
    LEFT JOIN
      \`${userTable}\` AS users
    ON claims.claimerUserId = users.id
    WHERE
      claims.tournamentId = @eventID
      AND claims.status = 'complete'
      AND claims.lootboxID = @lootboxID
    GROUP BY
      claims.claimerUserID,
      users.username,
      users.avatar,
      claims.type,
      claims.referralType
    Order BY
      totalUserClaimCount DESC
    LIMIT
      2000;
    `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: location,
    params: {
      eventID: queryParams.eventID,
      lootboxID: queryParams.lootboxID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return { data: rows.map(convertClaimerStatsForLootboxTournamentRow) };
};
