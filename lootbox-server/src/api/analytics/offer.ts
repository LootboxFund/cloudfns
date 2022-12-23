import { bigquery } from "./client";
import { OfferID, TournamentID } from "@wormgraph/helpers";

interface OfferEventActivationsRow {
  activationName: string;
  adEventCount: number;
}
export interface GetOfferEventActivationsRequest {
  queryParams: {
    eventID: TournamentID;
    offerID: OfferID;
  };
  activationTable: string;
  adEventTable: string;
  flightTable: string;
  location: string;
}

const convertOfferEventActivationsRow = (
  data: any
): OfferEventActivationsRow => {
  // Convert data into type T and return it
  return {
    activationName: data?.activationName || "",
    adEventCount: data?.adEventCount || 0,
  };
};

export const getOfferEventActivations = async (
  payload: GetOfferEventActivationsRequest
): Promise<OfferEventActivationsRow[]> => {
  console.log(
    "Querying BigQuery (OFFER ACTIVATIONS CLAIMS)",
    `-
      
          eventID: ${payload.queryParams.eventID}
          offerID: ${payload.queryParams.offerID}
          activationTable: ${payload.activationTable}
          adEventTable: ${payload.adEventTable}
          flightTable: ${payload.flightTable}
          location: ${payload.location}
        
        `
  );

  /**
   * Queries the claim table to return claims per day
   * Use parameterized queries to prevent SQL injection attacks
   * See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
   */
  const query = `
        SELECT
            activations.name AS activationName,
            COUNT(adEvents.id) AS adEventCount
        FROM
            \`${payload.activationTable}\` AS activations
        LEFT JOIN
            \`${payload.adEventTable}\` AS adEvents
        ON
            activations.id = adEvents.activationID
        LEFT JOIN
            \`${payload.flightTable}\` AS flights
        ON
            adEvents.flightID = flights.id
        WHERE
            (flights.tournamentID IS NULL
                OR flights.tournamentID = @eventID)
        AND activations.offerID = @offerID
        GROUP BY
            activationID,
            activationName,
            activations.order_database_alias
        ORDER BY
            adEventCount DESC,
            activations.order_database_alias ASC
        LIMIT
            1000; 
          `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: payload.location,
    params: {
      eventID: payload.queryParams.eventID,
      offerID: payload.queryParams.offerID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return rows.map(convertOfferEventActivationsRow);
};
