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
