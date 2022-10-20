## Docs
## https://cloud.google.com/storage/docs/configuring-cors#viewing-cors-bucket

## Authenticate
# firebase login --reauth

## View bucket cors
# gsutil cors get gs://lootbox-fund-prod.appspot.com

## Set bucket cors
gsutil cors set ./bucket-cors.json gs://lootbox-fund-prod.appspot.com