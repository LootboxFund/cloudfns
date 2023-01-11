import { ContractAddress, LootboxID, ReferralSlug } from "@wormgraph/helpers";
import { generateImage } from "../src/lib/api/stamp";
import { generateInviteStamp } from "../src/lib/api/stamp";

const demo = async () => {
  console.log(`Generating image...`);
  const now = new Date().valueOf();
  const tempLocalPath = `export/image_${now}.png`;
  const linkToImage = await generateInviteStamp(tempLocalPath, {
    coverPhoto:
      "https://lexica-serve-encoded-images2.sharif.workers.dev/full_jpg/2f8a30cc-a1ae-475c-8b82-b91fd96316d7",
    sponsorLogos: [],
    teamName: "Big Boidem",
    themeColor: "#9f5497",
    playerHeadshot:
      "https://lexica-serve-encoded-images2.sharif.workers.dev/md/e2036ab2-efc5-4150-bf7f-f205b059cb45",
    ticketValue: "$1000 USD",
    referralSlug: "bigboidem" as ReferralSlug,
  });
  console.log(`linkToImage = ${linkToImage}`);
};
demo();
