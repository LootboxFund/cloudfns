import * as express from "express";
import { generateImage, generateTicketImage } from "./lib/api/stamp";
import { ContractAddress, ITicketMetadata } from "@wormgraph/helpers";
import { TicketProps } from "./lib/components/Ticket";
import { saveTicketMetadataToGBucket } from "./lib/api/gbucket";
import { manifest } from "./manifest";

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
    if (
      secret !==
      "kjnlkvsjdnlkjsfnlvksjdnlksjdnvrjgnwoeirwhoqiwhqowncasljcnalsknaslkcnvlkdnlsdknscldksdjfnskdjfbksdjfbskdjqlwekjqwlekjqwlj"
    ) {
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
  "/stamp/new/ticket",
  async (req: express.Request, res: express.Response, next) => {
    const { secret } = req.headers;
    if (
      secret !==
      ";kdfng;dkjfgn;dkfjgnsldkjfna;sdaposdjpaokcpaoskpaosckapsocksdgnekrfnvlsdknalkdcnalsdgbrhejbgjrbkbakjsbaksjbksdjfs"
    ) {
      return res.status(401).json({
        message: "Unauthorized",
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
      numShares,
    }: TicketProps = req.body;
    const metadata: ITicketMetadata = req.body.metadata;

    const linkToImage = await generateTicketImage(tempLocalPath, {
      ticketID,
      backgroundImage,
      logoImage,
      themeColor,
      name,
      lootboxAddress,
      chainIdHex,
      numShares,
    });

    const ticketMetadata: ITicketMetadata = {
      image: linkToImage,
      external_url: metadata?.external_url || "",
      description: metadata?.description || "",
      name: metadata?.name || "",
      background_color: metadata?.background_color || "000000",
      animation_url: metadata?.animation_url || "",
      youtube_url: metadata?.youtube_url || "",
      attributes: metadata?.attributes || [],
      lootboxCustomSchema: {
        version: manifest.semver.id,
        chain: {
          address: metadata?.lootboxCustomSchema?.chain?.address || "",
          chainIdHex: metadata?.lootboxCustomSchema?.chain?.chainIdHex || "",
          chainName: metadata?.lootboxCustomSchema?.chain?.chainName || "",
          chainIdDecimal:
            metadata?.lootboxCustomSchema?.chain?.chainIdDecimal || "",
        },
        lootbox: {
          ticketNumber:
            metadata?.lootboxCustomSchema?.lootbox?.ticketNumber || 0,
          backgroundImage:
            metadata?.lootboxCustomSchema?.lootbox?.backgroundImage || "",
          image: metadata?.lootboxCustomSchema?.lootbox?.image || "",
          backgroundColor:
            metadata?.lootboxCustomSchema?.lootbox?.backgroundColor || "",
          badgeImage: metadata?.lootboxCustomSchema?.lootbox?.badgeImage || "",
          sharesInTicket:
            metadata?.lootboxCustomSchema?.lootbox?.sharesInTicket || "",
        },
      },
    };

    const linkToURI = await saveTicketMetadataToGBucket({
      alias: `${lootboxAddress}-${ticketID}`,
      fileName: `${lootboxAddress}/${ticketID}.json`,
      data: JSON.stringify(ticketMetadata),
      bucket: manifest.storage.buckets.data.id,
    });

    res.json({
      message: "Created stamp!",
      stamp: linkToImage,
      uri: linkToURI,
    });
  }
);

export default router;
