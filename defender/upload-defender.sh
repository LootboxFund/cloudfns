echo "Deploying OZ Defender..."
yarn build

# ------ ACTIVE ------ #
NODE_ENV=production node ./lib/autotasks/onCreateLootbox/build.js 
# NODE_ENV=production node ./lib/sentinels/onCreateLootbox/build.js
