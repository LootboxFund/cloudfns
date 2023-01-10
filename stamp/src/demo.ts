import { ContractAddress, LootboxID } from "@wormgraph/helpers";
import { generateImage } from "./lib/api/stamp";
import { generateSimpleTicket } from "./lib/api/stamp";

const demo = async () => {
  console.log(`Generating image...`);
  const tempLocalPath = "export/image.png";
  const linkToImage = await generateSimpleTicket(tempLocalPath, {
    coverPhoto:
      "https://lexica-serve-encoded-images2.sharif.workers.dev/full_jpg/2f8a30cc-a1ae-475c-8b82-b91fd96316d7",
    sponsorLogos: [],
    teamName: "Big Boidem",
    themeColor: "#9f5497",
    playerHeadshot:
      "https://lexica-serve-encoded-images2.sharif.workers.dev/md/e2036ab2-efc5-4150-bf7f-f205b059cb45",
  });
  console.log(`linkToImage = ${linkToImage}`);
};
demo();
