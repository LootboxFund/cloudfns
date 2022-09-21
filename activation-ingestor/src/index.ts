import * as express from "express";
import { trackAppsFlyerActivation } from "./lib/mmp/appsflyer";
import { trackManualActivation } from "./lib/mmp/manual";
const app = express();
const bodyParser = require("body-parser");
const url = require("url");
const querystring = require("querystring");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 8080;

/**
 * INJESTOR MINIMUM REQUIREMENTS
 *
 * Injestors should be able to handle a diverse range of data inavailability
 * At a minimum they need this data:
 *
 * 1. Activation Event Name (mmpAlias) or Activation Event ID (activationID)
 * 2. User Identifying Data (flightID from browser cookie, userEmail from manual activation form, or user browser fingerprint, etc)
 *
 * The activation event name is easy to get because it does NOT require client-side memroy. It gets logged via hardcoding at the place where the event happens without needing a specific user identifier
 * The user identifying data is hard to get because it requires client-side memory. Modern browsers periodically erase cookies, cache & other places where it can be stored.
 *    - The are a variety of ways around this, with their pros & cons. See the list of options here: https://blog.logrocket.com/beyond-cookies-todays-options-for-client-side-data-storage/
 *    - For these alternatives, their dimensions of comparison are:
 *          - Reliability/Accuracy
 *          - Ease of implementation
 *          - Consent/Legal Permission
 *          - Cost to use (such as data aggregator services)
 *
 */

app.get("/", (req, res) => {
  res.send("LOOTBOX Activation Event Ingestor");
});

app.get("/appsflyer", async (req, res) => {
  const trackedEvent = await trackAppsFlyerActivation(req);
  res.json({
    message: `Successfully received activation event from Appsflyer with flightID=${trackedEvent.flightId} and AdEventID=${trackedEvent.id}`,
  });
});

app.get("/manual", async (req, res) => {
  // interface manualActivationPostbackPayload {
  //   userID?: UserID;
  //   userEmail?: string;
  //   userPhone?: string;
  //   offerID?: OfferID;
  //   activationID?: ActivationID;
  //   activationEventMmpAlias?: MMPAlias;
  // }
  const trackedEvent = await trackManualActivation(req);
  res.json({
    message: `Successfully received activation event from manual entry with AdEventID=${trackedEvent.id}`,
  });
});

app.listen(port, () => {
  console.log(`LOOTBOX Activation Event Ingestor listening on port ${port}`);
});
