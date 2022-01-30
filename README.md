# @guildfx/cloudfns

GuildFX has the following cloud function environments:

- OpenZeppelin
- Pipedream Step
- Firebase Cloud Function


## OpenZeppelin
Deploy to OpenZeppelin Sentinels & Auto-Tasks.
Update `.env` with pre-made Auto-Tasks via OZ Def UI.
Update all usages of any variables in `functions/src/defender/constants.ts`

```
$ yarn deploy:defender
```

Will:
- Update Auto-task
- Upload Sentinel

## Pipedream Setup
Handles utility infrastructure such as:
- Uploading JSON snippets to GBucket
- Handling message events

## Firebase Cloud Functions