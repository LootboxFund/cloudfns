echo "Deploying OZ Defender..."
yarn build

NODE_ENV=production node ./lib/tasks/handleGuildCreatedEvent/build.js 
NODE_ENV=production node ./lib/tasks/handleCrowdSaleCreatedEvent/build.js 

NODE_ENV=production node ./lib/sentinels/watchGuildFactory/build.js
NODE_ENV=production node ./lib/sentinels/watchCrowdSaleFactory/build.js