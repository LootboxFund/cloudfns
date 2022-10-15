import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import * as ReactDOM from "react-dom";
import axios from "axios";
import nodeHtmlToImage from "node-html-to-image";
import Ticket, { TicketProps } from "../components/Ticket";
import { saveLocalFileToGBucket } from "./gbucket";
import { manifest } from "../../manifest";
import { StampProps } from "../types/stamp.types";
import InviteStamp from "../components/InviteStamp";

export const generateStaticElementTicket = (props: TicketProps) =>
  ReactDOMServer.renderToStaticMarkup(
    <Ticket
      ticketID={props.ticketID}
      backgroundImage={props.backgroundImage}
      logoImage={props.logoImage}
      themeColor={props.themeColor}
      name={props.name}
      lootboxAddress={props.lootboxAddress}
      chainIdHex={props.chainIdHex}
    />
  );

/** Generates lootbox stamp image */
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
            ${generateStaticElementTicket(props)}
        </body>
      </html>
      `,
      transparent: true,
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
    });
    const imagePath = await saveLocalFileToGBucket({
      alias: `Image fosrc/actions/onLootboxURI/index.ts r ${props.name}`,
      localFilePath: path,
      fileName: `${props.lootboxAddress}/lootbox.png`,
      bucket: manifest.storage.buckets.stamp.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};

/** Generates ticket stamp image */
export const generateTicketImage = async (path: string, props: TicketProps) => {
  console.log(`Generating Ticket Image...`);
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
            ${generateStaticElementTicket(props)}
        </body>
      </html>
      `,
      transparent: true,
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
    });
    const imagePath = await saveLocalFileToGBucket({
      alias: `Image fosrc/actions/onLootboxURI/index.ts r ${props.name}`,
      localFilePath: path,
      fileName: `${props.lootboxAddress}/${props.ticketID}.png`,
      bucket: manifest.storage.buckets.stamp.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};

export const generateStaticElementStamp = (props: StampProps) =>
  ReactDOMServer.renderToStaticMarkup(<InviteStamp />);

/** Generates ticket stamp image */
export const generateStampImage = async (path: string, props: StampProps) => {
  console.log(`Generating Stamp Image...`);
  console.log(generateStaticElementStamp(props));
  try {
    await nodeHtmlToImage({
      output: path,
      html: `<html>
        <head>
          
<link rel="stylesheet" href="https://storage.googleapis.com/lootbox-stamp-staging/invite-stamp/index.css">
        </head>
        <body>
            ${generateStaticElementStamp(props)}
        </body>
      </html>
      `,
      transparent: true,
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
    });
    const imagePath = await saveLocalFileToGBucket({
      alias: `Image invite stamp ${props.stampID}`,
      localFilePath: path,
      fileName: `invite-stamp/${props.stampID}.png`,
      bucket: manifest.storage.buckets.stamp.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};
