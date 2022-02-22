echo "Deploying sentinels to OZ Defender..."
yarn build

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

NODE_ENV=production node ../lib/sentinels/onCreateLootbox/build.js