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
