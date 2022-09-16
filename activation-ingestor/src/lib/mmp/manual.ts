import type { Request } from "express";
import {
  AdEvent_Firestore,
  Collection,
  AdFlight_Firestore,
  AdEventID,
  AdEventAction,
  ActivationID,
  MMPActivationAlias,
  UserID,
} from "@wormgraph/helpers";
import { db } from "../../api/firebase";
import { DocumentReference } from "firebase-admin/firestore";
import { getUserByEmail } from "../../api/firestore/users";

//  * ------ DATA WE RECEIVE FROM MANUAL ENTRY ------
//  *
//  *
//  *
export const trackManualActivation = async (
  req: Request
): Promise<AdEvent_Firestore> => {
  // get the standard params from manual entry
  let userID = req.query.userID;
  const userEmail = req.query.userEmail;
  const userPhone = req.query.userPhone;
  const offerID = req.query.offerID;
  const activationID = req.query.activationID;
  const activationEventMmpAlias = req.query.mmpActivationAlias;

  if (userEmail) {
    const users = await getUserByEmail(userEmail as string);
    userID = users[0].id;
  }

  const adEventRef = db
    .collection(Collection.AdEvent)
    .doc() as DocumentReference<AdEvent_Firestore>;
  const adEventSchema: AdEvent_Firestore = {
    id: adEventRef.id as AdEventID,
    timestamp: new Date().getTime() / 1000,
    action: AdEventAction.Activation,
    activationID: activationID as ActivationID,
    activationEventMmpAlias: activationEventMmpAlias as MMPActivationAlias,
    affiliateAttribution: {
      userID: userID as UserID,
    },
  };
  await adEventRef.set(adEventSchema);
  return adEventSchema;
};
