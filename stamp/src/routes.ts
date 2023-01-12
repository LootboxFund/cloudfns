import * as express from "express";
import {
  generateImage,
  generateInviteStamp,
  generateLossStamp,
  generateSimpleTicket,
  generateTicketImage,
  generateVictoryStamp,
} from "./lib/api/stamp";
import {
  StampNewTicketProps,
  StampNewTicketResponse,
  ContractAddress,
  LootboxTicketMetadataV2_Firestore,
  StampNewLootboxProps,
  StampNewLootboxResponse,
  LootboxID,
  StampSimpleTicketProps,
  StampSimpleTicketResponse,
  StampInviteTicketProps,
  StampInviteTicketResponse,
  StampVictoryTicketProps,
  StampVictoryTicketResponse,
  StampLossTicketProps,
  StampLossTicketResponse,
} from "@wormgraph/helpers";
import { saveTicketMetadataToGBucket } from "./lib/api/gbucket";
import { manifest } from "./manifest";
import { getAuthenticationSecret } from "./lib/api/secrets";
import { SimpleTicketProps } from "./lib/components/SimpleTicket";
import { InviteStampProps } from "./lib/components/InviteStamp";

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
    lootboxID: "qoweinalaj12da" as LootboxID,
  });
  res.json({
    message: "You hit the snap endpoint",
    image: linkToImage,
  });
});

router.post(
  "/stamp/new/lootbox",
  async (
    req: express.Request<unknown, unknown, StampNewLootboxProps>,
    res: express.Response<StampNewLootboxResponse>,
    next
  ) => {
    try {
      const { secret } = req.headers;
      const verifiedSecret = await getAuthenticationSecret();
      if (secret !== verifiedSecret) {
        return res.status(401).json({
          message: "Unauthorized",
          stamp: "",
        });
      }
      const tempLocalPath = `/tmp/image.png`;
      const {
        backgroundImage,
        logoImage,
        themeColor,
        name,
        lootboxAddress,
        chainIdHex,
        lootboxID,
      } = req.body;
      const linkToImage = await generateImage(tempLocalPath, {
        backgroundImage,
        logoImage,
        themeColor,
        name,
        lootboxAddress,
        chainIdHex,
        lootboxID,
      });
      res.json({
        message: "Created stamp!",
        stamp: linkToImage,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error",
        stamp: "",
      });
    }
    return;
  }
);

router.post(
  "/stamp/new/ticket",
  async (
    req: express.Request<unknown, unknown, StampNewTicketProps>,
    res: express.Response<StampNewTicketResponse>,
    next
  ) => {
    try {
      const { secret } = req.headers;
      const verifiedSecret = await getAuthenticationSecret();
      if (secret !== verifiedSecret) {
        return res.status(401).json({
          message: "Unauthorized",
          stamp: "",
          uri: "",
        });
      }

      // TODO Validate that the ticket has been minted according to the smart contract

      const tempLocalPath = `/tmp/image.png`;
      const {
        ticketID,
        backgroundImage,
        logoImage,
        themeColor,
        name,
        lootboxAddress,
        chainIdHex,
        lootboxID,
        metadata,
      } = req.body;

      const linkToImage = await generateTicketImage(tempLocalPath, {
        ticketID,
        backgroundImage,
        logoImage,
        themeColor,
        name,
        lootboxAddress,
        chainIdHex,
        lootboxID,
      });

      const updatedMetadata: LootboxTicketMetadataV2_Firestore = {
        ...metadata,
        image: linkToImage,
      };

      const linkToURI = await saveTicketMetadataToGBucket({
        // alias: `${lootboxAddress}-${ticketID}`,
        fileName: `${lootboxID}/${ticketID}.json`,
        data: JSON.stringify(updatedMetadata),
        bucket: manifest.storage.buckets.data.id,
      });

      res.json({
        message: "Created stamp!",
        stamp: linkToImage,
        uri: linkToURI,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error",
        stamp: "",
        uri: "",
      });
    }
    return;
  }
);

router.post(
  "/stamp/new/simple",
  async (
    req: express.Request<unknown, unknown, StampSimpleTicketProps>,
    res: express.Response<StampSimpleTicketResponse>,
    next
  ) => {
    try {
      const { secret } = req.headers;
      const verifiedSecret = await getAuthenticationSecret();
      if (secret !== verifiedSecret) {
        return res.status(401).json({
          message: "Unauthorized",
          stamp: "",
        });
      }
      const tempLocalPath = `/tmp/image.png`;
      const { coverPhoto, sponsorLogos, teamName, playerHeadshot, themeColor } =
        req.body;
      const linkToImage = await generateSimpleTicket(tempLocalPath, {
        coverPhoto,
        sponsorLogos,
        teamName,
        playerHeadshot,
        themeColor,
      });
      res.json({
        message: "Created stamp!",
        stamp: linkToImage,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error",
        stamp: "",
      });
    }
    return;
  }
);

router.post(
  "/stamp/new/invite",
  async (
    req: express.Request<unknown, unknown, StampInviteTicketProps>,
    res: express.Response<StampInviteTicketResponse>,
    next
  ) => {
    try {
      const { secret } = req.headers;
      const verifiedSecret = await getAuthenticationSecret();
      if (secret !== verifiedSecret) {
        return res.status(401).json({
          message: "Unauthorized",
          stamp: "",
        });
      }
      const tempLocalPath = `/tmp/image.png`;
      const {
        coverPhoto,
        sponsorLogos,
        teamName,
        playerHeadshot,
        themeColor,
        ticketValue,
        qrCodeLink,
      } = req.body;
      const linkToImage = await generateInviteStamp(tempLocalPath, {
        coverPhoto,
        sponsorLogos,
        teamName,
        playerHeadshot,
        themeColor,
        ticketValue,
        qrCodeLink,
      });
      res.json({
        message: "Created invite stamp!",
        stamp: linkToImage,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error",
        stamp: "",
      });
    }
    return;
  }
);

router.post(
  "/stamp/new/victory",
  async (
    req: express.Request<unknown, unknown, StampVictoryTicketProps>,
    res: express.Response<StampVictoryTicketResponse>,
    next
  ) => {
    try {
      const { secret } = req.headers;
      const verifiedSecret = await getAuthenticationSecret();
      if (secret !== verifiedSecret) {
        return res.status(401).json({
          message: "Unauthorized",
          stamp: "",
        });
      }
      const tempLocalPath = `/tmp/image.png`;
      const {
        coverPhoto,
        sponsorLogos,
        teamName,
        playerHeadshot,
        themeColor,
        ticketValue,
        qrCodeLink,
      } = req.body;
      const linkToImage = await generateVictoryStamp(tempLocalPath, {
        coverPhoto,
        sponsorLogos,
        teamName,
        playerHeadshot,
        themeColor,
        ticketValue,
        qrCodeLink,
      });
      res.json({
        message: "Created victory stamp!",
        stamp: linkToImage,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error",
        stamp: "",
      });
    }
    return;
  }
);

router.post(
  "/stamp/new/loss",
  async (
    req: express.Request<unknown, unknown, StampLossTicketProps>,
    res: express.Response<StampLossTicketResponse>,
    next
  ) => {
    try {
      const { secret } = req.headers;
      const verifiedSecret = await getAuthenticationSecret();
      if (secret !== verifiedSecret) {
        return res.status(401).json({
          message: "Unauthorized",
          stamp: "",
        });
      }
      const tempLocalPath = `/tmp/image.png`;
      const {
        coverPhoto,
        sponsorLogos,
        teamName,
        playerHeadshot,
        themeColor,
        ticketValue,
        qrCodeLink,
      } = req.body;
      const linkToImage = await generateLossStamp(tempLocalPath, {
        coverPhoto,
        sponsorLogos,
        teamName,
        playerHeadshot,
        themeColor,
        ticketValue,
        qrCodeLink,
      });
      res.json({
        message: "Created loss stamp!",
        stamp: linkToImage,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Internal Server Error",
        stamp: "",
      });
    }
    return;
  }
);

export default router;
