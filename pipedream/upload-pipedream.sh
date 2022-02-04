echo "Deploying Pipedream..."
tsc
NODE_ENV=production pd publish ./lib/actions/gbucketIndexJSON.js
NODE_ENV=production pd publish ./lib/actions/gbucketUploadCrowdSaleTXT.js
NODE_ENV=production pd publish ./lib/actions/gbucketUploadGuildTXT.js
NODE_ENV=production pd publish ./lib/actions/gbucketUploadJSON.js
NODE_ENV=production pd publish ./lib/actions/defineEventABIs/index.js
NODE_ENV=production pd publish ./lib/actions/onGuildCreated/index.js
NODE_ENV=production pd publish ./lib/actions/onCrowdSaleCreated/index.js
NODE_ENV=production pd publish ./lib/actions/parseEvmLogs/index.js
NODE_ENV=production pd publish ./lib/actions/template/index.js
