import { OfferID, UserID } from "@wormgraph/helpers";
import { DocumentReference } from "firebase-admin/firestore";
import { User } from "../../graphql/generated/types";
import { db } from "../firebase";
import { Collection } from "./collection.types";
import { Offer_Firestore } from "./offer.type";

export const createOffer = async (
  userID: UserID,
  payload: Omit<CreateOfferPayload, "id">
): Promise<Offer_Firestore> => {
  const placeholderImageOffer =
    "https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=";
  const userRef = db
    .collection(Collection.User)
    .doc(userID) as DocumentReference<User>;
  const userSnapshot = await userRef.get();
  const user = userSnapshot.data() as User;
  const offerRef = db
    .collection(Collection.Offer)
    .doc() as DocumentReference<Offer_Firestore>;
  const offer: Offer_Firestore = {
    id: offerRef.id as OfferID,
    title: payload.title,
    description: payload.description || "",
    image: payload.image || placeholderImageOffer,
    advertiserID: payload.advertiserID,
    spentBudget: 0,
    maxBudget: payload.maxBudget,
    currency: payload.currency,
    startDate: payload.startDate,
    endDate: payload.endDate,
    status: payload.status,
    affiliateBaseLink: payload.affiliateBaseLink,
    mmp: payload.mmp,
    activations: [],
    targetingTags: payload.targetingTags,
    createdByUser: userID,
  };
  await offerRef.set(offer);
  return offer;
};

export const updateOffer = async (
  id: OfferID,
  payload: Omit<EditOfferPayload, "id">
): Promise<Offer_Firestore> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const offerRef = db
    .collection(Collection.Offer)
    .doc(id) as DocumentReference<Offer_Firestore>;
  const updatePayload: Partial<Offer_Firestore> = {};
  // repeat
  if (payload.title != undefined) {
    updatePayload.title = payload.title;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }
  if (payload.image != undefined) {
    updatePayload.image = payload.image;
  }
  if (payload.maxBudget != undefined) {
    updatePayload.maxBudget = payload.maxBudget;
  }
  if (payload.startDate != undefined) {
    updatePayload.startDate = payload.startDate;
  }
  if (payload.endDate != undefined) {
    updatePayload.endDate = payload.endDate;
  }
  if (payload.status != undefined) {
    updatePayload.status = payload.status;
  }
  if (payload.targetingTags != undefined) {
    updatePayload.targetingTags = payload.targetingTags;
  }
  // done
  await offerRef.update(updatePayload);
  return (await offerRef.get()).data() as Offer_Firestore;
};

// add activations to offer
export const addActivationsToOffer = async (
  id: OfferID,
  payload: Omit<AddActivationsToOfferPayload, "id">
): Promise<Offer_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const offerRef = db
    .collection(Collection.Offer)
    .doc(id) as DocumentReference<Offer_Firestore>;
  const offerSnapshot = await offerRef.get();
  if (!offerSnapshot.exists) {
    return undefined;
  }
  const existingOfferDetails = offerSnapshot.data();
  if (!existingOfferDetails) {
    return undefined;
  }

  const updatePayload: Partial<Offer_Firestore> = {};
  if (payload.activations != undefined) {
    // assumes that the activations are of valid type
    updatePayload.activations = [
      ...existingOfferDetails.activations,
      ...payload.activations,
    ];
  }
  // done
  await offerRef.update(updatePayload);
  return (await offerRef.get()).data() as Offer_Firestore;
};

// warning! updates entire activations array, which means that it will overwrite existing activations
export const editActivationsInOffer = async (
  id: OfferID,
  payload: Omit<EditActivationsInOfferPayload, "id">
): Promise<Offer_Firestore | undefined> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const offerRef = db
    .collection(Collection.Offer)
    .doc(id) as DocumentReference<Offer_Firestore>;

  const updatePayload: Partial<Offer_Firestore> = {};
  if (payload.activations != undefined) {
    // assumes that the activations are of valid type
    updatePayload.activations = payload.activations;
  }
  // done
  await offerRef.update(updatePayload);
  return (await offerRef.get()).data() as Offer_Firestore;
};
