echo "Deploying OZ Defender..."
yarn build

# ------ ACTIVE ------ #
NODE_ENV=production node ./lib/tasks/handleLootboxCreatedEvent/build.js 
NODE_ENV=production node ./lib/sentinels/watchLootboxFactory/build.js

# ------ DEPRECATED ------ #
# NODE_ENV=production node ./lib/tasks/handleGuildCreatedEvent/build.js 
# NODE_ENV=production node ./lib/tasks/handleCrowdSaleCreatedEvent/build.js 

# NODE_ENV=production node ./lib/sentinels/watchGuildFactory/build.js
# NODE_ENV=production node ./lib/sentinels/watchCrowdSaleFactory/build.js