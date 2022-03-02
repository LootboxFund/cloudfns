import path from "path";
import { countLengthOfApp } from "./App";
import * as express from "express";
import { generateImage } from "./lib/api/stamp";
import { ContractAddress } from "@lootboxfund/helpers";

const router = express.Router();

router.get("/api/hello", (req, res, next) => {
  res.json("World");
});

router.get("/demo/render", (req, res, next) => {
  const charCount = countLengthOfApp();
  res.json({
    message: "You hit the render endpoint",
    length: charCount,
  });
});

router.get("/demo/snap", async (req, res, next) => {
  const tempLocalPath = `/tmp/image.png`;
  // const tempLocalPath = "./image.png";
  const linkToImage = await generateImage(tempLocalPath, {
    ticketID: "0",
    backgroundImage:
      "https://i.pinimg.com/originals/81/58/59/8158595c37f199953cf6a13d7034d258.png",
    logoImage:
      "https://s3.us-east-2.amazonaws.com/nomics-api/static/images/currencies/PGX.jpg",
    themeColor: "#00bcd4",
    name: "Steppe Industry Faction",
    lootboxAddress:
      "0x1c69bcBCb7f860680cDf9D4914Fc850a61888f89" as ContractAddress,
    chainIdHex: "0x38",
    numShares: "180.02",
  });
  res.json({
    message: "You hit the snap endpoint",
    image: linkToImage,
  });
});

export default router;
