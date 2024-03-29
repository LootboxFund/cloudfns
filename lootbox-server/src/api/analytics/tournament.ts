import {
  ClaimType_Firestore,
  LootboxID,
  ReferralType_Firestore,
  TournamentID,
  UserID,
} from "@wormgraph/helpers";
import { bigquery } from "./client";

const convertBaseClaimStatisticsForTournamentRow = (
  data: any
): BaseClaimStatisticsForTournamentResponse => {
  // Convert data into type T and return it
  return {
    // totalClaimCount: data?.totalClaimCount || 0,
    // completedClaimCount: data?.completedClaimCount || 0,
    // viralClaimCount: data?.viralClaimCount || 0,
    // bonusRewardClaimCount: data?.bonusRewardClaimCount || 0,
    // oneTimeClaimCount: data?.oneTimeClaimCount || 0,
    // completionRate: data?.completionRate || 0,
    totalClaimCount: data?.totalClaimCount || 0,
    completedClaimCount: data?.completedClaimCount || 0,
    viralClaimCount: data?.viralClaimCount || 0,
    referralBonusClaimCount: data?.referralBonusClaimCount || 0,
    participationRewardCount: data?.participationRewardCount || 0,
    airdropClaimCount: data?.airdropClaimCount || 0,
    pendingClaims: data?.pendingClaims || 0,
    originalClaims: data?.originalClaims || 0,
    impressions: data?.impressions || 0,
    allFans: data?.allFans || 0,
    originalFans: data?.originalFans || 0,
    viralFans: data?.viralFans || 0,
    completionRate: data?.completionRate || 0,
    airdropCompletionRate: data?.airdropCompletionRate || 0,
    totalMaxTickets: data?.totalMaxTickets || 0,
    participationFans: data?.participationFans || 0,
    completedPlayerClaimCount: data?.completedPlayerClaimCount || 0,
    completedPromoterClaimCount: data?.completedPromoterClaimCount || 0,
    totalPlayerMaxTickets: data?.totalPlayerMaxTickets || 0,
    totalPromoterMaxTickets: data?.totalPromoterMaxTickets || 0,
  };
};

export interface BaseClaimStatisticsForTournamentRequest {
  queryParams: {
    tournamentID: TournamentID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  claimTable: string;
  lootboxTable: string;
  lootboxTournamentSnapshotTable: string;
  userTable: string;
  location: string; // Might be US or maybe the same location as the google cloud project
}

export interface BaseClaimStatisticsForTournamentResponse {
  // totalClaimCount: number;
  // completedClaimCount: number;
  // viralClaimCount: number;
  // bonusRewardClaimCount: number;
  // oneTimeClaimCount: number;
  // completionRate: number;
  totalClaimCount: number;
  /** All completed claims */
  completedClaimCount: number;
  /** Only completed claims for player lootboxes */
  completedPlayerClaimCount: number;
  /** Only completed claims for promoter lootboxes */
  completedPromoterClaimCount: number;
  viralClaimCount: number;
  referralBonusClaimCount: number;
  participationRewardCount: number;
  airdropClaimCount: number;
  pendingClaims: number;
  originalClaims: number;
  impressions: number;
  allFans: number;
  originalFans: number;
  viralFans: number;
  completionRate: number;
  airdropCompletionRate: number;
  totalMaxTickets: number;
  totalPlayerMaxTickets: number;
  totalPromoterMaxTickets: number;
  participationFans: number;
}
/**
 * Fetches base statistics for claims of a tournament
 */
export const baseClaimStatisticsForTournament = async ({
  queryParams,
  claimTable,
  lootboxTable,
  lootboxTournamentSnapshotTable,
  userTable,
  location,
}: BaseClaimStatisticsForTournamentRequest): Promise<BaseClaimStatisticsForTournamentResponse> => {
  console.log(
    "Querying BigQuery (BASE STATS)",
    `

    tournamentID: ${queryParams.tournamentID}
    claimTable: ${claimTable}
    lootboxTable: ${lootboxTable}
    lootboxTournamentSnapshotTable: ${lootboxTournamentSnapshotTable}
    userTable: ${userTable}
    location: ${location}
  
  `
  );

  // Queries the claim table to return base statistics about a tournament
  // Use parameterized queries to prevent SQL injection attacks
  // See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
  // const query = `
  //   SELECT
  //     COUNT(*) AS totalClaimCount,
  //     COUNT(CASE WHEN status = 'complete' THEN 1 ELSE null END) AS completedClaimCount,
  //     COUNT(CASE WHEN status = 'complete' AND type = 'referral' THEN 1 ELSE null END) AS viralClaimCount,
  //     COUNT(CASE WHEN status = 'complete' AND type = 'reward' THEN 1 ELSE null END) AS bonusRewardClaimCount,
  //     COUNT(CASE WHEN status = 'complete' AND type = 'one_time' THEN 1 ELSE null END) AS oneTimeClaimCount,
  //     ROUND( SAFE_DIVIDE(100* COUNT(CASE
  //           WHEN status = 'complete' AND NOT type = 'reward' THEN 1
  //         ELSE
  //         NULL
  //       END
  //         ), COUNT(CASE
  //           WHEN NOT type = 'reward' THEN 1
  //         ELSE
  //         NULL
  //       END
  //         )) ) AS completionRate
  //   FROM \`${table}\` where tournamentId = @eventID
  //   limit 1;
  // `;

  const query = `
    WITH DataTable AS (
      SELECT 
        claim.status AS claimStatus,
        claim.claimerUserId AS claimerUserID,
        claim.referralType AS claimReferralType,
        claim.type AS claimType,
        claim.lootboxId AS claimLootboxID,
        claim.lootboxType AS claimLootboxType
      FROM \`${claimTable}\` as claim
      LEFT JOIN \`${userTable}\` as user
      ON claim.claimerUserId = user.id
      WHERE claim.tournamentId = @eventID
    ), LootboxTable AS (
      SELECT lootbox.id AS lootboxID,
        lootbox.maxTickets AS lootboxMaxTickets,
        lootbox.type AS lootboxType
        FROM \`${lootboxTournamentSnapshotTable}\` AS snapshot
        INNER JOIN \`${lootboxTable}\` AS lootbox
        ON lootbox.id = snapshot.lootboxId
        WHERE snapshot.tournamentID = @eventID
    )
    SELECT
      COUNT(*) AS totalClaimCount,
      SUM(CASE WHEN claimStatus = 'complete' THEN 1 ELSE 0 END) AS completedClaimCount,
      SUM(CASE WHEN claimStatus = 'complete' AND claimLootboxType = 'Promoter' THEN 1 ELSE 0 END) AS completedPromoterClaimCount,
      SUM(CASE WHEN claimStatus = 'complete' AND claimLootboxType = 'Player' THEN 1 ELSE 0 END) AS completedPlayerClaimCount,
      SUM(CASE WHEN claimReferralType = 'viral' AND claimStatus = 'complete' AND claimType = 'referral' THEN 1 ELSE 0 END) AS viralClaimCount,
      SUM(CASE WHEN claimReferralType = 'viral' AND claimStatus = 'complete' AND claimType = 'reward' THEN 1 ELSE 0 END) AS referralBonusClaimCount,
      SUM(CASE WHEN claimReferralType = 'one_time' AND claimStatus = 'complete' AND claimType = 'one_time' THEN 1 ELSE 0 END) AS participationRewardCount,
      SUM(CASE WHEN claimStatus = 'airdrop' AND claimType = 'complete' THEN 1 ELSE 0 END) AS airdropClaimCount,
      SUM(CASE WHEN claimStatus = 'pending' THEN 1 ELSE 0 END) AS pendingClaims,
      SUM(CASE WHEN claimReferralType = 'genesis' AND claimStatus = 'complete' AND claimType = 'referral' THEN 1 ELSE 0 END) AS originalClaims,
      SUM(CASE WHEN claimType != 'reward' AND claimType != 'airdrop' THEN 1 ELSE 0 END) AS impressions,
      -- allFans are those with pending tickets, verified tickets, anon users ETC
      COUNT(DISTINCT(claimerUserID)) AS allFans,
      -- originalFans are those with completed claim w genesis referral
      (
        SELECT COUNT(DISTINCT(claimerUserID)) 
        FROM DataTable 
        WHERE
          claimReferralType = 'genesis' AND claimStatus = 'complete' AND claimType != 'airdrop'
      ) as originalFans,
      -- viralFans, those who have completed a "viral" referral link (AKA non-genesis, or reward for ex)
      (
        SELECT COUNT(DISTINCT(claimerUserID)) 
        FROM DataTable 
        WHERE
          claimReferralType = 'viral' AND claimType = 'referral' AND claimStatus = 'complete'
      ) as viralFans,
      (
        SELECT COUNT(DISTINCT(claimerUserID)) 
        FROM DataTable 
        WHERE
          claimReferralType = 'one_time' AND claimType = 'one_time' AND claimStatus = 'complete'
      ) as participationFans,
      ROUND( SAFE_DIVIDE(100* COUNT(CASE
            WHEN claimStatus = 'complete' AND NOT claimType = 'reward' AND claimType != 'airdrop' THEN 1
          ELSE
          NULL
        END
          ), COUNT(CASE
            WHEN NOT claimType = 'reward' THEN 1
          ELSE
          NULL
        END
          )) ) AS completionRate,
          ROUND( SAFE_DIVIDE(100* COUNT(CASE
            WHEN claimStatus = 'complete' AND claimType = 'airdrop' THEN 1
          ELSE
          NULL
        END
          ), COUNT(CASE
            WHEN NOT claimType = 'airdrop' THEN 1
          ELSE
          NULL
        END
          )) ) AS airdropCompletionRate,
        (
          SELECT 
          SUM(lootboxMaxTickets) FROM LootboxTable -- WHERE LootboxTable.lootboxID IN (SELECT DataTable.claimLootboxID from DataTable)
        )  as totalMaxTickets,
        (
          SELECT 
          SUM(lootboxMaxTickets) FROM LootboxTable where lootboxType = 'Player' -- WHERE LootboxTable.lootboxID IN (SELECT DataTable.claimLootboxID from DataTable)
        )  as totalPlayerMaxTickets,
        (
          SELECT 
          SUM(lootboxMaxTickets) FROM LootboxTable where lootboxType = 'Promoter' -- WHERE LootboxTable.lootboxID IN (SELECT DataTable.claimLootboxID from DataTable)
        )  as totalPromoterMaxTickets,
    FROM DataTable
    LIMIT 1;
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
  claimerUserID: UserID | "";
  username: string | "";
  userAvatar: string | "";
  claimCount: number;
  claimType: ClaimType_Firestore | "";
  totalUserClaimCount: number;
  referralType: ReferralType_Firestore | "";
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
    claimType: data?.claimType || "",
    totalUserClaimCount: data?.totalUserClaimCount || 0,
    referralType: data?.referralType || "",
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
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return { data: rows.map(convertClaimerStatsForTournamentRow) };
};
