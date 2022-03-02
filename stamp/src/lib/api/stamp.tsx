import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import * as ReactDOM from "react-dom";
import axios from "axios";
import nodeHtmlToImage from "node-html-to-image";
import Ticket, { TicketProps } from "../components/Ticket";
import { ContractAddress, GBucketPrefixesEnum } from "@lootboxfund/helpers";
import { saveLocalFileToGBucket } from "./gbucket";
import { manifest } from "../../manifest";

export const generateStaticElement = (props: TicketProps) =>
  ReactDOMServer.renderToStaticMarkup(
    <Ticket
      ticketID={props.ticketID}
      backgroundImage={props.backgroundImage}
      logoImage={props.logoImage}
      themeColor={props.themeColor}
      name={props.name}
      lootboxAddress={props.lootboxAddress}
      chainIdHex={props.chainIdHex}
      numShares={props.numShares}
    />
  );

export const generateImage = async (path: string, props: TicketProps) => {
  console.log(`Generating Image...`);
  try {
    await nodeHtmlToImage({
      output: path,
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
            ${generateStaticElement(props)}
        </body>
      </html>
      `,
      transparent: true,
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
    });
    const imagePath = await saveLocalFileToGBucket({
      alias: `Image for ${props.name}`,
      localFilePath: path,
      fileName: `${props.name}.txt`,
      semver: manifest.googleCloud.bucket.folderSemver,
      chainIdHex: manifest.chain.chainIDHex,
      prefix: GBucketPrefixesEnum.lootbox,
      bucket: manifest.googleCloud.bucket.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};
