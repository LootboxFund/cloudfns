import {
  ActivationID,
  ActivationPricingID,
  AdTargetTag,
  AdvertiserID,
  AffiliateID,
  AffiliateType,
  Collection,
  Currency,
  MeasurementPartnerType,
  OfferID,
  OfferStatus,
  UserID,
  ActivationStatus,
  Activation_Firestore,
  Offer_Firestore,
} from "@wormgraph/helpers";
import { v4 as uuidv4 } from "uuid";
import { DocumentReference, Query } from "firebase-admin/firestore";
import {
  CreateOfferPayload,
  CreateOfferResponse,
  EditOfferPayload,
  User,
} from "../../graphql/generated/types";
import { db } from "../firebase";
import { EditActivationsInOfferPayload } from "../../graphql/generated/types";
import { AddActivationsToOfferPayload } from "../../graphql/generated/types";
import { OfferPreview, OfferPreviewForOrganizer } from "./offer.type";

export const createOffer = async (
  advertiserID: AdvertiserID,
  payload: Omit<CreateOfferPayload, "id">
): Promise<Offer_Firestore> => {
  const placeholderImageOffer =
    "https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=";
  // const userRef = db
  //   .collection(Collection.User)
  //   .doc(userID) as DocumentReference<User>;
  // const userSnapshot = await userRef.get();
  // const user = userSnapshot.data() as User;
  const offerRef = db
    .collection(Collection.Offer)
    .doc() as DocumentReference<Offer_Firestore>;
  const offer: Offer_Firestore = {
    id: offerRef.id as OfferID,
    title: payload.title,
    description: payload.description || "",
    image: payload.image || placeholderImageOffer,
    advertiserID: payload.advertiserID as AdvertiserID,
    spentBudget: 0,
    maxBudget: payload.maxBudget || 1000,
    // currency: Currency.Usd, // payload.currency || Currency.Usd,
    startDate: payload.startDate || new Date().getTime(),
    endDate: payload.endDate || new Date().getTime() + 60 * 60 * 24 * 365,
    status: (payload.status || "Planned") as OfferStatus,
    affiliateBaseLink: payload.affiliateBaseLink || "",
    mmp: (payload.mmp || "Manual") as MeasurementPartnerType,
    adSets: [],
    //targetingTags: [], // payload.targetingTags as AdTargetTag[],
  };
  await offerRef.set(offer);
  return offer;
};

export const editOffer = async (
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
    updatePayload.status = (payload.status || "Planned") as OfferStatus;
  }
  // if (payload.targetingTags != undefined) {
  //updatePayload.targetingTags = []; //payload.targetingTags as AdTargetTag[];
  // }
  // done
  await offerRef.update(updatePayload);
  return (await offerRef.get()).data() as Offer_Firestore;
};

// add activations to offer
export const addActivationsToOffer = async (
  id: OfferID,
  payload: Omit<AddActivationsToOfferPayload, "id">
): Promise<Activation_Firestore[]> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const activationsQueue: {
    ref: DocumentReference<Activation_Firestore>;
    obj: Activation_Firestore;
  }[] = [];
  for (let i = 0; i < payload.activations.length; i++) {
    const activationRef = db
      .collection(Collection.Activation)
      .doc() as DocumentReference<Activation_Firestore>;
    const obj: Activation_Firestore = {
      id: activationRef.id as ActivationID,
      name: payload.activations[i].name,
      description: payload.activations[i].description || "",
      pricing: payload.activations[i].pricing,
      status: payload.activations[i].status,
      mmpAlias: payload.activations[i].mmpAlias,
      offerID: payload.activations[i].offerID as OfferID,
    };
    activationsQueue.push({ ref: activationRef, obj });
  }
  await Promise.all(
    activationsQueue.map(({ ref, obj }) => {
      return ref.set(obj);
    })
  );
  return activationsQueue.map(({ obj }) => obj);
};

// warning! updates entire activations array, which means that it will overwrite existing activations
export const editActivationsInOffer = async (
  id: OfferID,
  payload: Omit<EditActivationsInOfferPayload, "id">
): Promise<Activation_Firestore[]> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const existingActivationsSnapshots = await Promise.all(
    payload.activations.map((act) => {
      const activationRef = db
        .collection(Collection.Activation)
        .doc(act.id) as DocumentReference<Activation_Firestore>;
      return activationRef.get();
    })
  );
  const existingActivations = existingActivationsSnapshots
    .map((snap) => {
      if (!snap.exists) {
        return undefined;
      }
      const existingObj = snap.data();
      return existingObj;
    })
    .filter((o) => o)
    .map((o) => o as Activation_Firestore);

  await Promise.all(
    existingActivations.map((act) => {
      const actInput = payload.activations.find((a) => a.id === act.id);
      const updatePayload: Partial<Activation_Firestore> = {};
      if (actInput && actInput.name) {
        updatePayload.name = actInput.name;
      }
      if (actInput && actInput.description) {
        updatePayload.description = actInput.description;
      }
      if (actInput && actInput.pricing) {
        updatePayload.pricing = actInput.pricing;
      }
      if (actInput && actInput.status) {
        updatePayload.status = actInput.status as ActivationStatus;
      }
      if (actInput && actInput.mmpAlias) {
        updatePayload.mmpAlias = actInput.mmpAlias;
      }
      const activationRef = db
        .collection(Collection.Activation)
        .doc(act.id) as DocumentReference<Activation_Firestore>;
      return activationRef.update(updatePayload);
    })
  );
  const updatedActivations = (
    await Promise.all(
      payload.activations.map((act) => {
        const activationRef = db
          .collection(Collection.Activation)
          .doc(act.id) as DocumentReference<Activation_Firestore>;
        return activationRef.get();
      })
    )
  ).map((snap) => snap.data() as Activation_Firestore);
  return updatedActivations;
};

//
export const listCreatedOffers = async (
  advertiserID: AdvertiserID
): Promise<OfferPreview[] | undefined> => {
  const offerRef = db
    .collection(Collection.Offer)
    .where("advertiserID", "==", advertiserID) as Query<Offer_Firestore>;

  const offersSnapshot = await offerRef.get();

  if (offersSnapshot.empty) {
    return [];
  }
  const offerPreviews = offersSnapshot.docs.map((doc) => {
    const data = doc.data();
    const preview: OfferPreview = {
      id: doc.id as OfferID,
      title: data.title,
      description: data.description,
      image: data.image,
      advertiserID: data.advertiserID,
      spentBudget: data.spentBudget,
      maxBudget: data.maxBudget,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      // targetingTags: data.targetingTags,
    };
    return preview;
  });
  return offerPreviews;
};

//
export const viewCreatedOffer = async (
  offerID: OfferID
): Promise<Offer_Firestore | undefined> => {
  const offerRef = db
    .collection(Collection.Offer)
    .doc(offerID) as DocumentReference<Offer_Firestore>;

  const offerSnapshot = await offerRef.get();

  if (!offerSnapshot.exists) {
    return undefined;
  } else {
    return offerSnapshot.data();
  }
};

// //
// export const listOffersAvailableForOrganizer = async (
//   affiliateID: AffiliateID
// ): Promise<OfferPreviewForOrganizer[] | undefined> => {
//   const offersRef = db
//     .collection(Collection.Offer)
//     .where("status", "==", OfferStatus.ACTIVE)
//     .orderBy("timestamps.createdAt", "desc") as Query<Offer_Firestore>;

//   const offersSnapshot = await offersRef.get();

//   if (offersSnapshot.empty) {
//     return [];
//   }
//   const offerPreviews = offersSnapshot.docs.map((doc) => {
//     const data = doc.data();
//     const preview: OfferPreviewForOrganizer = {
//       id: doc.id as OfferID,
//       title: data.title,
//       description: data.description,
//       image: data.image,
//       advertiserID: data.advertiserID,
//       spentBudget: data.spentBudget,
//       maxBudget: data.maxBudget,
//       currency: data.currency,
//       startDate: data.startDate,
//       endDate: data.endDate,
//       status: data.status,
//       targetingTags: data.targetingTags,
//     };
//     return preview;
//   });
//   return offerPreviews;
// };

export const listActiveActivationsForOffer = async (
  offerID: OfferID
): Promise<Activation_Firestore[]> => {
  const activationsRef = db
    .collection(Collection.Activation)
    .where("offerID", "==", offerID)
    .orderBy("timestamps.createdAt", "desc") as Query<Activation_Firestore>;

  const activationItems = await activationsRef.get();

  if (activationItems.empty) {
    return [];
  }
  const activeActivations = activationItems.docs
    .map((doc) => {
      const data = doc.data();
      return data;
    })
    .filter((act) => act.status === ActivationStatus.Active);
  return activeActivations;
};
