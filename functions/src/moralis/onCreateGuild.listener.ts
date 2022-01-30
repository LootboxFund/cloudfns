// import Moralis from "moralis";
// import {
//   TokenData,
//   generateRandomLogo,
//   buildTokenCDNRoute,
// } from "@guildfx/helpers";

// interface TokenDataWithCDN extends TokenData {
//   cdnFilePath: string;
// }

// const EVENT_NAME = "GuildCreated";
// Moralis.Cloud.afterSave(EVENT_NAME, async (request) => {
//   console.log("GuildCreated event received");
//   const authToken = "_________";
//   const semvar = "0.0.1-sandbox";
//   const data: TokenDataWithCDN = {
//     address: request.object.get("contractAddress"),
//     decimals: 18,
//     name: request.object.get("guildTokenName"),
//     symbol: request.object.get("guildTokenSymbol"),
//     chainIdHex: Moralis.getChainId() || "undefined",
//     chainIdDecimal: Moralis.getChainId() || "undefined",
//     logoURI: generateRandomLogo(),
//     priceOracle: "",
//     cdnFilePath: buildTokenCDNRoute({
//       chainIdHex: Moralis.getChainId() || "undefined",
//       semvar,
//       address: request.object.get("contractAddress"),
//     }),
//   };
//   console.log(data);
//   Moralis.Cloud.httpRequest({
//     method: "POST",
//     url: "",
//     body: data,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + authToken,
//     },
//   });
// });
