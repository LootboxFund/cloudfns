echo "Deploying Pipedream..."
tsc

# ------ ACTIVE ------ #
NODE_ENV=production pd publish ./lib/actions/onLootboxCreated/index.js
# NODE_ENV=production pd deploy ./lib/sources/onLootboxURI/index.js


# ------ DEPRECATED ------ #
# NODE_ENV=production pd publish ./lib/actions/defineEventABIs/index.js
# NODE_ENV=production pd publish ./lib/actions/onGuildCreated/index.js
# NODE_ENV=production pd publish ./lib/actions/onCrowdSaleCreated/index.js
# NODE_ENV=production pd publish ./lib/actions/onUploadABI/index.js

# NODE_ENV=production pd deploy ./lib/sources/onCreateGuildToken/index.js
# NODE_ENV=production pd deploy ./lib/sources/onCreateCrowdSale/index.js
# NODE_ENV=production pd deploy ./lib/sources/onUploadABI/index.js

