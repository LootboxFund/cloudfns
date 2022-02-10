# @guildfx/oz-defender

[How to deploy to OpenZeppelin Defender](https://share.vidyard.com/watch/dJxfarjsFX1naw2qpfHozV)

1. ```
   $ cp .env.example > .env
   ```

2. Create 2 auto tasks in OZ Defender

   - Name: "Guild Created", triger: "webhook"
   - Name: "CrowdSale Created", triger: "webhook"

3. Copy the autotask ID and paste it into the `defender/(sentinels|tasks)/**/constants.ts`. Same with other fields.

4. ```
   yarn deploy:tasks
   ```

5. ```
   yarn deploy:sentinels
   ```
