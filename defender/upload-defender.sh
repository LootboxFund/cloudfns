echo "Deploying OZ Defender..."
yarn build

# ------ ACTIVE ------ #
NODE_ENV=production node ./lib/autotasks/onCreateLootboxEscrow/build.js 
NODE_ENV=production node ./lib/autotasks/onCreateLootboxInstant/build.js 
NODE_ENV=production node ./lib/sentinels/onCreateLootboxEscrow/build.js
NODE_ENV=production node ./lib/sentinels/onCreateLootboxInstant/build.js
