import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import * as ReactDOM from "react-dom";
import axios from "axios";
import nodeHtmlToImage from "node-html-to-image";
import Ticket, { TicketProps } from "../components/Ticket";
import { saveLocalFileToGBucket } from "./gbucket";
import { manifest } from "../../manifest";
import SimpleTicket, { SimpleTicketProps } from "../components/SimpleTicket";
import InviteStamp, { InviteStampProps } from "../components/InviteStamp";
import VictoryStamp, { VictoryStampProps } from "../components/VictoryStamp";
import LossStamp, { LossStampProps } from "../components/LossStamp";
import { v4 as uuidV4 } from "uuid";

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
      lootboxID={props.lootboxID}
    />
  );

export const simpleTicketStaticElement = (props: SimpleTicketProps) =>
  ReactDOMServer.renderToStaticMarkup(
    <SimpleTicket
      coverPhoto={props.coverPhoto}
      sponsorLogos={props.sponsorLogos}
      teamName={props.teamName}
      playerHeadshot={props.playerHeadshot}
      themeColor={props.themeColor}
    />
  );

export const inviteStampStaticElement = (props: InviteStampProps) =>
  ReactDOMServer.renderToStaticMarkup(
    <InviteStamp
      coverPhoto={props.coverPhoto}
      sponsorLogos={props.sponsorLogos}
      teamName={props.teamName}
      playerHeadshot={props.playerHeadshot}
      themeColor={props.themeColor}
      ticketValue={props.ticketValue}
      qrCodeLink={props.qrCodeLink}
    />
  );

export const victoryStampStaticElement = (props: VictoryStampProps) =>
  ReactDOMServer.renderToStaticMarkup(
    <VictoryStamp
      coverPhoto={props.coverPhoto}
      sponsorLogos={props.sponsorLogos}
      teamName={props.teamName}
      playerHeadshot={props.playerHeadshot}
      themeColor={props.themeColor}
      ticketValue={props.ticketValue}
      qrCodeLink={props.qrCodeLink}
    />
  );

export const lossStampStaticElement = (props: LossStampProps) =>
  ReactDOMServer.renderToStaticMarkup(
    <LossStamp
      coverPhoto={props.coverPhoto}
      sponsorLogos={props.sponsorLogos}
      teamName={props.teamName}
      playerHeadshot={props.playerHeadshot}
      themeColor={props.themeColor}
      ticketValue={props.ticketValue}
      qrCodeLink={props.qrCodeLink}
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
      // alias: `Image fosrc/actions/onLootboxURI/index.ts r ${props.name}`,
      localFilePath: path,
      fileName: `${props.lootboxID}/lootbox.png`,
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
      // alias: `Image fosrc/actions/onLootboxURI/index.ts r ${props.name}`,
      localFilePath: path,
      fileName: `${props.lootboxID}/${props.ticketID}.png`,
      bucket: manifest.storage.buckets.stamp.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};

export const generateSimpleTicket = async (
  path: string,
  props: SimpleTicketProps
) => {
  console.log("Generating Basic Ticket Image...");
  try {
    await nodeHtmlToImage({
      output: path,
      html: `<html>
      <head>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap");
          @import url("https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,800;1,800&display=swap");

          body {
            width: 900px;
            height: 1650px;
          }
        </style>
      </head>
      <body>
          ${simpleTicketStaticElement(props)}
      </body>
    </html>
    `,
      transparent: true,
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
    });
    const imagePath = await saveLocalFileToGBucket({
      localFilePath: path,
      fileName: `stamp/simple/${uuidV4()}.png`,
      bucket: manifest.storage.buckets.stamp.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};

export const generateInviteStamp = async (
  path: string,
  props: InviteStampProps
) => {
  console.log("Generating Invite Stamp...");
  try {
    await nodeHtmlToImage({
      output: path,
      html: `<html>
      <head>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap");
          @import url("https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,800;1,800&display=swap");

          body {
            width: 900px;
            height: 1650px;
          }
        </style>
      </head>
      <body>
          ${inviteStampStaticElement(props)}
      </body>
    </html>
    `,
      transparent: true,
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
    });
    const imagePath = await saveLocalFileToGBucket({
      localFilePath: path,
      fileName: `stamp/invite/${uuidV4()}.png`,
      bucket: manifest.storage.buckets.stamp.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};

export const generateVictoryStamp = async (
  path: string,
  props: VictoryStampProps
) => {
  console.log("Generating Invite Stamp...");
  try {
    await nodeHtmlToImage({
      output: path,
      html: `<html>
      <head>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap");
          @import url("https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,800;1,800&display=swap");

          body {
            width: 900px;
            height: 1650px;
          }
        </style>
      </head>
      <body>
          ${victoryStampStaticElement(props)}
      </body>
    </html>
    `,
      transparent: true,
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
    });
    const imagePath = await saveLocalFileToGBucket({
      localFilePath: path,
      fileName: `stamp/victory/${uuidV4()}.png`,
      bucket: manifest.storage.buckets.stamp.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};

export const generateLossStamp = async (
  path: string,
  props: LossStampProps
) => {
  console.log("Generating Invite Stamp...");
  try {
    await nodeHtmlToImage({
      output: path,
      html: `<html>
      <head>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap");
          @import url("https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,800;1,800&display=swap");

          body {
            width: 900px;
            height: 1650px;
          }
        </style>
      </head>
      <body>
          ${lossStampStaticElement(props)}
      </body>
    </html>
    `,
      transparent: true,
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
    });
    const imagePath = await saveLocalFileToGBucket({
      localFilePath: path,
      fileName: `stamp/loss/${uuidV4()}.png`,
      bucket: manifest.storage.buckets.stamp.id,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};
