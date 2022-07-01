import * as Airtable from "airtable";
import { FieldSet } from "airtable";
import { IAirtableAdSetRecord } from "./transformer";

const AD_SETS_AIRTABLE = "appzkVG6HRIr325X7";

export const initAirtable = async () => {
  console.log("Initializing Airtable...");
  await Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
};

export const getScrollFeedAds = async (): Promise<IAirtableAdSetRecord[]> => {
  console.log(`Querying base ${AD_SETS_AIRTABLE}`);
  const base = Airtable.base(AD_SETS_AIRTABLE);
  const p: Promise<IAirtableAdSetRecord[]> = new Promise((res, rej) => {
    const adSets: IAirtableAdSetRecord[] = [];
    base("Ad Sets")
      .select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 50,
        view: "Active Ad Sets - Scroll Feed",
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
