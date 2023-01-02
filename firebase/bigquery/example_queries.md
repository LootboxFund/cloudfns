# Example SQL Queries

## Basic statistics

### Get all completed claims for a tournament

```sql
SELECT count(\*) as completedClaimCount FROM `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` WHERE tournamentId = 'AIAHWvJhavPDQP2WqAt1' and status = 'complete'
```

### Get all claim count for a tournament

```sql
SELECT count(\*) as totalClaimCount FROM `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` WHERE tournamentId = 'AIAHWvJhavPDQP2WqAt1'
```

### how many 2nd order claims have been made (AKA viral claims)

```sql
SELECT count(\*) as completedClaimCount FROM `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` WHERE tournamentId = 'AIAHWvJhavPDQP2WqAt1' and status = 'complete' and type = 'reward'
```

### how many completed participation rewards

```sql
SELECT count(\*) as participationRewardCount FROM `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` WHERE tournamentId = 'AIAHWvJhavPDQP2WqAt1' and status = 'complete' and type = 'one_time'
```

### Compact query to get 1) All claim count & 2) Completed claim count

```sql
with all_claims as (
  select status, type
    from `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` LIMIT 1000
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
select (select count(*) from all_claims)  as totalClaimCount,
(select count(*) from completed_claims) as completedClaimCount,
(select count(*) from viral_claims) as viralClaimCount,
(select count(*) from reward_claims) as bonusRewardClaimCount,
(select count(*) from one_time_claims) as oneTimeClaimCount
```

### Gets counts of completed claims for each lootbox

```sql
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
    `lootbox-fund-staging.firestore_export.lootbox_schema_lootbox_schema_latest` AS lootbox
  LEFT OUTER JOIN
    `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` AS claim
  ON
    lootbox.id = claim.lootboxID
  WHERE
    claim.status = 'complete' )
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
```

### For the Lootbox Daily Distribution Graph

```sql
SELECT
  DATE(TIMESTAMP_SECONDS(CAST(claim.timestamps_completedAt / 1000 AS INT64))) as completedDate,
  COUNT(CASE claim.status WHEN 'complete' THEN 1 ELSE null END) as claimCount
FROM `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` as claim
  where
    DATE(TIMESTAMP_SECONDS(CAST(timestamps_completedAt / 1000 AS INT64)))
      between '2022-01-01' and '2022-10-09'
  GROUP BY completedDate
  ORDER BY completedDate ASC
limit 100
```

### Gets date range of claims per day

```sql
WITH
  DateTable AS (
  SELECT
    dateValue
  FROM
    UNNEST( GENERATE_DATE_ARRAY(DATE('2015-06-01'), DATE('2022-10-09'), INTERVAL 1 DAY) ) AS dateValue ),
  CompletedClaims AS (
  SELECT
    *,
    DATE(TIMESTAMP_SECONDS(CAST(timestamps_completedAt / 1000 AS INT64))) AS completedDate
  FROM
    DateTable
  LEFT OUTER JOIN
    `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest`
  ON
    DATE(TIMESTAMP_SECONDS(CAST(timestamps_completedAt / 1000 AS INT64))) = dateValue )
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
        DATE '2015-06-01'))) - EXTRACT(WEEK
  FROM
    DATE '2015-06-01') + 1 AS weekNormalized,
  COUNT(
    CASE status
      WHEN 'complete' THEN 1
    ELSE
    NULL
  END
    ) AS claimCountbig
FROM
  CompletedClaims
WHERE
  dateValue BETWEEN '2015-06-01'
  AND '2022-10-09'
GROUP BY
  dateValue
LIMIT
  1000;
```

### Query Used for Shins Case Study

```sql
 WITH
   TournamentIDs AS (
   SELECT
     DISTINCT keyTournamentID
   FROM
     UNNEST(["1qKLXgaRXviPP110", "1qKLXgaRXviPP110ZHLe", "1qKLXgaRXviPP110ZHLe", "C3msweDHfYCesJ2SWxeC"]) AS keyTournamentID )
 SELECT
   -- keyTournamentID
   COUNT(DISTINCT(Claims.claimerUserId)) AS total_users,
   COUNT(DISTINCT(Users.email)) AS users_with_email,
   COUNT(DISTINCT(Users.phoneNumber)) AS users_with_phone,
   ROUND( SAFE_DIVIDE(100* COUNT(CASE
             WHEN Claims.status = 'complete' AND NOT Claims.type = 'reward' THEN 1
           ELSE
           NULL
         END
           ), COUNT(CASE
             WHEN NOT Claims.type = 'reward' THEN 1
           ELSE
           NULL
         END
           )) ) AS completionRate,
   SUM(CASE WHEN Claims.status != 'reward' THEN 1 ELSE 0 END) AS impressions,
   SUM(CASE WHEN Claims.status = 'pending' THEN 1 ELSE 0 END) AS pendingClaims,
   SUM(CASE WHEN Claims.status = 'complete' THEN 1 ELSE 0 END) AS completeClaims,
   -- SUM(CASE WHEN Users.email IS NOT NULL THEN 1 ELSE 0 END) AS users_with_email,
   -- SUM(CASE WHEN Users.phoneNumber IS NOT NULL THEN 1 ELSE 0 END) AS users_with_phone_number
 FROM
   TournamentIDs
 LEFT JOIN `lootbox-fund-prod.firestore_export.claim_schema_claim_schema_latest` as Claims
 ON Claims.tournamentId = keyTournamentID
 LEFT JOIN `lootbox-fund-prod.firestore_export.user_schema_user_schema_latest` as Users
 ON Users.id = Claims.claimerUserId
 limit 100000
```

### Query for analytics on tournament

```sql
WITH DataTable AS (
  SELECT
    claim.status AS claimStatus,
    claim.claimerUserId AS claimerUserID,
    claim.referralType AS claimReferralType,
    claim.type AS claimType,
    claim.lootboxId AS claimLootboxID
  FROM `lootbox-fund-prod.firestore_export.claim_schema_claim_schema_latest` as claim
  LEFT JOIN `lootbox-fund-prod.firestore_export.user_schema_user_schema_latest` as user
  ON claim.claimerUserId = user.id
  WHERE claim.tournamentId = 'CC2kzXEKGYC8Cq5IExTm'
), LootboxTable AS (
  SELECT lootbox.id AS lootboxID,
    lootbox.maxTickets AS lootboxMaxTickets
    FROM `lootbox-fund-prod.firestore_export.lootbox_tournament_snapshot_schema_lootbox_snapshot_schema_latest` as snapshot
    INNER JOIN `lootbox-fund-prod.firestore_export.lootbox_schema_lootbox_schema_latest` as lootbox
    on lootbox.id = snapshot.lootboxId
)
SELECT
  COUNT(*) AS totalClaimCount,
  SUM(CASE WHEN claimStatus = 'complete' THEN 1 ELSE 0 END) AS completedClaimCount,
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
  -- (
  --   SELECT SUM(lootboxMaxTickets), lootboxID
  --   FROM DataTable
  --   GROUP BY lootboxID
  -- ) as totalMaxTickets,
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
      SUM(lootboxMaxTickets) FROM LootboxTable WHERE LootboxTable.lootboxID IN (SELECT DataTable.claimLootboxID from DataTable)
    )  as totalMaxTickets
FROM DataTable;

```

### Fetch offer analytics query

```
SELECT
  adEvents.activationID,
  adEvents.action,
  adEvents.activationEventMmpAlias,
  flights.placement,
  count(*) as countAdEvents
FROM
  `lootbox-fund-staging.firestore_export.ad_event_schema_ad_event_schema_latest` AS adEvents
INNER JOIN
  `lootbox-fund-staging.firestore_export.flight_schema_flight_schema_latest` AS flights
ON
  adEvents.flightID = flights.id
WHERE
  flights.tournamentID = 'V35LBriqUUbS6l67bPw6'
  AND flights.offerID = 'dbSpACWMb2AW5OZ9xsjI'
GROUP BY
  action,
  activationEventMmpAlias,
  placement,
  activationID
LIMIT
  1000
```

### WIP queries for analytics CSV

```

// SELECT
//   claimer.username AS claimerUsername,
//   claims.status as claimStatus,
//   CONCAT("https://REPLACE_ME.com", claimer.id) AS userPublicProfilePage,
//   claims.type as claimType,
//   claims.referralType as referralType,
//   TIMESTAMP_MILLIS(CAST(claims.timestamps_completedAt AS INT64)) AS completedAt,
//   flight.id AS flightID,
//   flight.offerID AS offerID,
//   flight.adSetID AS adSetID,
//   claims.tournamentName AS tournamentName
// FROM
//   `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` AS claims
// LEFT JOIN
//   `lootbox-fund-staging.firestore_export.flight_schema_flight_schema_latest` AS flight
// ON
//   claims.id = flight.claimID
// LEFT JOIN
//   `lootbox-fund-staging.firestore_export.user_schema_user_schema_latest` AS claimer
// ON
//   claimer.id = claims.claimerUserID
// -- INNER JOIN
// --   `lootbox-fund-staging.firestore_export.claim_schema_claim_privacy_scope_schema_latest` AS claimsPrivacy
// -- ON
// --   claimsPrivacy.claimID = claims.id
// WHERE
//   claims.tournamentId = 'AVkMS8PZAJ6uiTgVp1wP'
// ORDER BY
//   CASE WHEN claims.status = 'complete' THEN 0 ELSE 1 END
//   ASC,
//   claims.status,claimerUsername
// LIMIT
//   10000

// SELECT
//   claimer.username AS claimerUsername,
//   claims.status as claimStatus,
//   CONCAT("https://REPLACE_ME.com", claimer.id) AS userPublicProfilePage,
//   claims.type as claimType,
//   claims.referralType as referralType,
//   TIMESTAMP_MILLIS(CAST(claims.timestamps_completedAt AS INT64)) AS completedAt,
//   flight.id AS flightID,
//   flight.offerID AS offerID,
//   flight.adSetID AS adSetID,
//   claims.tournamentName AS tournamentName
// FROM
//   `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` AS claims
// LEFT JOIN
//   `lootbox-fund-staging.firestore_export.flight_schema_flight_schema_latest` AS flight
// ON
//   claims.id = flight.claimID
// LEFT JOIN
//   `lootbox-fund-staging.firestore_export.user_schema_user_schema_latest` AS claimer
// ON
//   claimer.id = claims.claimerUserID
// -- INNER JOIN
// --   `lootbox-fund-staging.firestore_export.claim_schema_claim_privacy_scope_schema_latest` AS claimsPrivacy
// -- ON
// --   claimsPrivacy.claimID = claims.id
// WHERE
//   claims.tournamentId = 'AVkMS8PZAJ6uiTgVp1wP'
// ORDER BY
//   CASE WHEN claims.status = 'complete' THEN 0 ELSE 1 END
//   ASC,
//   claims.status,claimerUsername
// LIMIT
//   10000


```

CREATE TEMP FUNCTION clean*column_name(column_name STRING) AS (
TRIM(REGEXP_REPLACE(column_name, '[^a-zA-Z0-9*]', '_'), '_')
);

WITH Data AS (
SELECT
claims.id AS claimID,
question,
answer
FROM
`lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` AS claims
LEFT JOIN
`lootbox-fund-staging.firestore_export.question-answer_schema_question_answer_schema_latest` AS questionAnswers
ON claims.id = questionAnswers.metadata_claimID
)
SELECT \* FROM Data
PIVOT(MAX(answer) FOR clean_column_name(question) IN ('Do_you_agree_to_eat_our_jellyfish'))
where Do_you_agree_to_eat_our_jellyfish is not null
-- WHERE questionAnswers.answer is not null
LIMIT 100

```


```

CREATE TEMP FUNCTION
clean*column_name(column_name STRING) AS ( TRIM(REGEXP_REPLACE(column_name, '[^a-za-z0-9*]', '\*'), '\*') );

WITH DATA AS (
SELECT
claims.id AS claimID,
question,
answer,
-- ROW_NUMBER() OVER(PARTITION BY question ORDER BY question) AS index
DENSE_RANK() OVER(ORDER BY question) AS questionIndex
FROM
`lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` AS claims
LEFT JOIN
`lootbox-fund-staging.firestore_export.question-answer_schema_question_answer_schema_latest` AS questionAnswers
ON
claims.id = questionAnswers.metadata_claimID
WHERE questionAnswers.answer is not NULL
)
SELECT

- FROM
  DATA
  PIVOT(MIN(question) as question, MIN(answer) as answer FOR questionIndex IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,18,19, 20, 21, 22, 23, 24, 25,26,27,28,29,30,31,32,33,34,35,35,36,37,38,39,40))
  LIMIT
  1000

-- Do you agree to eat our jellyfish?
-- true

-- select \* from `lootbox-fund-staging.firestore_export.question-answer_schema_question_answer_schema_latest` AS questionAnswers where question is not null and answer is not null

````

```sql
WITH
  QuestionAnswers_Raw AS (
  SELECT
    claims.id AS qaClaimID,
    question,
    answer,
    DENSE_RANK() OVER(ORDER BY question) AS questionIndex
  FROM
    `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` AS claims
  LEFT JOIN
    `lootbox-fund-staging.firestore_export.question-answer_schema_question_answer_schema_latest` AS questionAnswers
  ON
    claims.id = questionAnswers.metadata_claimID
  WHERE
    questionAnswers.answer IS NOT NULL ),
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
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        35,
        36,
        37,
        38,
        39,
        40)) ),
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
      WHEN claims.lootboxID IS NOT NULL THEN CONCAT('${manifest.microfrontends.webflow.lootbox}?lid=', claims.lootboxID)
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
    `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest` AS claims
  LEFT JOIN
    `lootbox-fund-staging.firestore_export.user_schema_user_schema_latest` AS claimer
  ON
    claims.claimerUserID = claimer.id
  LEFT JOIN
    `lootbox-fund-staging.firestore_export.user_schema_user_schema_latest` AS referrer
  ON
    claims.referrerID = referrer.id
  INNER JOIN
    `lootbox-fund-staging.firestore_export.claim_schema_claim_privacy_scope_schema_latest` AS claimPrivacy
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
  qa.*
FROM
  QuestionAnswers AS qa
FULL OUTER JOIN
  ClaimerUserData AS claimerUser
ON
  qa.qaClaimID = claimerUser.claimID
LEFT JOIN
  `lootbox-fund-staging.firestore_export.flight_schema_flight_schema_latest` AS flight
ON
  flight.claimID = qa.qaClaimID
LEFT JOIN
  `lootbox-fund-staging.firestore_export.offer_schema_offer_schema_latest` AS offer
ON
  flight.offerID = offer.id
ORDER BY
  claimStatus ASC,
  claimCompletedAt DESC
LIMIT
  1000
````
