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
import {
  Activation_Firestore,
  OfferPreview,
  OfferPreviewForOrganizer,
  Offer_Firestore,
} from "./offer.type";

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
    startDate: payload.startDate || new Date().getTime() / 1000,
    endDate:
      payload.endDate || new Date().getTime() / 1000 + 60 * 60 * 24 * 365,
    status: (payload.status || "Planned") as OfferStatus,
    affiliateBaseLink: payload.affiliateBaseLink || "",
    mmp: (payload.mmp || "Manual") as MeasurementPartnerType,
    activations: [],
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
    const newActivations: Activation_Firestore[] = payload.activations.map(
      (activation) => {
        const activationID = uuidv4() as ActivationID;
        return {
          ...activation,
          id: activationID,
          description: activation.description || "",
          pricing: activation.pricing,
          // masterPricing: {
          //   ...activation.masterPricing,
          //   id: uuidv4() as ActivationPricingID,
          //   activationID: activationID,
          //   pricing: activation.masterPricing.pricing || 0,
          //   percentage: activation.masterPricing.percentage || 0,
          //   affiliateID: "Lootbox" as AffiliateID,
          //   affiliateType: AffiliateType.Lootbox,
          // },
        };
      }
    );
    // assumes that the activations are of valid type
    updatePayload.activations = [
      ...existingOfferDetails.activations,
      ...newActivations,
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
  const offerSnapshot = await offerRef.get();
  if (!offerSnapshot.exists) {
    return undefined;
  }
  const existingOffer = offerSnapshot.data();
  if (existingOffer === undefined) return undefined;

  const updatePayload: Partial<Offer_Firestore> = {};
  if (payload.activations != undefined) {
    // assumes that the activations are of valid type
    const updatedOffers = existingOffer.activations
      .map((act) => {
        const matchingNewActivation = payload.activations.find(
          (a) => a.id === act.id
        );
        if (matchingNewActivation) {
          return {
            ...act,
            name: matchingNewActivation.name,
            description: matchingNewActivation.description || "",
            status: matchingNewActivation.status,
            pricing: matchingNewActivation.pricing,
            // masterPricing: {
            //   ...act.masterPricing,
            //   pricing: matchingNewActivation.masterPricing.pricing || 0,
            //   percentage: matchingNewActivation.masterPricing.percentage || 0,
            // },
          };
        }
        return false;
      })
      .filter((a) => a) as Activation_Firestore[];
    updatePayload.activations = updatedOffers;
  }
  // done
  await offerRef.update(updatePayload);
  return (await offerRef.get()).data() as Offer_Firestore;
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
