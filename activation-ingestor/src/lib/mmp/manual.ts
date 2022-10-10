import type { Request } from "express";
import { PubSub } from "@google-cloud/pubsub";
import { manifest } from "../../manifest";
import {
  AdEvent_Firestore,
  Collection,
  AdEventID,
  AdEventAction,
  ActivationID,
  MMPActivationAlias,
  UserID,
  TournamentID,
  OfferID,
  AdvertiserID,
} from "@wormgraph/helpers";
import { db } from "../../api/firebase";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";
import { getUserByEmail } from "../../api/firestore/users";
import {
  Activation_Firestore,
  ActivationIngestorRoute_Manual_Body,
} from "@wormgraph/helpers";

import { notifyPubSubOfBillableActivation } from "../../api/pubsub/notify";
import { getOfferByID } from "../../api/firestore/activation";

//  * ------ DATA WE RECEIVE FROM MANUAL ENTRY ------
//  *
//  *
//  *
export const trackManualActivation = async (
  body: ActivationIngestorRoute_Manual_Body
): Promise<AdEvent_Firestore> => {
  // get the standard params from manual entry
  let userID = body.userID;
  const userEmail = body.userEmail;
  const userPhone = body.userPhone;
  const offerID = body.offerID;
  const tournamentID = body.tournamentID;
  const activationID = body.activationID;
  let activationEventMmpAlias = body.activationEventMmpAlias;
  let advertiserID;

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
        advertiserID = activation.advertiserID;
      }
    }
  }

  const adEventRef = db
    .collection(Collection.AdEvent)
    .doc() as DocumentReference<AdEvent_Firestore>;
  const adEventSchema: AdEvent_Firestore = {
    id: adEventRef.id as AdEventID,
    timestamp: Timestamp.now().toMillis(),
    action: AdEventAction.Activation,
    activationID: activationID as ActivationID,
    activationEventMmpAlias: activationEventMmpAlias as MMPActivationAlias,
    affiliateAttribution: {
      userID: userID as UserID,
      tournamentID: tournamentID as TournamentID,
    },
  };
  if (offerID) {
    const offer = await getOfferByID(offerID as OfferID);
    adEventSchema.offerID = offerID as OfferID;
    if (offer) {
      advertiserID = offer.advertiserID;
      adEventSchema.advertiserID = advertiserID as AdvertiserID;
    }
  }
  await adEventRef.set(adEventSchema);
  // notify pubsub of billable event to handle creation of memos
  await notifyPubSubOfBillableActivation(adEventRef.id as AdEventID);
  // end
  return adEventSchema;
};
