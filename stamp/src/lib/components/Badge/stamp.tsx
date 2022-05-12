import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import * as ReactDOM from "react-dom";
import axios from "axios";
import nodeHtmlToImage from "node-html-to-image";
import Badge, { BadgeProps } from "./index";
import { saveLocalFileToGBucket } from "../../api/gbucket";

const bucketName = "___________";

export const generateStaticElement = (props: BadgeProps) =>
  ReactDOMServer.renderToStaticMarkup(
    <Badge
      ticketID={props.ticketID}
      backgroundImage={props.backgroundImage}
      logoImage={props.logoImage}
      themeColor={props.themeColor}
      guildName={props.guildName}
      memberName={props.memberName}
      badgeAddress={props.badgeAddress}
      chainIdHex={props.chainIdHex}
      numShares={props.numShares}
    />
  );

export const generateBadgeImage = async (path: string, props: BadgeProps) => {
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
      alias: `Image for src/actions/onLootboxURI/index.ts guild=${props.guildName}, member=${props.memberName}`,
      localFilePath: path,
      fileName: `${props.badgeAddress}/${props.ticketID}.png`,
      bucket: bucketName,
    });
    return imagePath;
  } catch (e) {
    console.log(`--- BIG ERROR ---`);
    console.log(e);
    return;
  }
};
