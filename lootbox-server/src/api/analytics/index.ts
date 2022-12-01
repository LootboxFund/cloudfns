import { BigQuery } from "@google-cloud/bigquery";
import { LootboxID, TournamentID } from "@wormgraph/helpers";

const bigquery = new BigQuery();

const convertBaseClaimStatisticsForTournamentRow = (
  data: any
): BaseClaimStatisticsForTournamentResponse => {
  // Convert data into type T and return it
  console.log("Converting data", data);
  return {
    totalClaimCount: data?.totalClaimCount || 0,
    completedClaimCount: data?.completedClaimCount || 0,
    viralClaimCount: data?.viralClaimCount || 0,
    bonusRewardClaimCount: data?.bonusRewardClaimCount || 0,
    oneTimeClaimCount: data?.oneTimeClaimCount || 0,
    pendingClaimCount: data?.pendingClaimCount || 0,
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
  pendingClaimCount: number;
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
  with all_claims as (
    select status, type
      from \`${table}\` where tournamentId = @eventID
  ),
  completed_claims as (
    select * from all_claims where status = 'complete'
  ),
  viral_claims as (
    select * from completed_claims where type = 'viral'
  ),
  reward_claims as (
    select * from completed_claims where type = 'reward'
  ),
  one_time_claims as (
    select * from completed_claims where type = 'one_time'
  ),
  pending_claims as (
    select * from all_claims where status = 'pending'
  )
  select 
    (select count(*) from all_claims)  as totalClaimCount,
    (select count(*) from completed_claims) as completedClaimCount,
    (select count(*) from viral_claims) as viralClaimCount,
    (select count(*) from reward_claims) as bonusRewardClaimCount,
    (select count(*) from one_time_claims) as oneTimeClaimCount,
    (select count(*) from pending_claims) as pendingClaimCount;
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
  pendingClaimCount: number;
}

export interface LootboxCompletedClaimsForTournamentRequest {
  queryParams: {
    tournamentID: TournamentID;
  };
  /** Like manifest.bigquery.tables.claim (i.e. ) */
  claimTable: string;
  lootboxTable: string;
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
  console.log("Converting data", data);
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
  location,
}: LootboxCompletedClaimsForTournamentRequest): Promise<LootboxCompletedClaimsForTournamentResponse> => {
  console.log(
    "Querying BigQuery (TOURNAMENT COMPLETED CLAIMS)",
    `

    tournamentID: ${queryParams.tournamentID}
    claimTable: ${claimTable}
    lootboxTable: ${lootboxTable}
    location: ${location}
  
  `
  );

  // Queries the claim table to return base statistics about a tournament
  // Use parameterized queries to prevent SQL injection attacks
  // See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
  const query = `
    WITH
      T AS (
        SELECT
          lootbox.id AS lootboxID,
          lootbox.name AS lootboxName,
          lootbox.maxTickets AS maxTickets,
          lootbox.stampImage AS lootboxImg,
          claim.id AS claimID,
          claim.lootboxID AS lootboxID_Claim,
          claim.status AS claimStatus
        FROM
          \`lootbox-fund-staging.firestore_export.lootbox_schema_lootbox_schema_latest\` AS lootbox
        LEFT OUTER JOIN
          \`lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest\` AS claim
        ON
          lootbox.id = claim.lootboxID
        WHERE
          claim.status = 'complete' and claim.tournamentID = @eventID
      )
    SELECT
      lootboxID,
      lootboxName,
      maxTickets,
      lootboxImg,
      COUNT(lootboxID) AS claimCount
    FROM
      T
    GROUP BY
      lootboxID,
      lootboxName,
      maxTickets,
      lootboxImg
    ORDER BY claimCount DESC;
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
