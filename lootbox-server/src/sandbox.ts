require("dotenv").config();
import {
  getScrollFeedAds,
  initAirtable,
} from "./api/ad-platform/v1/scrollFeed/index";

const main = async () => {
  await initAirtable();
  const records = await getScrollFeedAds();
  console.log(`---- GOT RECORDS ----`);
  console.log(records[0]);
  console.log(JSON.stringify(records[0].fields));
};

main();

// npx ts-node ./src/sandbox.ts
