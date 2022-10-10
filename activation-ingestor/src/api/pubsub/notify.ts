import { PubSub, Topic } from "@google-cloud/pubsub";
import { AdEventID } from "@wormgraph/helpers";
import { manifest } from "../../manifest";

export const notifyPubSubOfBillableActivation = async (
  adEventID: AdEventID
) => {
  console.log(
    `--- Notifying PubSub called ${manifest.cloudFunctions.pubsubBillableActivationEvent.topic} from project ${manifest.firebase.projectId}`
  );
  const pubsub = new PubSub({ projectId: manifest.firebase.projectId });
  const topic = pubsub.topic(
    manifest.cloudFunctions.pubsubBillableActivationEvent.topic
  );
  // notify pubsub of billable event to handle creation of memos
  const pubSubMessage = Buffer.from(adEventID);
  const callback = (err, messageId) => {
    if (err) {
      console.log(err);
    }
  };
  topic.publishMessage({ data: pubSubMessage }, callback);
  await new Promise((r) => setTimeout(r, 300));
};
