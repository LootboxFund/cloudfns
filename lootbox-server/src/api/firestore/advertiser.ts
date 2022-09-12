import { DocumentReference, Query } from "firebase-admin/firestore";
import {
  User,
  Tournament,
  UpdateAdvertiserDetailsPayload,
} from "../../graphql/generated/types";
import { AdvertiserID, UserID } from "../../lib/types";
import { db } from "../firebase";
import {
  Advertiser_Firestore,
  ConquestWithTournaments_ReplaceMeWithGQLGeneratedTypes,
  Conquest_Firestore,
  TournamentPreviewInConquest,
} from "./advertiser.type";
import { Collection } from "./collection.types";
import {
  ConquestID,
  ConquestStatus,
  Currency,
  TournamentID,
} from "@wormgraph/helpers";

export const upgradeToAdvertiser = async (
  userID: UserID
): Promise<Advertiser_Firestore | undefined> => {
  const existingAdvertiserRef = db
    .collection(Collection.Advertiser)
    .where("userID", "==", userID);
  const existingAdvertisers = await existingAdvertiserRef.get();
  if (!existingAdvertisers.empty) {
    const exad = existingAdvertisers.docs.map((doc) => doc.data())[0];
    throw Error(`User is already an advertiser ${exad.id}`);
  }

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

export const updateAdvertiserDetails = async (
  advertiserID: AdvertiserID,
  payload: Omit<UpdateAdvertiserDetailsPayload, "___someVar">
): Promise<Advertiser_Firestore> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("No data provided");
  }
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;
  const updatePayload: Partial<Advertiser_Firestore> = {};
  // repeat
  if (payload.name != undefined) {
    updatePayload.name = payload.name;
  }
  if (payload.description != undefined) {
    updatePayload.description = payload.description;
  }
  // until done
  await advertiserRef.update(updatePayload);
  return (await advertiserRef.get()).data() as Advertiser_Firestore;
};

// export const createConquest = async (
//   title: string,
//   advertiserID: AdvertiserID,
//   createdByUserID: UserID
// ) => {
//   const placeholderImageConquest =
//     "https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=";
//   const conquestRef = db
//     .collection(Collection.Advertiser)
//     .doc(advertiserID)
//     .collection(Collection.Conquest)
//     .doc();
//   const conquest: Conquest_Firestore = {
//     id: conquestRef.id as ConquestID,
//     title: title || "My Campaign",
//     description: "",
//     image: placeholderImageConquest,
//     startDate: Number(new Date().getTime()),
//     endDate: Number(new Date().getTime() + 60 * 60 * 24 * 90),
//     advertiserID: advertiserID,
//     status: ConquestStatus.PLANNED,
//     spentBudget: 0,
//     maxBudget: 1000,
//     currency: Currency.USD,
//     tournaments: [],
//     createdBy: createdByUserID,
//   };
//   await conquestRef.set(conquest);
//   return conquest;
// };

// export const updateConquest = async (
//   conquestID: ConquestID,
//   advertiserID: AdvertiserID,
//   payload: Omit<UpdateConquestPayload, "id">
// ): Promise<Conquest_Firestore> => {
//   if (Object.keys(payload).length === 0) {
//     throw new Error("No data provided");
//   }
//   const conquestRef = db
//     .collection(Collection.Advertiser)
//     .doc(advertiserID)
//     .collection(Collection.Advertiser)
//     .doc(conquestID) as DocumentReference<Conquest_Firestore>;
//   const updatePayload: Partial<Conquest_Firestore> = {};
//   // update
//   if (payload.title != undefined) {
//     updatePayload.title = payload.title;
//   }
//   if (payload.description != undefined) {
//     updatePayload.description = payload.description;
//   }
//   if (payload.image != undefined) {
//     updatePayload.image = payload.image;
//   }
//   if (payload.startDate != undefined) {
//     updatePayload.startDate = payload.startDate;
//   }
//   if (payload.endDate != undefined) {
//     updatePayload.endDate = payload.endDate;
//   }
//   if (payload.status != undefined) {
//     updatePayload.status = payload.status;
//   }
//   if (payload.maxBudget != undefined) {
//     updatePayload.maxBudget = payload.maxBudget;
//   }
//   // done
//   await conquestRef.update(updatePayload);
//   return (await conquestRef.get()).data() as Conquest_Firestore;
// };

export const advertiserAdminView = async (
  advertiserID: AdvertiserID
): Promise<Advertiser_Firestore | undefined> => {
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;

  const advertiserSnapshot = await advertiserRef.get();

  if (!advertiserSnapshot.exists) {
    return undefined;
  } else {
    return advertiserSnapshot.data();
  }
};

type PublicAdvertiserView = Omit<
  Advertiser_Firestore,
  "conquests" | "offers" | "userID"
>;
export const advertiserPublicView = async (
  advertiserID: AdvertiserID
): Promise<PublicAdvertiserView | undefined> => {
  const advertiserRef = db
    .collection(Collection.Advertiser)
    .doc(advertiserID) as DocumentReference<Advertiser_Firestore>;

  const advertiserSnapshot = await advertiserRef.get();
  const adv = advertiserSnapshot.data();

  if (!advertiserSnapshot.exists || !adv) {
    return undefined;
  } else {
    return {
      id: adv.id,
      name: adv.name,
      description: adv.description,
    };
  }
};

// export const listConquests = async (
//   advertiserID: AdvertiserID
// ): Promise<Conquest_Firestore[] | undefined> => {
//   const conquestsRef = db
//     .collection(Collection.Advertiser)
//     .doc(advertiserID)
//     .collection(Collection.Conquest)
//     .where("advertiserID", "==", advertiserID)
//     .orderBy("timestamps.createdAt", "desc") as Query<Conquest_Firestore>;

//   const conquests = await conquestsRef.get();

//   if (conquests.empty) {
//     return [];
//   } else {
//     return conquests.docs.map((doc) => {
//       const data = doc.data();
//       return {
//         id: data.id,
//         title: data.title,
//         description: data.description,
//         image: data.image,
//         startDate: data.startDate,
//         endDate: data.endDate,
//         advertiserID: data.advertiserID,
//         status: data.status,
//         spentBudget: data.spentBudget,
//         maxBudget: data.maxBudget,
//         currency: data.currency,
//         tournaments: data.tournaments,
//         createdBy: data.createdBy,
//       };
//     });
//   }
// };

// export const getConquest = async (
//   advertiserID: AdvertiserID,
//   conquestID: ConquestID
// ): Promise<
//   ConquestWithTournaments_ReplaceMeWithGQLGeneratedTypes | undefined
// > => {
//   const placeholderImageTournament =
//     "https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=";
//   const conquestRef = db
//     .collection(Collection.Advertiser)
//     .doc(advertiserID)
//     .collection(Collection.Conquest)
//     .doc(conquestID) as DocumentReference<Conquest_Firestore>;

//   const conquestSnapshot = await conquestRef.get();
//   const conquestData = conquestSnapshot.data();
//   if (!conquestSnapshot.exists || !conquestData) return undefined;

//   const tournamentsRef = db
//     .collection(Collection.Tournament)
//     .where("id", "in", conquestData.tournaments) as Query<Tournament>;

//   const tournamentSnapshot = await tournamentsRef.get();

//   if (tournamentSnapshot.empty) {
//     return {
//       conquest: conquestData,
//       tournaments: [] as TournamentPreviewInConquest[],
//     };
//   }
//   const tournamentsPreviewInConquest = tournamentSnapshot.docs.map((doc) => {
//     const data = doc.data();
//     const preview: TournamentPreviewInConquest = {
//       id: doc.id as TournamentID,
//       title: data.title,
//       coverPhoto: data.coverPhoto || placeholderImageTournament,
//     };
//     return preview;
//   });
//   return {
//     conquest: conquestData,
//     tournaments: tournamentsPreviewInConquest,
//   };
// };
