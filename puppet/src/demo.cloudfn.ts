import express from "express";
import puppeteer from "puppeteer";
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

  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto("https://www.google.com/");
    const screenshot = await page.screenshot();

    res.end(screenshot, "binary");
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
