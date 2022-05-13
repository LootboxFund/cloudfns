import { defineAction } from "ironpipe";
import { saveFileToGBucket } from "../../api/gbucket";

const BUCKET_NAME = "badge-bcs-uri";

const action = defineAction({
  name: "onBadgeFactoryBCS Action",
  description: "On Badge Factory BCS Action for Pipedream Typescript",
  key: "onBadgeFactoryBCS",
  version: "0.1.0",
  type: "action",
  props: {
    googleCloud: {
      type: "app",
      app: "google_cloud",
    },
    webhookTrigger: {
      // {{steps.trigger.event}}
      type: "object",
    },
  },
  async run() {
    console.log(this.$props);

    const credentials = JSON.parse((this as any).googleCloud.$auth.key_json);
    interface IGuildBadgeData {
      name: string;
      symbol: string;
      logoUrl: string;
      twitter: string;
      email: string;
      numberOfScholars: string;
      facebook: string;
      discord: string;
      twitch: string;
      location: string;
      gamesPlayed: string;
      web: string;
      badgeAddress: string;
    }
    const data = (this as any).webhookTrigger as IGuildBadgeData;
    await saveFileToGBucket({
      alias: `Saving guild badge for Guild=${data.name}`,
      credentials,
      fileName: `${data.badgeAddress}/_root.json`,
      bucket: BUCKET_NAME,
      data: JSON.stringify(data),
    });
  },
});

export = action;
