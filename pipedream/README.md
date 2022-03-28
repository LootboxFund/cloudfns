# @guildfx/pipedream

[How to deploy Pipedream](https://share.vidyard.com/watch/173UWaLR7pNmHdRhPVUx9h)

1. Authenticate with gcloud CLI for local deployment

   ```
   $ NO ENVIRONMENT FILES cp .env.example > .env
   // Instead,
   $ gcloud auth application-default login
   ```

2. ```
   $ curl https://cli.pipedream.com/install | sudo sh  # install pipedream CLI if needed
   ```

3. ```
    $ yarn deploy:sources:abi

    $ yarn deploy:sources:onCreateGuildToken

    $ yarn deploy:sources:onCreateCrowdSale

   ```

4. Add pipedream webhook urls of above created sources to `../defender/tasks/handle*/constants.ts` AND `@guildfx/v1-contracts/scripts/helpers/uploadABIs.ts`

5. Deploy pipedream actions

   ```
   $ yarn deploy:actions
   ```

6. ```
   cd @guildfx/v1-contracts && npm run abi:publish
   ```

7. Via Pipedream ui make a workflow for the upload ABI

   1. For a trigger, select `use one of your existing sources`

   2. Choose the upload ABI source you created previously

   3. For the test trigger, select the `steps.trigger.event` path

8. Via Pipedream ui make a workflow for the onGuildTokenCreated

   1. For a trigger, select `use one of your existing sources` > `onCreateGuildToken`

   2. Add a step for `my actions` > `defineEventABIs`

   3. Add a step for `my actions` > `onGuildCreated`

9. Via Pipedream ui make a workflow for the onCrowdSaleCreated

   1. For a trigger, select `use one of your existing sources` > `onCrowdSaleCreated`

   2. Add a step for `my actions` > `defineEventABIs`

   3. Add a step for `my actions` > `onCrowdSaleCreated`

10. Deploy factory contracts (deploy script)

11. Deploy OZ sentinels (see [README](../defender/README.md))

```

```
