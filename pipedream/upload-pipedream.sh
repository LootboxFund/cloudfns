echo "Deploying Pipedream..."
yarn build
NODE_ENV=production pd publish ./lib/actions/gbucketUploadJSON.js
NODE_ENV=production pd publish ./lib/actions/gbucketIndexJSON.js