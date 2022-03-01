import ReactDOMServer from "react-dom/server";
import nodeHtmlToImage from "node-html-to-image";
import Ticket, { TicketProps } from "./lib/components/Ticket";
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

const generateImage = (props: TicketProps) => {
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

generateImage({
  ticketID: "0",
  backgroundImage:
    "https://i.pinimg.com/originals/81/58/59/8158595c37f199953cf6a13d7034d258.png",
  logoImage:
    "https://qph.fs.quoracdn.net/main-qimg-6c48d7960b41bb4d1cdd310087430503-lq",
  themeColor: "#00bcd4",
  name: "Steppe Industry Faction",
  lootboxAddress:
    "0x1c69bcBCb7f860680cDf9D4914Fc850a61888f89" as ContractAddress,
  chainIdHex: "0x38",
  numShares: "180.02",
});
