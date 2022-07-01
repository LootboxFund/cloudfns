import * as Airtable from "airtable";
import {
  ScrollAdCreativeType,
  ScrollFeedAd,
  ScrollFeedAdCreative,
} from "../../../../graphql/generated/types";
import { ScrollFeedAdSetRecord } from "./scrollFeed.types";

const SCROLL_FEED_AD_SETS_AIRTABLE = "appdaZ0qJ6RnF1m0Y";

export const initAirtable = async () => {
  console.log("Initializing Airtable...");
  await Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
};

export const getScrollFeedAds = async (): Promise<ScrollFeedAd[]> => {
  console.log(`Querying base ${SCROLL_FEED_AD_SETS_AIRTABLE}`);
  const base = Airtable.base(SCROLL_FEED_AD_SETS_AIRTABLE);
  const p: Promise<ScrollFeedAd[]> = new Promise((res, rej) => {
    const adSets: ScrollFeedAd[] = [];
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
            adSets.push(
              transformAirtableToGraphQL_scrollFeedAds(
                record._rawJson as ScrollFeedAdSetRecord
              )
            );
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

const transformAirtableToGraphQL_scrollFeedAds = (
  record: ScrollFeedAdSetRecord
): ScrollFeedAd => {
  const list = Array.from(Array(record.fields.Ads.length).keys());
  const creatives = list.map((cIndex) => ({
    alias: record.fields["Title (from Ads)"][cIndex],
    url: record.fields["Url (from Ads)"][cIndex],
    type: record.fields["Creative Type (from Ads)"][
      cIndex
    ] as unknown as ScrollAdCreativeType,
  }));
  return {
    creatives,
    description: record.fields["Notes"],
    title: record.fields.Title,
  };
};
