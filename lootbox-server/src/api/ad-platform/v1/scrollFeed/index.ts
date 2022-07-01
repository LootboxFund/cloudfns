import * as Airtable from "airtable";
import { ScrollFeedAdSetRecord } from "./scrollFeed.types";

const SCROLL_FEED_AD_SETS_AIRTABLE = "appdaZ0qJ6RnF1m0Y";

export const initAirtable = async () => {
  console.log("Initializing Airtable...");
  await Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
};

export const getScrollFeedAds = async (): Promise<ScrollFeedAdSetRecord[]> => {
  console.log(`Querying base ${SCROLL_FEED_AD_SETS_AIRTABLE}`);
  const base = Airtable.base(SCROLL_FEED_AD_SETS_AIRTABLE);
  const p: Promise<ScrollFeedAdSetRecord[]> = new Promise((res, rej) => {
    const adSets: ScrollFeedAdSetRecord[] = [];
    base("Scroll Feed AdSet")
      .select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 50,
        view: "Active",
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.

          records.forEach(function (record) {
            console.log("Retrieved", record.get("Alias"));
            adSets.push(record._rawJson);
          });

          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            rej(err);
            return;
          }
          res(adSets);
        }
      );
  });
  return p;
};
