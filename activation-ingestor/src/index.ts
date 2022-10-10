import * as express from "express";
import { trackAppsFlyerActivation } from "./lib/mmp/appsflyer";
import { trackManualActivation } from "./lib/mmp/manual";
import { trackLootboxAppWebsiteVisitActivation } from "./lib/mmp/lootbox-app";
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

app.post("/lootbox-app/website-visit", async (req, res) => {
  // import { ActivationIngestorRoute_Manual_Body } from "@wormgraph/helpers"
  // interface ActivationIngestorRoute_LootboxAppWebsiteVisit_Body {
  //   flightID: FlightID
  //   mmpAlias: string
  //   activationID: ActivationID
  // }
  console.log(`--- /lootbox-app/website-visit ---`);
  const trackedEvent = await trackLootboxAppWebsiteVisitActivation(req.body);
  if (trackedEvent) {
    console.log(`--- tracked the event! ${trackedEvent.id} ---`);
    res.json({
      message: `Successfully received activation event of Lootbox App Website Visit with flightID=${trackedEvent.flightID} and AdEventID=${trackedEvent.id}`,
    });
  } else {
    res.json({
      message: `Failed to track activation event for flight ${req.body.flightID}`,
    });
  }
});

app.get("/appsflyer", async (req, res) => {
  const trackedEvent = await trackAppsFlyerActivation(req);
  res.json({
    message: `Successfully received activation event from Appsflyer with flightID=${trackedEvent.flightID} and AdEventID=${trackedEvent.id}`,
  });
});

app.post("/manual", async (req, res) => {
  // import { ActivationIngestorRoute_Manual_Body } from "@wormgraph/helpers"
  // interface ActivationIngestorRoute_Manual_Body {
  //   activationID: ActivationID
  //   userID?: UserID
  //   userEmail?: string
  //   userPhone?: string
  //   offerID?: OfferID
  //   tournamentID?: TournamentID
  //   activationEventMmpAlias?: string
  // }
  const trackedEvent = await trackManualActivation(req.body);
  res.json({
    message: `Successfully received activation event from manual entry with AdEventID=${trackedEvent.id}`,
  });
});

app.listen(port, () => {
  console.log(`LOOTBOX Activation Event Ingestor listening on port ${port}`);
});
