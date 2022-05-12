import * as express from "express";
import { generateImage } from "./lib/api/stamp";
import { generateBadgeImage } from "./lib/components/Badge/stamp";
import { ContractAddress } from "@wormgraph/helpers";
import { TicketProps } from "./lib/components/Ticket";
import { BadgeProps } from "./lib/components/Badge";

const router = express.Router();

router.get("/", (req, res, next) => {
  res.json("Hello World");
});

router.get("/demo", async (req, res, next) => {
  const tempLocalPath = `/tmp/image.png`;
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

router.post(
  "/stamp/new/lootbox",
  async (req: express.Request, res: express.Response, next) => {
    const { secret } = req.headers;
    if (secret !== "mysecret") {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const tempLocalPath = `/tmp/image.png`;
    const {
      ticketID,
      backgroundImage,
      logoImage,
      themeColor,
      name,
      lootboxAddress,
      chainIdHex,
      numShares,
    }: TicketProps = req.body;
    const linkToImage = await generateImage(tempLocalPath, {
      ticketID,
      backgroundImage,
      logoImage,
      themeColor,
      name,
      lootboxAddress,
      chainIdHex,
      numShares,
    });
    res.json({
      message: "Created stamp!",
      stamp: linkToImage,
    });
  }
);

router.post(
  "/stamp/new/badge-bcs",
  async (req: express.Request, res: express.Response, next) => {
    const { secret } = req.headers;
    if (secret !== "7XsxFA!C&X8f*5&65g3XFNXmJ^K#Y1BDlx2kVZRp") {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const tempLocalPath = `/tmp/image.png`;
    const {
      ticketID,
      backgroundImage,
      logoImage,
      themeColor,
      guildName,
      memberName,
      badgeAddress,
      chainIdHex,
      numShares,
    }: BadgeProps = req.body;
    const linkToImage = await generateBadgeImage(tempLocalPath, {
      ticketID,
      backgroundImage,
      logoImage,
      themeColor,
      guildName,
      memberName,
      badgeAddress,
      chainIdHex,
      numShares,
    });
    res.json({
      message: "Created stamp!",
      stamp: linkToImage,
    });
  }
);

export default router;
