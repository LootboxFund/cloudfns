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

<!-- WITH
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
  1000; -->

<!--
WITH
  DateTable AS (
  SELECT
    dateValue
  FROM
    UNNEST( GENERATE_DATE_ARRAY(DATE('2020-06-01'), DATE('2022-10-09'), INTERVAL 1 DAY) ) AS dateValue ),
  TournamentClaimTable AS (
    SELECT
      *
    FROM `lootbox-fund-staging.firestore_export.claim_schema_claim_schema_latest`
    WHERE tournamentId = "VqoSbP4bWWNyBOWWgWKP"
  ),
  CompletedClaims AS (
  SELECT
    dateValue,
    status as claimStatus,
    tournamentId,
    DATE(TIMESTAMP_SECONDS(CAST(timestamps_completedAt / 1000 AS INT64))) AS completedDate
  FROM
    DateTable
  LEFT OUTER JOIN
    TournamentClaimTable
  ON
    DATE(TIMESTAMP_SECONDS(CAST(timestamps_completedAt / 1000 AS INT64))) = dateValue)
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
        DATE '2020-06-01'))) - EXTRACT(WEEK
  FROM
    DATE '2020-06-01') + 1 AS weekNormalized,
  COUNT(
    CASE claimStatus
      WHEN 'complete' THEN 1
    ELSE
    NULL
  END
    ) AS claimCountbig
FROM
  CompletedClaims
WHERE
  dateValue BETWEEN '2020-06-01'
  AND '2022-10-09'
  AND tournamentId is not null
GROUP BY
  dateValue
LIMIT
  1000;


 -->
