import { db } from "../api/firebase";
import * as functions from "firebase-functions";
import { logger } from "firebase-functions";
import { AdEvent_Firestore, Collection } from "@wormgraph/helpers";
import { generateMemoBills } from "../api/firestore/memo";
import { manifest } from "../manifest";
import { Message } from "firebase-functions/v1/pubsub";
import { DocumentReference } from "firebase-admin/firestore";

const REGION = manifest.cloudFunctions.region;

export const pubsubBillableActivationEvent = functions
    .region(REGION)
    .pubsub.topic(manifest.cloudFunctions.pubsubBillableActivationEvent.topic)
    .onPublish(async (message: Message) => {
        logger.log("PUB SUB TRIGGERED", {
            topic: manifest.cloudFunctions.pubsubBillableActivationEvent.topic,
            message,
        });
        // Get the AdEvent from firestore
        const AdEventID = Buffer.from(message.data, "base64").toString().trim();

        const adEventRef = db.collection(Collection.AdEvent).doc(AdEventID) as DocumentReference<AdEvent_Firestore>;
        const adEventSnapshot = await adEventRef.get();
        if (!adEventSnapshot.exists) {
            throw Error(`No AdEvent with id ${AdEventID} found`);
        }
        const adEvent = adEventSnapshot.data();
        if (!adEvent) {
            throw Error(`AdEvent with id ${AdEventID} was undefined`);
        }

        // Generate the Memos
        await generateMemoBills(adEvent);

        // end
        return;
    });
