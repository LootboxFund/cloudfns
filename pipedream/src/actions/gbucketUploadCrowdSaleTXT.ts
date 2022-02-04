export default {
  name: "GBucket - Upload CrowdSale TXT to Route",
  description: "Uploads a TXT file about a CrowdSale to a GBucket route",
  key: "gbucket_uploadCrowdSaleTxtRoute",
  version: "1.0.3",
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
     * 
 const crowdSaleData = {
    crowdSaleAddress: CrowdSaleFactory.sol|event:CrowdSaleCreated.crowdSaleAddress|string,
    guildToken: CrowdSaleFactory.sol|event:CrowdSaleCreated.guildToken|string,
    guildDao: CrowdSaleFactory.sol|event:CrowdSaleCreated.guildDao|string,
  };
  await axios.post("https://_________.m.pipedream.net", {
    semvar: "0.0.1-sandbox",
    chainIdHex: "0x61",
    prefix: "crowdsales",
    bucket: "guildfx-exchange.appspot.com"
    data: crowdSaleData,
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
    const filePath = `v/${semvar}/${chainIdHex}/${prefix}/${data.guildDao}.txt`;
    console.log(
      `⏳ Uploading ${
        data.symbol
      } CrowdSale InfoText File to Cloud Storage Bucket as https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
        filePath
      )}?alt=media \n`
    );
    const note = `
       Get ready to fundraise!
       Your Guild Crowdsale has been created. Add its address below to your OpenZeppelin Defender:
       
       CrowdSale: ${
         data.crowdSaleAddress
       } (import this contract address to OZ Defender)
       Guild Token: ${data.guildToken} (whats for sale)
       DAO Address: ${data.guildDao} (make sure this is controlled by you)

       Timestamp: ${new Date().toISOString()}
    `;
    console.log(note);
    await storage.bucket(bucket).file(filePath).save(note);
    await storage.bucket(bucket).file(filePath).makePublic();
    console.log(`✅ Uploaded \n`);
  },
};
