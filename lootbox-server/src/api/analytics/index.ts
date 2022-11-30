import { BigQuery } from "@google-cloud/bigquery";
import { TournamentID } from "@wormgraph/helpers";

const bigquery = new BigQuery();

const convertSQLRowToBaseClaimStatisticsForTournament = (
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
    "Querying BigQuery for",
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
  )
  select 
    (select count(*) from all_claims)  as totalClaimCount,
    (select count(*) from completed_claims) as completedClaimCount,
    (select count(*) from viral_claims) as viralClaimCount,
    (select count(*) from reward_claims) as bonusRewardClaimCount,
    (select count(*) from one_time_claims) as oneTimeClaimCount
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

  return convertSQLRowToBaseClaimStatisticsForTournament(rows[0]);
};
