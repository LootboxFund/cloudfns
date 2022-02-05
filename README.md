# @guildfx/cloudfns

GuildFX has the following cloud function environments:

- OpenZeppelin AutoTask
- Pipedream Workflows

To properly deploy this, following these steps:

1. `$ cd pipedream && yarn deploy:pipedream && cd ..`
2. Check Pipedream and create a pipe using one of the sources. Copy the webhook url to its corresponding OZ autotask. 
3. Visit OpenZeppelin and manually create 2 autotasks. Copy the autotask ID and paste it into the `defender/(sentinels|tasks)/**/constants.ts`. Same with other fields.
4. `$ cd defender && yarn deploy:defender && cd ..`
5. Test creating a guild token and check if the sentinel & autotask catches the event. Visit the GBucket route for the txt file.
6. Continue testing with crowdsale factory. You'll need your guild token address which is in the txt file.