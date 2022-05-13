#!/bin/bash
echo "Deploying actions to Pipedream..."
tsc

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

# NODE_ENV=production pd publish ../lib/actions/onUploadABI/index.js
# NODE_ENV=production pd publish ../lib/actions/onCreateLootboxInstant/index.js
# NODE_ENV=production pd publish ../lib/actions/onCreateLootboxEscrow/index.js

NODE_ENV=production pd publish ../lib/actions/onMintBadgeBCS/index.js
