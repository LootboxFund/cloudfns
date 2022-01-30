echo "Deploying OZ Defender..."
yarn build
NODE_ENV=production node ./lib/defender/onCreateGuild/build.js 