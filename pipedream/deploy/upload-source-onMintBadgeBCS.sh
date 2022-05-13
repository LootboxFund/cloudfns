#!/bin/bash
echo "Deploying onMintBadgeBCS to Pipedream..."
tsc

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

NODE_ENV=production pd deploy ../lib/sources/onMintBadgeBCS/index.js