import {
  ActivationIngestorRoute_LootboxAppWebsiteVisit_Body,
  AdEventAction,
  AdEventID,
  AdEvent_Firestore,
  AdFlight_Firestore,
  Collection,
} from "@wormgraph/helpers";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";
import { db } from "../../api/firebase";
import { notifyPubSubOfBillableActivation } from "../../api/pubsub/notify";

export const trackLootboxAppWebsiteVisitActivation = async (
  body: ActivationIngestorRoute_LootboxAppWebsiteVisit_Body
): Promise<AdEvent_Firestore | undefined> => {
  // get the standard params from manual entry
  let flightID = body.flightID;
  const activationID = body.activationID;
  const mmpAlias = body.mmpAlias;
  const adEventRef = db
    .collection(Collection.AdEvent)
    .doc() as DocumentReference<AdEvent_Firestore>;
  // best case scenario, we have a flight

  const flightRef = db
    .collection(Collection.Flight)
    .doc(flightID) as DocumentReference<AdFlight_Firestore>;
  const flightSnapshot = await flightRef.get();

  if (flightSnapshot.exists) {
    const f = flightSnapshot.data();

    if (f) {
      const flight = f;
      const adEventSchema: AdEvent_Firestore = {
        id: adEventRef.id as AdEventID,
        timestamp: Timestamp.now().toMillis(),
        adID: flight.adID,
        adSetID: flight.adSetID,
        sessionID: flight.sessionID,
        campaignID: flight.campaignID,
        flightID: flight.id,
        action: AdEventAction.Activation,
        advertiserID: flight.advertiserID,
        claimID: flight.claimID,
        offerID: flight.offerID,
        activationEventMmpAlias: mmpAlias,
        activationID: activationID,
        metadata: {
          clickRedirectUrl: flight.clickUrl,
          pixelUrl: flight.pixelUrl,
        },
        affiliateAttribution: {
          organizerID: flight.organizerID,
          promoterID: flight.promoterID,
          userID: flight.userID,
          tournamentID: flight.tournamentID,
        },
      };
      await adEventRef.set(adEventSchema);
      await notifyPubSubOfBillableActivation(adEventRef.id as AdEventID);
      return adEventSchema;
    }
  }
};
