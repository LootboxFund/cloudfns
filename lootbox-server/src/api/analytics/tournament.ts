import { BigQuery } from "@google-cloud/bigquery";
import { LootboxID, TournamentID, UserID } from "@wormgraph/helpers";

const bigquery = new BigQuery();

const convertBaseClaimStatisticsForTournamentRow = (
  data: any
): BaseClaimStatisticsForTournamentResponse => {
  // Convert data into type T and return it
  return {
    totalClaimCount: data?.totalClaimCount || 0,
    completedClaimCount: data?.completedClaimCount || 0,
    viralClaimCount: data?.viralClaimCount || 0,
    bonusRewardClaimCount: data?.bonusRewardClaimCount || 0,
    oneTimeClaimCount: data?.oneTimeClaimCount || 0,
    completionRate: data?.completionRate || 0,
  };
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
  completionRate: number;
}
/**
 * Fetches base statistics for claims of a tournament
 */
export const baseClaimStatisticsForTournament = async ({
  queryParams,
  table,
  location,
}: BaseClaimStatisticsForTournamentRequest): Promise<BaseClaimStatisticsForTournamentResponse> => {
  console.log(
    "Querying BigQuery (BASE STATS)",
    `

    tournamentID: ${queryParams.tournamentID}
    table: ${table}
    location: ${location}
  
  `
  );

  // Queries the claim table to return base statistics about a tournament
  // Use parameterized queries to prevent SQL injection attacks
  // See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
  const query = `
    SELECT
      COUNT(*) AS totalClaimCount,
      COUNT(CASE WHEN status = 'complete' THEN 1 ELSE null END) AS completedClaimCount,
      COUNT(CASE WHEN status = 'complete' AND type = 'referral' THEN 1 ELSE null END) AS viralClaimCount,
      COUNT(CASE WHEN status = 'complete' AND type = 'reward' THEN 1 ELSE null END) AS bonusRewardClaimCount,
      COUNT(CASE WHEN status = 'complete' AND type = 'one_time' THEN 1 ELSE null END) AS oneTimeClaimCount,
      ROUND( SAFE_DIVIDE(100* COUNT(CASE
            WHEN status = 'complete' AND NOT type = 'reward' THEN 1
          ELSE
          NULL
        END
          ), COUNT(CASE
            WHEN NOT type = 'reward' THEN 1
          ELSE
          NULL
        END
          )) ) AS completionRate
    FROM \`${table}\` where tournamentId = @eventID
    limit 1;
  `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: location,
    params: {
      eventID: queryParams.tournamentID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return convertBaseClaimStatisticsForTournamentRow(rows[0]);
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

/**
 * Fetches base statistics for claims of a tournament
 */
export const lootboxCompletedClaimsForTournament = async ({
  queryParams,
  claimTable,
  lootboxTable,
  lootboxSnapshotTable,
  location,
}: LootboxCompletedClaimsForTournamentRequest): Promise<LootboxCompletedClaimsForTournamentResponse> => {
  console.log(
    "Querying BigQuery (TOURNAMENT COMPLETED CLAIMS)",
    `

    tournamentID: ${queryParams.tournamentID}
    claimTable: ${claimTable}
    lootboxTable: ${lootboxTable}
    lootboxSnapshotTable: ${lootboxSnapshotTable}
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
      AllTournamentClaims AS (
        SELECT
          lootbox.id AS lootboxID,
          lootbox.name AS lootboxName,
          lootbox.maxTickets AS maxTickets,
          lootbox.stampImage AS lootboxImg,
          claim.id AS claimID,
          claim.lootboxID AS lootboxID_Claim,
          claim.status AS claimStatus
        FROM
          \`${lootboxSnapshotTable}\` AS lootboxSnapshot
        LEFT JOIN
          \`${lootboxTable}\` AS lootbox
        ON 
          lootbox.id = lootboxSnapshot.lootboxID
        LEFT OUTER JOIN
          \`${claimTable}\` AS claim
        ON
          lootbox.id = claim.lootboxID
        WHERE
          lootboxSnapshot.tournamentID = @eventID
      )
    SELECT
      lootboxID,
      lootboxName,
      maxTickets,
      lootboxImg,
      COUNT(CASE claimStatus WHEN 'complete' THEN 1 ELSE null END) as claimCount
    FROM
      AllTournamentClaims
    GROUP BY
      lootboxID,
      lootboxName,
      maxTickets,
      lootboxImg
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
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return { data: rows.map(convertCompletedClaimStatisticsForTournamentRow) };
};

export interface ReferrerForTournamentRequest {
  queryParams: {
    tournamentID: TournamentID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  claimTable: string;
  userTable: string;
  location: string; // Might be US or maybe the same location as the google cloud project
}

export interface ReferrerClaimsForTournamentRow {
  userName: string;
  userAvatar: string;
  userID: string;
  claimCount: number;
}
export interface ReferrerClaimsForTournamentResponse {
  data: ReferrerClaimsForTournamentRow[];
}

const convertUserClaimStatisticsForTournamentRow = (
  data: any
): ReferrerClaimsForTournamentRow => {
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
export const referrerClaimsForTournament = async ({
  queryParams,
  claimTable,
  userTable,
  location,
}: ReferrerForTournamentRequest): Promise<ReferrerClaimsForTournamentResponse> => {
  console.log(
    "Querying BigQuery (TOURNAMENT COMPLETED CLAIMS)",
    `

    tournamentID: ${queryParams.tournamentID}
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
    AllTournamentClaims AS (
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
        claims.status = 'complete' AND claims.tournamentId = @eventID
    )
    SELECT
      userName,
      userAvatar,
      userID,
      COUNT(CASE claimStatus WHEN 'complete' THEN 1 ELSE null END) as claimCount
    FROM
      AllTournamentClaims
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
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return { data: rows.map(convertUserClaimStatisticsForTournamentRow) };
};

export interface CampaignClaimsForTournamentRequest {
  queryParams: {
    tournamentID: TournamentID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  claimTable: string;
  userTable: string;
  location: string; // Might be US or maybe the same location as the google cloud project
}

export interface CampaignClaimsForTournamentRow {
  referralCampaignName: string;
  referralSlug: string;
  userAvatar: string;
  username: string;
  userID: string;
  claimCount: number;
}
export interface CampaignClaimsForTournamentResponse {
  data: CampaignClaimsForTournamentRow[];
}

const convertCampaignClaimsForTournamentRow = (
  data: any
): CampaignClaimsForTournamentRow => {
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
export const campaignClaimsForTournament = async ({
  queryParams,
  claimTable,
  userTable,
  location,
}: ReferrerForTournamentRequest): Promise<CampaignClaimsForTournamentResponse> => {
  console.log(
    "Querying BigQuery (TOURNAMENT CAMPAIGN CLAIMS)",
    `

    tournamentID: ${queryParams.tournamentID}
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
    WHERE tournamentId = @eventID
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
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return { data: rows.map(convertCampaignClaimsForTournamentRow) };
};

export interface DailyClaimStatisticsForTournamentRequest {
  queryParams: {
    eventID: TournamentID;
    /** Like: 2022-03-12 */
    startDate: string;
    /** Like: 2022-03-12 */
    endDate: string;
  };
  claimTable: string;
  location: string;
}
export interface DailyClaimStatisticsForTournamentRow {
  // Like 2022-03-12
  date: string;
  // Day of the week [1-7]
  day: number;
  // Day of the week [1-52]
  week: number;
  // Day of the week [1-infinity] (this is normalized and flattened given the start date)
  weekNormalized: number;
  claimCount: number; // Number of claims for the given day
}
export interface DailyClaimStatisticsForTournamentResponse {
  data: DailyClaimStatisticsForTournamentRow[];
}
const convertDailyClaimStatisticsForTournamentRow = (
  data: any
): DailyClaimStatisticsForTournamentRow => {
  return {
    date: data?.dateValue?.value || "",
    day: data?.day || 0,
    week: data?.week || 0,
    weekNormalized: data?.weekNormalized || 0,
    claimCount: data?.claimCount || 0,
  };
};
export const dailyClaimStatisticsForTournament = async ({
  queryParams,
  claimTable,
  location,
}: DailyClaimStatisticsForTournamentRequest): Promise<DailyClaimStatisticsForTournamentResponse> => {
  console.log(
    "Querying BigQuery (TOURNAMENT DAILY CLAIMS)",
    `

    tournamentID: ${queryParams.eventID}
    claimTable: ${claimTable}
    location: ${location}
    startDate: ${queryParams.startDate}
    endDate: ${queryParams.endDate}
  
  `
  );

  /**
   * Queries the claim table to return claims per day
   * Use parameterized queries to prevent SQL injection attacks
   * See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
   */
  const query = `
      WITH
        DateTable AS (
        SELECT
          dateValue
        FROM
          UNNEST( GENERATE_DATE_ARRAY(DATE(@startDate), DATE(@endDate), INTERVAL 1 DAY) ) AS dateValue ),
        TournamentClaimTable AS (
          SELECT 
            * 
          FROM \`${claimTable}\`
          WHERE tournamentId = @eventID
        ),
        CompletedClaims AS (
        SELECT
          dateValue,
          status as claimStatus,
          DATE(TIMESTAMP_SECONDS(CAST(timestamps_completedAt / 1000 AS INT64))) AS completedDate
        FROM
          DateTable
        LEFT OUTER JOIN
          TournamentClaimTable
        ON
          DATE(TIMESTAMP_SECONDS(CAST(timestamps_completedAt / 1000 AS INT64))) = dateValue
        )
      SELECT
        dateValue,
        EXTRACT(DAYOFWEEK
          FROM
            dateValue) AS day,
        EXTRACT(WEEK
          FROM
            dateValue) AS week,
          (EXTRACT(WEEK
            FROM
              dateValue ) + 53 * ( EXTRACT(YEAR
              FROM
                dateValue ) - EXTRACT(YEAR
              FROM
                DATE(@startDate)))) - EXTRACT(WEEK
          FROM
            DATE(@startDate)
          ) + 1 AS weekNormalized,
        COUNT(
          CASE claimStatus
            WHEN 'complete' THEN 1
            ELSE
            NULL
          END
        ) AS claimCount
      FROM
        CompletedClaims
      WHERE
        dateValue BETWEEN @startDate
        AND @endDate
      GROUP BY
        dateValue
      LIMIT
        1000;
  `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: location,
    params: {
      eventID: queryParams.eventID,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return { data: rows.map(convertDailyClaimStatisticsForTournamentRow) };
};

export interface ClaimerStatsForTournamentRequest {
  queryParams: {
    eventID: TournamentID;
  };
  claimTable: string;
  userTable: string;
  location: string;
}
export interface ClaimerStatsForTournamentRow {
  claimerUserID: UserID;
  username: string;
  userAvatar: string;
  claimCount: number;
}
export interface ClaimerStatsForTournamentResponse {
  data: ClaimerStatsForTournamentRow[];
}
const convertClaimerStatsForTournamentRow = (
  data: any
): ClaimerStatsForTournamentRow => {
  return {
    claimerUserID: data?.claimerUserID || "",
    username: data?.username || "",
    userAvatar: data?.userAvatar || "",
    claimCount: data?.claimCount || 0,
  };
};
export const claimerStatsForTournament = async ({
  queryParams,
  claimTable,
  userTable,
  location,
}: ClaimerStatsForTournamentRequest): Promise<ClaimerStatsForTournamentResponse> => {
  console.log(
    "Querying BigQuery (TOURNAMENT DAILY CLAIMS)",
    `

    tournamentID: ${queryParams.eventID}
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
      COUNT(*) AS claimCount
    FROM
      \`${claimTable}\` AS claims
    LEFT JOIN 
      \`${userTable}\` AS users
    ON claims.claimerUserId = users.id
    WHERE
      claims.tournamentId = @eventID
      AND claims.status = 'complete'
    GROUP BY
      claims.claimerUserID,
      users.username,
      users.avatar
    Order BY
      claimCount DESC
    LIMIT
      1000;
  `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: location,
    params: {
      eventID: queryParams.eventID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return { data: rows.map(convertClaimerStatsForTournamentRow) };
};
