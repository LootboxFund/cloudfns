import { defineAction } from "ironpipe";
import { saveFileToGBucket } from "../../api/gbucket";

const BUCKET_NAME = "badge-bcs-uri";

const action = defineAction({
  name: "onMintBadgeBCS Action",
  description: "On Mint Badge BCS Action for Pipedream Typescript",
  key: "onMintBadgeBCS",
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
    interface IGuildMemberBadgeData {
      guildName: string;
      memberName: string;
      themeColor: string;
      logoUrl: string;
      coverUrl: string;
      twitter: string;
      email: string;
      facebook: string;
      discord: string;
      web: string;
      gamesPlayed: string;
      location: string;
      numberOfScholars: string;
      stampImage: string;
      ticketId: string;
      badgeAddress: string;
    }
    const data = (this as any).webhookTrigger as IGuildMemberBadgeData;
    const nftData = {
      /** points to stamp image - opensea compatible */
      image: data.stampImage,
      /** points to lootbox page on lootbox.fund - opensea compatible */
      external_url: data.stampImage,
      /** description of the lootbox - opensea compatible */
      description: `Guild Member Badge #${data.ticketId} - Guild ${data.guildName}, Member ${data.memberName}. Badge Address ${data.badgeAddress}`,
      /** name of the lootbox - opensea compatible */
      name: `Badge #${data.ticketId} - ${data.memberName} of ${data.guildName}`,
      /** hex color, must be a six-character hexadecimal without a pre-pended # - opensea compatible */
      background_color: data.themeColor,
      /** metadata */
      customBadgeMetadata: data,
    };
    await saveFileToGBucket({
      alias: `Saving guild member badge for Guild=${data.guildName}, Member=${data.memberName}`,
      credentials,
      fileName: `${data.badgeAddress}/${data.ticketId}.json`,
      bucket: BUCKET_NAME,
      data: JSON.stringify(nftData),
    });
  },
});

export = action;
