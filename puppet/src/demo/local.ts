import { ContractAddress } from "@lootboxfund/helpers";
import { generateImage } from "./demo.local";

generateImage({
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
