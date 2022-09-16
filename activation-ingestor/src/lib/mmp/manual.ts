import type { Request } from "express";
import {
  AdEvent_Firestore,
  Collection,
  AdFlight_Firestore,
  AdEventID,
  AdEventAction,
} from "@wormgraph/helpers";
import { db } from "../../api/firebase";
import { DocumentReference } from "firebase-admin/firestore";

//  * ------ DATA WE RECEIVE FROM MANUAL ENTRY ------
//  *
//  *
//  *
export const trackManualActivation = async (
  req: Request
): Promise<AdEvent_Firestore> => {
  // get the standard params from manual entry
  const userID = req.query.userID;
  const userEmail = req.query.userEmail;
  const offerID = req.query.offerID;
  const activationID = req.query.activationID;
  const activationEventMmpAlias = req.query.mmpActivationAlias;
  // get flight from firestore
  const flightID = req.query.af_ad;
  const adEventRef = db
    .collection(Collection.AdEvent)
    .doc() as DocumentReference<AdEvent_Firestore>;
  if (typeof flightID === "string") {
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
          timestamp: new Date().getTime() / 1000,
          adId: flight.adID,
          adSetId: flight.adSetID,
          sessionId: flight.sessionID,
          campaignId: flight.campaignID,
          flightId: flight.id,
          action: AdEventAction.Activation,
          claimId: flight.claimID,
          activationEventMmpAlias:
            (extraData.appsflyer_event_name as string) || "",
          metadata: {
            clickRedirectUrl: flight.clickUrl,
            pixelUrl: flight.pixelUrl,
          },
          extraData: extraData,
          affiliateAttribution: {
            organizerID: flight.organizerID,
            promoterID: flight.promoterID,
          },
        };
        await adEventRef.set(adEventSchema);
        return adEventSchema;
      }
    }
  }
  const adEventSchema: AdEvent_Firestore = {
    id: adEventRef.id as AdEventID,
    timestamp: new Date().getTime() / 1000,
    action: AdEventAction.Activation,
    extraData: extraData,
  };
  await adEventRef.set(adEventSchema);
  return adEventSchema;
};
