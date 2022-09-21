import {
  ActivationStatus,
  Activation_Firestore,
  Collection,
  OfferID,
} from "@wormgraph/helpers";
import { Query } from "firebase-admin/firestore";
import { db } from "../firebase";

export const getActivationsByMmpAliasAndOfferID = async (
  offerID: OfferID,
  mmpAlias: string
): Promise<Activation_Firestore[]> => {
  const activationRef = db
    .collection(Collection.Activation)
    .where("offerID", "==", offerID)
    .where(
      "status",
      "==",
      ActivationStatus.Active
    ) as Query<Activation_Firestore>;

  const activationCollectionItems = await activationRef.get();

  if (activationCollectionItems.empty) {
    return [];
  }
  const matchingActivations = activationCollectionItems.docs.map((doc) => {
    const data = doc.data();
    return data;
  });
  return matchingActivations;
};
