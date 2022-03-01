import React from "react";
import { defineAction } from "ironpipe";
import {
  ChainIDHex,
  ContractAddress,
  GBucketPrefixesEnum,
  ITicketMetadata,
  Url,
} from "@lootboxfund/helpers";
import ReactDOMServer from "react-dom/server";
import nodeHtmlToImage from "node-html-to-image";
import Ticket from "./components/Ticket/index.jsx";
import { file } from "tmp-promise";
import { Manifest } from "./manifest";
import { saveLocalFileToGBucket } from "./api/gbucket";
const manifest = Manifest.default;

const action = defineAction({
  name: manifest.pipedream.actions.onStampNFT.alias,
  description: `
    Saves a PNG of an NFT Ticket to GCloud
  `,
  key: manifest.pipedream.actions.onStampNFT.slug,
  version: "0.0.1",
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
    const credentials = JSON.parse(this.googleCloud.$auth.key_json);
    const lootboxTicketData = this.webhookTrigger;
    const { path, cleanup } = await file();

    console.log(`
    
        ----- NFT Ticket
    
    `);
    console.log(lootboxTicketData);

    const generateElement = (props) =>
      React.createElement(
        Ticket,
        {
          ticketID: props.ticketID,
          backgroundImage: props.backgroundImage,
          logoImage: props.logoImage,
          themeColor: props.themeColor,
          name: props.name,
          lootboxAddress: props.lootboxAddress,
          chainIdHex: props.chainIdHex,
          numShares: props.numShares,
        },
        null
      );
    // <Ticket
    //   ticketID={props.ticketID}
    //   backgroundImage={props.backgroundImage}
    //   logoImage={props.logoImage}
    //   themeColor={props.themeColor}
    //   name={props.name}
    //   lootboxAddress={props.lootboxAddress}
    //   chainIdHex={props.chainIdHex}
    //   numShares={props.numShares}
    // />

    const imagePath = `${path}/image.png`;

    const generateImage = (props) => {
      nodeHtmlToImage({
        output: imagePath,
        html: `<html>
          <head>
            <style>
              body {
                width: 500px;
                height: 700px;
              }
            </style>
          </head>
          <body>
              ${ReactDOMServer.renderToStaticMarkup(generateElement(props))}
          </body>
        </html>
        `,
        transparent: true,
      }).then(() => console.log("The image was created successfully!"));
    };
    generateImage(lootboxTicketData);

    await saveLocalFileToGBucket({
      alias: `Saving PNG image for ${lootboxTicketData.name}`,
      credentials,
      fileName: `${lootboxTicketData.lootboxAddress}.png`,
      semver: manifest.googleCloud.bucket.folderSemver,
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum["nft-ticket-stamp"],
      bucket: manifest.googleCloud.bucket.id,
      localFilePath: imagePath,
    });

    return;
  },
});

module.exports = Ticket;
