import { bigquery } from "./client";
import { OfferID, TournamentID } from "@wormgraph/helpers";
import { manifest } from "../../manifest";

interface OfferEventActivationsRow {
  activationName: string;
  adEventCount: number;
  activationDescription: string;
  activationID: string;
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
    activationDescription: data?.activationDescription || "",
    activationID: data?.activationID || "",
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
            activations.description AS activationDescription,
            activations.id AS activationID,
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
            activationDescription,
            activationID,
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

interface OfferActivationsRow {
  activationName: string;
  adEventCount: number;
  activationDescription: string;
  activationID: string;
}
export interface GetOfferActivationsRequest {
  queryParams: {
    offerID: OfferID;
  };
  activationTable: string;
  adEventTable: string;
  flightTable: string;
  location: string;
}

const convertOfferActivationsRow = (data: any): OfferActivationsRow => {
  // Convert data into type T and return it
  return {
    activationName: data?.activationName || "",
    adEventCount: data?.adEventCount || 0,
    activationDescription: data?.activationDescription || "",
    activationID: data?.activationID || "",
  };
};

export const getOfferActivations = async (
  payload: GetOfferActivationsRequest
): Promise<OfferEventActivationsRow[]> => {
  console.log(
    "Querying BigQuery (OFFER ACTIVATIONS CLAIMS)",
    `-
      
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
            activations.description AS activationDescription,
            activations.id AS activationID,
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
            activations.offerID = @offerID
        GROUP BY
            activationID,
            activationName,
            activationDescription,
            activationID,
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
      offerID: payload.queryParams.offerID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return rows.map(convertOfferActivationsRow);
};

export interface EventOfferClaimWithQARow
  extends EventClaimQuestionAndAnswerBaseRow {
  claimCompletedAt: string;
  username: string;
  userPublicProfilePage: string;
  claimType: string;
  claimStatus: string;
  referralType: string;
  adSetID: string;
  offerTitle: string;
  eventName: string;
  referrerUsername: string;
  referrerPublicProfile: string;
}
export interface EventOfferQuestionAnswerByEventRequest {
  queryParams: {
    offerID: OfferID;
    eventID: TournamentID;
  };
  claimTable: string;
  questionAnswerTable: string;
  claimPrivacyTable: string;
  offerTable: string;
  flightTable: string;
  userTable: string;
  location: string;
}

export interface EventClaimQuestionAndAnswerBaseRow {
  question_1: string;
  answer_1: string;
  question_2: string;
  answer_2: string;
  question_3: string;
  answer_3: string;
  question_4: string;
  answer_4: string;
  question_5: string;
  answer_5: string;
  question_6: string;
  answer_6: string;
  question_7: string;
  answer_7: string;
  question_8: string;
  answer_8: string;
  question_9: string;
  answer_9: string;
  question_10: string;
  answer_10: string;
  question_11: string;
  answer_11: string;
  question_12: string;
  answer_12: string;
  question_13: string;
  answer_13: string;
  question_14: string;
  answer_14: string;
  question_15: string;
  answer_15: string;
  question_16: string;
  answer_16: string;
  question_17: string;
  answer_17: string;
  question_18: string;
  answer_18: string;
  question_19: string;
  answer_19: string;
  question_20: string;
  answer_20: string;
}

const convertEventOfferClaimsWithQAByEvent = (
  data: any
): EventOfferClaimWithQARow => {
  // Convert data into type T and return it
  return {
    claimCompletedAt: data?.claimCompletedAt || "",
    username: data?.username || "",
    userPublicProfilePage: data?.userPublicProfilePage || "",
    claimType: data?.claimType || "",
    claimStatus: data?.claimStatus || "",
    referralType: data?.referralType || "",
    adSetID: data?.adSetID || "",
    offerTitle: data?.offerTitle || "",
    eventName: data?.eventName || "",
    referrerUsername: data?.referrerUsername || "",
    referrerPublicProfile: data?.referrerPublicProfile || "",
    question_1: data?.question_1 || "",
    answer_1: data?.answer_1 || "",
    question_2: data?.question_2 || "",
    answer_2: data?.answer_2 || "",
    question_3: data?.question_3 || "",
    answer_3: data?.answer_3 || "",
    question_4: data?.question_4 || "",
    answer_4: data?.answer_4 || "",
    question_5: data?.question_5 || "",
    answer_5: data?.answer_5 || "",
    question_6: data?.question_6 || "",
    answer_6: data?.answer_6 || "",
    question_7: data?.question_7 || "",
    answer_7: data?.answer_7 || "",
    question_8: data?.question_8 || "",
    answer_8: data?.answer_8 || "",
    question_9: data?.question_9 || "",
    answer_9: data?.answer_9 || "",
    question_10: data?.question_10 || "",
    answer_10: data?.answer_10 || "",
    question_11: data?.question_11 || "",
    answer_11: data?.answer_11 || "",
    question_12: data?.question_12 || "",
    answer_12: data?.answer_12 || "",
    question_13: data?.question_13 || "",
    answer_13: data?.answer_13 || "",
    question_14: data?.question_14 || "",
    answer_14: data?.answer_14 || "",
    question_15: data?.question_15 || "",
    answer_15: data?.answer_15 || "",
    question_16: data?.question_16 || "",
    answer_16: data?.answer_16 || "",
    question_17: data?.question_17 || "",
    answer_17: data?.answer_17 || "",
    question_18: data?.question_18 || "",
    answer_18: data?.answer_18 || "",
    question_19: data?.question_19 || "",
    answer_19: data?.answer_19 || "",
    question_20: data?.question_20 || "",
    answer_20: data?.answer_20 || "",
  };
};

/**
 * Returns rows of claims with questions and answers if applicable
 * Questions and Answers columns are structured with these keys:
 * question_1, answer_1, question_2, answer_2, etc.
 *
 * Right now this query is slightly limited because we are fetching a hardcoded number of 20
 * questions. TODO: figure out how to get dynamic keys from the SQL query
 */
export const getEventOfferClaimsWithQAByEvent = async (
  payload: EventOfferQuestionAnswerByEventRequest
): Promise<EventOfferClaimWithQARow[]> => {
  console.log("Querying Big Query: Offer Question Answers By Event");

  /**
   * Queries the claim table to return claims per day
   * Use parameterized queries to prevent SQL injection attacks
   * See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
   */
  const query = `
  WITH
    QuestionAnswers_Raw AS (
    SELECT
      claims.id AS qaClaimID,
      question,
      answer,
      DENSE_RANK() OVER(ORDER BY question) AS questionIndex
    FROM
      \`${payload.claimTable}\` AS claims
    LEFT JOIN
      \`${payload.questionAnswerTable}\` AS questionAnswers
    ON
      claims.id = questionAnswers.metadata_claimID
    WHERE
      claims.tournamentID = @eventID
    ),
    QuestionAnswers AS (
    SELECT
      *
    FROM
      QuestionAnswers_Raw PIVOT(MIN(question) AS question,
        MIN(answer) AS answer FOR questionIndex IN (0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20)) ),
    ClaimerUserData AS (
    SELECT
      claims.id AS claimID,
      claimer.username AS username,
      CASE
        WHEN claimer.id IS NOT NULL THEN CONCAT('${manifest.microfrontends.webflow.publicProfile}?uid=', claimer.id)
      ELSE
      NULL
    END
      AS userPublicProfilePage,
      TIMESTAMP_MILLIS(CAST(claims.timestamps_completedAt AS INT64)) AS claimCompletedAt,
      claims.status AS claimStatus,
      claims.type AS claimType,
      claims.referralType AS referralType,
      claims.tournamentName AS eventName,
      claims.lootboxName AS lootboxName,
      CASE
        WHEN claims.lootboxID IS NOT NULL THEN CONCAT('${manifest.microfrontends.webflow.cosmicLootboxPage}?lid=', claims.lootboxID)
      ELSE
      NULL
    END
      AS lootboxRedeemPage,
      COALESCE(MIN(
          CASE
            WHEN claimPrivacy.privacyScope_member = 'DataSharing' THEN COALESCE(claimer.email, "")
          ELSE
          NULL
        END
          ), "CONSENT_REQUIRED") AS claimerEmail,
      COALESCE(MIN(
          CASE
            WHEN claimPrivacy.privacyScope_member = 'DataSharing' THEN COALESCE(claimer.phoneNumber, "")
          ELSE
          NULL
        END
          ), "CONSENT_REQUIRED") AS claimerPhone,
      referrer.username AS referrerUsername,
      CASE
        WHEN claimer.id IS NOT NULL THEN CONCAT('${manifest.microfrontends.webflow.publicProfile}?uid=', claimer.id)
      ELSE
      NULL
    END
      AS referrerPublicProfile
    FROM
      \`${payload.claimTable}\` AS claims
    LEFT JOIN
      \`${payload.userTable}\` AS claimer
    ON
      claims.claimerUserID = claimer.id
    LEFT JOIN
      \`${payload.userTable}\` AS referrer
    ON
      claims.referrerID = referrer.id
    INNER JOIN
      \`${payload.claimPrivacyTable}\` AS claimPrivacy
    ON
      claims.id = claimPrivacy.claimID
    GROUP BY
      claimID,
      username,
      userPublicProfilePage,
      claimCompletedAt,
      claimStatus,
      claimType,
      referralType,
      eventName,
      lootboxName,
      lootboxRedeemPage,
      referrerUsername,
      referrerPublicProfile )
  SELECT
    claimerUser.claimCompletedAt,
    claimerUser.username AS username,
    claimerUser.userPublicProfilePage,
    claimerUser.claimType,
    claimerUser.claimStatus,
    claimerUser.referralType,
    flight.adSetID,
    offer.title AS offerTitle,
    claimerUser.eventName AS event,
    claimerUser.referrerUsername,
    claimerUser.referrerPublicProfile,
    claimerUser.lootboxName,
    claimerUser.lootboxRedeemPage,
    qa.*
  FROM
    QuestionAnswers AS qa
  FULL OUTER JOIN
    ClaimerUserData AS claimerUser
  ON
    qa.qaClaimID = claimerUser.claimID
  LEFT JOIN
    \`${payload.flightTable}\` AS flight
  ON
    flight.claimID = qa.qaClaimID
  LEFT JOIN
    \`${payload.offerTable}\` AS offer
  ON
    flight.offerID = offer.id
  WHERE 
    flight.offerID = @offerID
  ORDER BY
    claimStatus ASC,
    claimCompletedAt DESC
  LIMIT
    10000
  `;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: payload.location,
    params: {
      offerID: payload.queryParams.offerID,
      eventID: payload.queryParams.eventID,
    },
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  return rows.map(convertEventOfferClaimsWithQAByEvent);
};

// export interface OfferClaimWithQARow extends QuestionAndAnswerBaseRow {
//   claimCompletedAt: string;
//   username: string;
//   userPublicProfilePage: string;
//   claimType: string;
//   claimStatus: string;
//   referralType: string;
//   adSetID: string;
//   offerTitle: string;
//   eventName: string;
//   referrerUsername: string;
//   referrerPublicProfile: string;
// }
// export interface OfferQuestionAnswerByEventRequest {
//   queryParams: {
//     offerID: OfferID;
//     eventID: TournamentID;
//   };
//   claimTable: string;
//   questionAnswerTable: string;
//   claimPrivacyTable: string;
//   offerTable: string;
//   flightTable: string;
//   userTable: string;
//   location: string;
// }

// export interface QuestionAndAnswerBaseRow {
//   question_1: string;
//   answer_1: string;
//   question_2: string;
//   answer_2: string;
//   question_3: string;
//   answer_3: string;
//   question_4: string;
//   answer_4: string;
//   question_5: string;
//   answer_5: string;
//   question_6: string;
//   answer_6: string;
//   question_7: string;
//   answer_7: string;
//   question_8: string;
//   answer_8: string;
//   question_9: string;
//   answer_9: string;
//   question_10: string;
//   answer_10: string;
//   question_11: string;
//   answer_11: string;
//   question_12: string;
//   answer_12: string;
//   question_13: string;
//   answer_13: string;
//   question_14: string;
//   answer_14: string;
//   question_15: string;
//   answer_15: string;
//   question_16: string;
//   answer_16: string;
//   question_17: string;
//   answer_17: string;
//   question_18: string;
//   answer_18: string;
//   question_19: string;
//   answer_19: string;
//   question_20: string;
//   answer_20: string;
// }

// const convertOfferClaimsWithQAByEvent = (data: any): OfferClaimWithQARow => {
//   // Convert data into type T and return it
//   return {
//     claimCompletedAt: data?.claimCompletedAt || "",
//     username: data?.username || "",
//     userPublicProfilePage: data?.userPublicProfilePage || "",
//     claimType: data?.claimType || "",
//     claimStatus: data?.claimStatus || "",
//     referralType: data?.referralType || "",
//     adSetID: data?.adSetID || "",
//     offerTitle: data?.offerTitle || "",
//     eventName: data?.eventName || "",
//     referrerUsername: data?.referrerUsername || "",
//     referrerPublicProfile: data?.referrerPublicProfile || "",
//     question_1: data?.question_1 || "",
//     answer_1: data?.answer_1 || "",
//     question_2: data?.question_2 || "",
//     answer_2: data?.answer_2 || "",
//     question_3: data?.question_3 || "",
//     answer_3: data?.answer_3 || "",
//     question_4: data?.question_4 || "",
//     answer_4: data?.answer_4 || "",
//     question_5: data?.question_5 || "",
//     answer_5: data?.answer_5 || "",
//     question_6: data?.question_6 || "",
//     answer_6: data?.answer_6 || "",
//     question_7: data?.question_7 || "",
//     answer_7: data?.answer_7 || "",
//     question_8: data?.question_8 || "",
//     answer_8: data?.answer_8 || "",
//     question_9: data?.question_9 || "",
//     answer_9: data?.answer_9 || "",
//     question_10: data?.question_10 || "",
//     answer_10: data?.answer_10 || "",
//     question_11: data?.question_11 || "",
//     answer_11: data?.answer_11 || "",
//     question_12: data?.question_12 || "",
//     answer_12: data?.answer_12 || "",
//     question_13: data?.question_13 || "",
//     answer_13: data?.answer_13 || "",
//     question_14: data?.question_14 || "",
//     answer_14: data?.answer_14 || "",
//     question_15: data?.question_15 || "",
//     answer_15: data?.answer_15 || "",
//     question_16: data?.question_16 || "",
//     answer_16: data?.answer_16 || "",
//     question_17: data?.question_17 || "",
//     answer_17: data?.answer_17 || "",
//     question_18: data?.question_18 || "",
//     answer_18: data?.answer_18 || "",
//     question_19: data?.question_19 || "",
//     answer_19: data?.answer_19 || "",
//     question_20: data?.question_20 || "",
//     answer_20: data?.answer_20 || "",
//   };
// };

// /**
//  * Returns rows of claims with questions and answers if applicable
//  * Questions and Answers columns are structured with these keys:
//  * question_1, answer_1, question_2, answer_2, etc.
//  *
//  * Right now this query is slightly limited because we are fetching a hardcoded number of 20
//  * questions. TODO: figure out how to get dynamic keys from the SQL query
//  */
// export const getOfferClaimsWithQAByEvent = async (
//   payload: OfferQuestionAnswerByEventRequest
// ): Promise<OfferClaimWithQARow[]> => {
//   console.log("Querying Big Query: Offer Question Answers By Event");

//   /**
//    * Queries the claim table to return claims per day
//    * Use parameterized queries to prevent SQL injection attacks
//    * See https://cloud.google.com/bigquery/docs/parameterized-queries#node.js
//    */
//   const query = `
//   WITH
//     QuestionAnswers_Raw AS (
//     SELECT
//       claims.id AS qaClaimID,
//       question,
//       answer,
//       DENSE_RANK() OVER(ORDER BY question) AS questionIndex
//     FROM
//       \`${payload.claimTable}\` AS claims
//     LEFT JOIN
//       \`${payload.questionAnswerTable}\` AS questionAnswers
//     ON
//       claims.id = questionAnswers.metadata_claimID
//     WHERE
//       claims.tournamentID = @eventID
//     ),
//     QuestionAnswers AS (
//     SELECT
//       *
//     FROM
//       QuestionAnswers_Raw PIVOT(MIN(question) AS question,
//         MIN(answer) AS answer FOR questionIndex IN (0,
//           1,
//           2,
//           3,
//           4,
//           5,
//           6,
//           7,
//           8,
//           9,
//           10,
//           11,
//           12,
//           13,
//           14,
//           15,
//           16,
//           17,
//           18,
//           19,
//           20)) ),
//     ClaimerUserData AS (
//     SELECT
//       claims.id AS claimID,
//       claimer.username AS username,
//       CASE
//         WHEN claimer.id IS NOT NULL THEN CONCAT('${manifest.microfrontends.webflow.publicProfile}?uid=', claimer.id)
//       ELSE
//       NULL
//     END
//       AS userPublicProfilePage,
//       TIMESTAMP_MILLIS(CAST(claims.timestamps_completedAt AS INT64)) AS claimCompletedAt,
//       claims.status AS claimStatus,
//       claims.type AS claimType,
//       claims.referralType AS referralType,
//       claims.tournamentName AS eventName,
//       claims.lootboxName AS lootboxName,
//       CASE
//         WHEN claims.lootboxID IS NOT NULL THEN CONCAT('${manifest.microfrontends.webflow.cosmicLootboxPage}?lid=', claims.lootboxID)
//       ELSE
//       NULL
//     END
//       AS lootboxRedeemPage,
//       COALESCE(MIN(
//           CASE
//             WHEN claimPrivacy.privacyScope_member = 'DataSharing' THEN COALESCE(claimer.email, "")
//           ELSE
//           NULL
//         END
//           ), "CONSENT_REQUIRED") AS claimerEmail,
//       COALESCE(MIN(
//           CASE
//             WHEN claimPrivacy.privacyScope_member = 'DataSharing' THEN COALESCE(claimer.phoneNumber, "")
//           ELSE
//           NULL
//         END
//           ), "CONSENT_REQUIRED") AS claimerPhone,
//       referrer.username AS referrerUsername,
//       CASE
//         WHEN claimer.id IS NOT NULL THEN CONCAT('${manifest.microfrontends.webflow.publicProfile}?uid=', claimer.id)
//       ELSE
//       NULL
//     END
//       AS referrerPublicProfile
//     FROM
//       \`${payload.claimTable}\` AS claims
//     LEFT JOIN
//       \`${payload.userTable}\` AS claimer
//     ON
//       claims.claimerUserID = claimer.id
//     LEFT JOIN
//       \`${payload.userTable}\` AS referrer
//     ON
//       claims.referrerID = referrer.id
//     INNER JOIN
//       \`${payload.claimPrivacyTable}\` AS claimPrivacy
//     ON
//       claims.id = claimPrivacy.claimID
//     GROUP BY
//       claimID,
//       username,
//       userPublicProfilePage,
//       claimCompletedAt,
//       claimStatus,
//       claimType,
//       referralType,
//       eventName,
//       lootboxName,
//       lootboxRedeemPage,
//       referrerUsername,
//       referrerPublicProfile )
//   SELECT
//     claimerUser.claimCompletedAt,
//     claimerUser.username AS username,
//     claimerUser.userPublicProfilePage,
//     claimerUser.claimType,
//     claimerUser.claimStatus,
//     claimerUser.referralType,
//     flight.adSetID,
//     offer.title AS offerTitle,
//     claimerUser.eventName AS event,
//     claimerUser.referrerUsername,
//     claimerUser.referrerPublicProfile,
//     claimerUser.lootboxName,
//     claimerUser.lootboxRedeemPage,
//     qa.*
//   FROM
//     QuestionAnswers AS qa
//   FULL OUTER JOIN
//     ClaimerUserData AS claimerUser
//   ON
//     qa.qaClaimID = claimerUser.claimID
//   LEFT JOIN
//     \`${payload.flightTable}\` AS flight
//   ON
//     flight.claimID = qa.qaClaimID
//   LEFT JOIN
//     \`${payload.offerTable}\` AS offer
//   ON
//     flight.offerID = offer.id
//   WHERE
//     flight.offerID = @offerID
//   ORDER BY
//     claimStatus ASC,
//     claimCompletedAt DESC
//   LIMIT
//     10000
//   `;

//   // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
//   const options = {
//     query: query,
//     // Location must match that of the dataset(s) referenced in the query.
//     location: payload.location,
//     params: {
//       offerID: payload.queryParams.offerID,
//       eventID: payload.queryParams.eventID,
//     },
//   };

//   // Run the query as a job
//   const [job] = await bigquery.createQueryJob(options);

//   // Wait for the query to finish
//   const [rows] = await job.getQueryResults();

//   return rows.map(convertOfferClaimsWithQAByEvent);
// };
