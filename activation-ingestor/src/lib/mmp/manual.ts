import type { Request } from "express";
import { PubSub } from "@google-cloud/pubsub";
import { manifest } from "../../manifest";
import {
  AdEvent_Firestore,
  Collection,
  AdFlight_Firestore,
  AdEventID,
  AdEventAction,
  ActivationID,
  MMPActivationAlias,
  UserID,
  TournamentID,
} from "@wormgraph/helpers";
import { db } from "../../api/firebase";
import { DocumentReference } from "firebase-admin/firestore";
import { getUserByEmail } from "../../api/firestore/users";
import { Activation_Firestore } from "@wormgraph/helpers";

import { notifyPubSubOfBillableActivation } from "../../api/pubsub/notify";

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
  const tournamentID = req.query.tournamentID;
  const activationID = req.query.activationID;
  let activationEventMmpAlias = req.query.mmpActivationAlias;

  if (userEmail) {
    const users = await getUserByEmail(userEmail as string);
    userID = users[0].id;
  }
  if (activationID) {
    const activationRef = db
      .collection(Collection.Activation)
      .doc(activationID as string) as DocumentReference<Activation_Firestore>;

    const activationSnapshot = await activationRef.get();

    if (activationSnapshot.exists) {
      const activation = activationSnapshot.data();
      if (activation) {
        activationEventMmpAlias = activation.mmpAlias;
      }
    }
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
      tournamentID: tournamentID as TournamentID,
    },
  };
  await adEventRef.set(adEventSchema);
  // notify pubsub of billable event to handle creation of memos
  await notifyPubSubOfBillableActivation(adEventRef.id as AdEventID);
  // end
  return adEventSchema;
};
