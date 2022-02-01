export default {
  name: "GBucket - Upload JSON to Route",
  description: "Uploads a JSON file to a GBucket route",
  key: "gbucket_uploadJsonToRoute",
  version: "1.0.12",
  type: "action",
  props: {
    googleCloud: {
      type: "app",
      app: "google_cloud",
    },
    webhookTrigger: {
      type: "object",
    },
  },
  async run() {
    /**
 const tokenData: TokenData = {
    address: tokenFrag.address,
    chainIdHex: chainIdHex,
    chainIdDecimal: parseInt(chainIdHex, 16).toString(),
    decimals: tokenMold.decimals,
    logoURI: tokenMold.logoURI,
    name: tokenMold.name,
    priceOracle: tokenMold.priceOracle,
    symbol: tokenMold.symbol,
  };
  await axios.post("https://89f633ef6cb67740697f3c0885695a46.m.pipedream.net", {
    semvar: "0.0.1-sandbox",
    chainIdHex: "0x61",
    prefix: "tokens",
    bucket: "guildfx-exchange.appspot.com"
    data: tokenData,
  });
 */

    // Required workaround to get the @google-cloud/storage package
    // working correctly on Pipedream
    require("@dylburger/umask")();

    const { Storage } = require("@google-cloud/storage");

    const key = JSON.parse((this as any).googleCloud.$auth.key_json);

    const encodeURISafe = (stringFragment: string) =>
      encodeURIComponent(stringFragment)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");

    // Creates a client from a Google service account key.
    // See https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/global#ClientConfig
    const storage = new Storage({
      projectId: key.project_id,
      credentials: {
        client_email: key.client_email,
        private_key: key.private_key,
      },
    });

    // prefix = 'tokens' | 'crowdsales'
    const { data, semvar, chainIdHex, prefix, bucket } = (this as any)
      .webhookTrigger.object;
    const filePath = `v/${semvar}/${chainIdHex}/${prefix}/${data.address}.json`;
    console.log(
      `⏳ Uploading ${
        data.symbol
      } to Cloud Storage Bucket as https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
        filePath
      )}?alt=media \n`
    );
    await storage.bucket(bucket).file(filePath).save(JSON.stringify(data));
    await storage.bucket(bucket).file(filePath).makePublic();
    console.log(`✅ Uploaded \n`);
  },
};
