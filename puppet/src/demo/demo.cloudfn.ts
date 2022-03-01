import { ContractAddress } from "@lootboxfund/helpers";
import express from "express";
import puppeteer from "puppeteer";
import { generateImage } from "./demo.local";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const BROWSERLESS_API = process.env.BROWSERLESS_API;

const app = express();

const getBrowser = () =>
  IS_PRODUCTION
    ? // Connect to browserless so we don't run Chrome on the same hardware in production
      puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_API}`,
      })
    : // Run the browser locally while in development
      puppeteer.launch();

app.get("/image", async (req: express.Request, res: express.Response) => {
  let browser = null;
  console.log((req as any).x);
  try {
    browser = await getBrowser();
    // const page = await browser.newPage();

    // await page.goto("https://www.google.com/");
    // const screenshot = await page.screenshot();

    // res.end(screenshot, "binary");

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
  } catch (error) {
    if (!res.headersSent) {
      res.status(400).send(error.message);
    }
  } finally {
    if (browser) {
      browser.close();
    }
  }
});

app.listen(8080, () => console.log("Listening on PORT: 8080"));
