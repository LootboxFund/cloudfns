import Moralis from "moralis";

interface TokenDataWithCDN {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  chainIdHex: string;
  chainIdDecimal: string;
  logoURI: string;
  priceOracle: string;
  cdnFilePath: string;
}

const EVENT_NAME = "GuildCreated";
Moralis.Cloud.afterSave(EVENT_NAME, async (request) => {
  console.log("GuildCreated event received");
  const authToken = "_________";
  const data: TokenDataWithCDN = {
    address: request.object.get("contractAddress"),
    decimals: 18,
    name: request.object.get("guildTokenName"),
    symbol: request.object.get("guildTokenSymbol"),
    chainIdHex: Moralis.getChainId() || "undefined",
    chainIdDecimal: Moralis.getChainId() || "undefined",
    logoURI: "generateRandomLogo()",
    priceOracle: "",
    cdnFilePath: "buildTokenCDNRoute()",
  };
  console.log(data);
  Moralis.Cloud.httpRequest({
    method: "POST",
    url: "",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
    },
  });
});
