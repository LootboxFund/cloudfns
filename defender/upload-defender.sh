echo "Deploying OZ Defender..."
yarn build
# NODE_ENV=production node ./lib/onCreateGuild/build.js 
# NODE_ENV=production node ./lib/onCreateCrowdSale/build.js 
NODE_ENV=production node ./lib/template/build.js 