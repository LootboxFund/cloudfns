import ReactDOMServer from "react-dom/server";
import nodeHtmlToImage from "node-html-to-image";
import Ticket, { TicketProps } from "../lib/components/Ticket";
import { ContractAddress } from "@lootboxfund/helpers";

const generateElement = (props: TicketProps) => (
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

export const generateImage = (props: TicketProps) => {
  nodeHtmlToImage({
    output: "./export/image.png",
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
