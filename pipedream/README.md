# @guildfx/pipedream

[How to deploy Pipedream](https://share.vidyard.com/watch/173UWaLR7pNmHdRhPVUx9h)

1. ```
   $ cp .env.example > .env
   ```

2. ```
   $ curl https://cli.pipedream.com/install | sude sh  # install pipedream CLI if needed
   ```

3. ```
   $ curl https://cli.pipedream.com/install | sude sh # install pipedream CLI if needed
   ```

4. ```
    $ yarn deploy:abi

    $ yarn deploy:sources:onCreateGuildToken

    $ yarn deploy:sources:onCreateCrowdSale

   ```

5. Add pipedream webhook urls of above created sources to `../defender/tasks/handle*/constants.ts` AND `@guildfx/v1-contracts/scripts/helpers/uploadABIs.ts`

6. ```
   cd @guildfx/v1-contracts && npm run abi:publish
   ```

7. Via Pipedream ui make a workflow for the upload ABI

   1. For a trigger, select `use one of your existing sources`

   2. Choose the upload ABI source you created previously

   3. For the test trigger, select the `steps.trigger.event` path
