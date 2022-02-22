# @lootboxfund/cloudfns

Lootbox has the following cloud function environments:

- OpenZeppelin AutoTask
- Pipedream Workflows

To properly deploy this, following these steps:

1. Create an OZ account & Pipedream account
2. Upload the pipedream sources & actions (you may need to login from cli). Then login to Pipedream and get the webhook urls for all the sources. Add them to `@lootboxfund/manifest` & `yarn build && npm publish`
3. Create an OZ Autotask with default settings so we can get the ID. Copy & paste the OZ Autotask ID to `@lootboxfund/manifest`. Also import the Contract into OZ and save the contract address to manifest. Then upload the OZ Defender sentinels & autotasks. Note that uploading an autotask requires you build & export the manifest.json from `@lootboxfund/manifest` and copy it over to the autotask folder (because OZ has limitations)

### Note:
Pipedream is not compatible with private NPM libraries, so as a terrible workaround, we make our `@lootboxfund/helpers` and `@lootboxfund/manifest` repos public while deploying.
