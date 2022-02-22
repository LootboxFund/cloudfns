echo "Deploying tasks to OZ Defender..."
yarn build

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

NODE_ENV=production node ../lib/tasks/onCreateLootbox/build.js 