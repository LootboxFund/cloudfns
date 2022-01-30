//pipedream.com/@0xterran/save-to-gbucket-p_vQCDWZp/edit?e=24QxwKavrB4umdCzjeBc7BDP36c

// Required workaround to get the @google-cloud/storage package
// working correctly on Pipedream
https: require("@dylburger/umask")();

console.log(`----- EVENTS `);
console.log(event);

const { Storage } = require("@google-cloud/storage");

const key = JSON.parse(auths.google_cloud.key_json);

const encodeURISafe = (stringFragment) =>
  encodeURIComponent(stringFragment).replace(/'/g, "%27").replace(/"/g, "%22");

// Creates a client from a Google service account key.
// See https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/global#ClientConfig
const storage = new Storage({
  projectId: key.project_id,
  credentials: {
    client_email: key.client_email,
    private_key: key.private_key,
  },
});

// Uncomment this section and rename for your bucket before running this code
// const bucketName = 'pipedream-test-bucket';

/**
 * event.body = {
   "semvar": "0.0.1-sandbox",    
   "chainIdHex": "0x61",                   
   "prefix": "tokens" | "crowdsales",
   "data": IToken | ICrowdSale
  }
 * // 0x61 bsctest, 0x38 bscmain                   
 * interface IToken {
      "address": "0x________",
      "chainIdHex": "0x61",
      "chainIdDecimal": "97",
      "decimals": 18,
      "logoURI": "https://wtwp.com/wp-content/uploads/2015/06/placeholder-image.png",
      "name": "Hello World",
      "priceOracle": "0x________",
      "symbol": "SUP"
    }
 */

const BUCKET_NAME = "guildfx-exchange.appspot.com";

// prefix = 'tokens' | 'crowdsales'
const { data, semvar, chainIdHex, prefix } = event.body;
const filePath = `v/${semvar}/${chainIdHex}/${prefix}/${data.address}.json`;
console.log(
  `⏳ Uploading ${
    data.symbol
  } to Cloud Storage Bucket as https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURISafe(
    filePath
  )}?alt=media \n`
);
await storage.bucket(BUCKET_NAME).file(filePath).save(JSON.stringify(data));
await storage.bucket(BUCKET_NAME).file(filePath).makePublic();
console.log(`✅ Uploaded \n`);
