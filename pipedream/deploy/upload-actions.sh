#!/bin/bash
echo "Deploying actions to Pipedream..."
tsc

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

NODE_ENV=production pd publish ../lib/actions/defineEventABIs/index.js
NODE_ENV=production pd publish ../lib/actions/onUploadABI/index.js
NODE_ENV=production pd publish ../lib/actions/onCreateLootbox/index.js

