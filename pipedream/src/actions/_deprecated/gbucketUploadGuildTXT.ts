export default {
  name: "GBucket - Upload Guild TXT to Route",
  description: "Uploads a TXT file about a Guild to a GBucket route",
  key: "gbucket_uploadGuildTxtRoute",
  version: "1.0.0",
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
 const guildData = {
    guildToken: GuildFactory.sol|event:GuildCreated.guildToken|string,
    guildName: GuildFactory.sol|event:GuildCreated.guildName|string,
    guildSymbol: GuildFactory.sol|event:GuildCreated.guildSymbol|string,
    guildDao: GuildFactory.sol|event:GuildCreated.guildDao|address,
  };
  await axios.post("https://_________.m.pipedream.net", {
    semvar: "0.0.1-sandbox",
    chainIdHex: "0x61",
    prefix: "guilds",
    bucket: "guildfx-exchange.appspot.com"
    data: guildData,
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

    /**
     * /tokens/*.json = JSON data for FE Widgets
     * /crowdsales/*.json = JSON data for crowdsales FE Widgets
     * /guilds/*.txt = TEXT data for guilds OZ Defender
     * /crowdsales/*.txt = TEXT data for crowdsales OZ Defender
     */
    // prefix = 'tokens' | 'crowdsales' | 'guilds' | 'crowdsales'
    const { data, semvar, chainIdHex, prefix, bucket } = (this as any)
      .webhookTrigger.object;
    const filePath = `v/${semvar}/${chainIdHex}/${prefix}/${data.guildDao}.txt`;
    console.log(
      `⏳ Uploading ${
        data.symbol
      } GuildToken InfoText File to Cloud Storage Bucket as https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURISafe(
        filePath
      )}?alt=media \n`
    );
    const note = `
       Welcome to GuildFX!
       Your Guild token has been created. Add its address below to your OpenZeppelin Defender:

       ${data.guildName} | ${data.guildSymbol} 
       Address: ${data.guildToken} (import this contract address to OZ Defender)
       DAO: ${data.guildDao}

       Timestamp: ${new Date().toISOString()}
    `;
    console.log(note);
    await storage.bucket(bucket).file(filePath).save(note);
    await storage.bucket(bucket).file(filePath).makePublic();
    console.log(`✅ Uploaded \n`);
  },
};
