require("dotenv").config();
import {
  getScrollFeedAds,
  initAirtable,
} from "./api/ad-platform/v1/airtable/index";

const main = async () => {
  await initAirtable();
  const records = await getScrollFeedAds();
  console.log(`---- GOT RECORDS ----`);
  console.log(records);
};

main();

// npx ts-node ./src/sandbox.ts
