import * as functions from "firebase-functions";
import { Storage } from "@google-cloud/storage";
import { TokenData, buildFullCDNRoute } from "@guildfx/helpers";

const storage = new Storage();
const BUCKET_NAME = "guildfx-exchange.appspot.com";

export const onCreateGuild = functions.https.onRequest(
  async (request, response) => {
    const filePath = request.body.cdnFilePath;
    const tokenData: TokenData = {
      address: request.body.address,
      decimals: request.body.decimals,
      name: request.body.name,
      symbol: request.body.symbol,
      chainIdHex: request.body.chainIdHex,
      chainIdDecimal: request.body.chainIdDecimal,
      logoURI: request.body.logoURI,
      priceOracle: request.body.priceOracle,
    };
    await storage
      .bucket(BUCKET_NAME)
      .file(filePath)
      .save(JSON.stringify(tokenData));
    await storage.bucket(BUCKET_NAME).file(filePath).makePublic();
    const fullRoute = buildFullCDNRoute({
      bucketName: BUCKET_NAME,
      filePath: filePath,
    });
    console.log(fullRoute);
  }
);

export const onCreateCrowdSale = functions.https.onRequest(
  async (request, response) => {
    const filePath = request.body.cdnFilePath;
    const tokenData: TokenData = {
      address: request.body.address,
      decimals: request.body.decimals,
      name: request.body.name,
      symbol: request.body.symbol,
      chainIdHex: request.body.chainIdHex,
      chainIdDecimal: request.body.chainIdDecimal,
      logoURI: request.body.logoURI,
      priceOracle: request.body.priceOracle,
    };
    await storage
      .bucket(BUCKET_NAME)
      .file(filePath)
      .save(JSON.stringify(tokenData));
    await storage.bucket(BUCKET_NAME).file(filePath).makePublic();
    const fullRoute = buildFullCDNRoute({
      bucketName: BUCKET_NAME,
      filePath: filePath,
    });
    console.log(fullRoute);
  }
);
