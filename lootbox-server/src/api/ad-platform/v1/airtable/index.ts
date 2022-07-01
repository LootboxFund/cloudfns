import * as Airtable from "airtable";
import { FieldSet } from "airtable";

const AD_SETS_AIRTABLE = "tbl5ngJHkqd2lRiR1";

export const initAirtable = async () => {
  Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY });
};

export const getScrollFeedAds = async (): Promise<FieldSet[]> => {
  const base = Airtable.base(AD_SETS_AIRTABLE);
  const p: Promise<FieldSet[]> = new Promise((res, rej) => {
    const adSets: FieldSet[] = [];
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
