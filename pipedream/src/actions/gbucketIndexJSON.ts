export default {
  name: "GBucket - Index JSON on Route",
  description: "Indexes a GBucket route with its known addresses",
  key: "gbucket_IndexJsonToRoute",
  version: "1.0.2",
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
  await axios.post("https://25a6aaa1c164a3160906727a7b1ed065.m.pipedream.net", {
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

    const { semvar, chainIdHex, prefix, bucket } = (this as any).webhookTrigger
      .object;
    const filePath = `v/${semvar}/${chainIdHex}/${prefix}/index.json`;
    const routePath = `v/${semvar}/${chainIdHex}/${prefix}/`;

    // reindex
    const options = {
      prefix: routePath,
      delimiter: "/",
    };

    // Lists files in the bucket, filtered by a prefix
    const result = await storage.bucket(bucket).getFiles(options);
    const routes: any[] = [];
    result[0]
      .filter(
        (f: any) =>
          f.name.indexOf("index.json") === -1 &&
          f.name.indexOf("defaults.json") === -1
      )
      .forEach((file: any) => {
        console.log(file.name);
        routes.push(file.name);
      });
    console.log(
      `⏳ Uploading index to Cloud Storage Bucket as https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
        filePath
      )}?alt=media \n`
    );
    await storage.bucket(bucket).file(filePath).save(JSON.stringify(routes));
    await storage.bucket(bucket).file(filePath).makePublic();
    console.log(`✅ Uploaded \n`);
  },
};
