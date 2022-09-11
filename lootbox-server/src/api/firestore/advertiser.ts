import { DocumentReference } from "firebase-admin/firestore";
import { User } from "../../graphql/generated/types";
import { AdvertiserID, UserID } from "../../lib/types";
import { db } from "../firebase";
import { Advertiser_Firestore, Conquest_Firestore } from "./advertiser.type";
import { Collection } from "./collection.types";
import { ConquestID, ConquestStatus, Currency } from "@wormgraph/helpers";

export const upgradeToAdvertiser = async (
  userID: UserID
): Promise<Advertiser_Firestore | undefined> => {
  const userRef = db
    .collection(Collection.User)
    .doc(userID) as DocumentReference<User>;
  const userSnapshot = await userRef.get();
  const user = userSnapshot.data() as User;
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc() as DocumentReference<Advertiser_Firestore>;
  const advertiser: Advertiser_Firestore = {
    id: advertiserRef.id as AdvertiserID,
    userID: userID,
    name: user.username || `New Advertiser ${advertiserRef.id}`,
    description: ``,
    offers: [],
    conquests: [],
  };
  await advertiserRef.set(advertiser);
  return advertiser;
};

export const createConquest = async (
  title: string,
  advertiserID: AdvertiserID,
  createdByUserID: UserID
) => {
  const placeholderImageConquest =
    "https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=";
  const conquestRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID)
    .collection(Collection.Conquest)
    .doc();
  const conquest: Conquest_Firestore = {
    id: conquestRef.id as ConquestID,
    title: title || "My Campaign",
    description: "",
    image: placeholderImageConquest,
    startDate: Number(new Date().getTime()),
    endDate: Number(new Date().getTime() + 60 * 60 * 24 * 90),
    advertiserID: advertiserID,
    status: ConquestStatus.PLANNED,
    spentBudget: 0,
    maxBudget: 1000,
    currency: Currency.USD,
    tournaments: [],
    createdBy: createdByUserID,
  };
  await conquestRef.set(conquest);
  return conquest;
};

export const updateConquest = async (
  conquestID: ConquestID,
  advertiserID: AdvertiserID,
  payload: Omit<UpdateConquestPayload, "id">
): Promise<Conquest_Firestore> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const conquestRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID)
    .collection(Collection.Advertiser)
    .doc(conquestID) as DocumentReference<Conquest_Firestore>;
  const updatePayload: Partial<Conquest_Firestore> = {};
  // update
  if (payload.title != undefined) {
    updatePayload.title = payload.title;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }
  if (payload.image != undefined) {
    updatePayload.image = payload.image;
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
  if (payload.maxBudget != undefined) {
    updatePayload.maxBudget = payload.maxBudget;
  }
  // done
  await conquestRef.update(updatePayload);
  return (await conquestRef.get()).data() as Conquest_Firestore;
};

// export const firestoreCreation = async (
//   userID: UserID
// ): Promise<"___Schema"> => {
//   const userRef = db
//     .collection(Collection.User)
//     .doc(userID) as DocumentReference<User>;
//   const userSnapshot = await userRef.get();
//   const user = userSnapshot.data() as User;
//   const ____Ref = db
//     .collection(Collection._____)
//     .doc()
//     .collection(Collection._____)
//     .doc() as DocumentReference<___Schema>;
// const ___createdObjectOfSchema: ___Schema = {
//     id:____Ref.id as ____ID,
//   };
//   await ____Ref.set(___createdObjectOfSchema);
//   return ___createdObjectOfSchema;
// };

// export const firestoreUpdate = async (
//   id: SomeID,
//   payload: Omit<SomeGraphQLPayload, "___someVar">
// ): Promise<"___Schema"> => {
//   if (Object.keys(payload).length === 0) {
//     throw new Error("No data provided");
//   }
//   const ____Ref = db
//     .collection(Collection._____)
//     .doc(parentID)
//     .collection(Collection._____)
//     .doc(someID) as DocumentReference<___Schema>;
//   const updatePayload: Partial<___Schema> = {};
//   // repeat
//   if (payload.__somevar != undefined) {
//     updatePayload.__somevar = payload.__somevar;
//   }
//   // until done
//   await ____Ref.update(updatePayload);
//   return (await ____Ref.get()).data() as ___Schema;
// };

// export const firestoreGet = async(
//   id: SomeID
// ): Promise<___Schema | undefined> => {
//   const ___Ref = db
//     .collection(Collection.___)
//     .doc(parentID)
//     .collection(Collection.___)
//     .doc(id) as DocumentReference<___Schema>;

//   const ____Snapshot = await ___Ref.get();

//   if (!____Snapshot.exists) {
//     return undefined;
//   } else {
//     return ____Snapshot.data();
//   }
// };
