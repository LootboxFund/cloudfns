require("dotenv").config();
import {
  getScrollFeedAds,
  initAirtable,
} from "./api/ad-platform/v1/airtable/index";

const main = async () => {
  await initAirtable();
  // await getScrollFeedAds();
};

main();

// npx ts-node ./src/sandbox.ts
