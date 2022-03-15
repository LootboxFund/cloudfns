import { ContractAddress } from "@wormgraph/helpers";
import { generateImage } from "./lib/api/stamp";

const demo = async () => {
  console.log(`Generating image...`);
  const tempLocalPath = "export/image.png";
  const linkToImage = await generateImage(tempLocalPath, {
    ticketID: "0",
    backgroundImage: "https://wallpaperaccess.com/full/5583122.jpg",
    logoImage:
      "https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/teutonic-knight-04-andrea-mazzocchetti.jpg",
    themeColor: "#000000",
    name: "Pig Iron Gang",
    lootboxAddress:
      "0x1c69bcBCb7f860680cDf9D4914Fc850a61888f89" as ContractAddress,
    chainIdHex: "0x38",
    numShares: "180.02",
  });
  console.log(`linkToImage = ${linkToImage}`);
};
demo();
