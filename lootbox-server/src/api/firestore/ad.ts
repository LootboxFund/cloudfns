import { DocumentReference } from "firebase-admin/firestore";
import { Ad } from "../../graphql/generated/types";
import { AdID } from "../../lib/types";
import { db } from "../firebase";
import { Collection } from "./collection.types";

export const getAdById = async (adId: AdID): Promise<Ad | undefined> => {
  const adRef = db.collection(Collection.Ad).doc(adId) as DocumentReference<Ad>;
  const data = await adRef.get();
  if (data.exists) {
    return data.data();
  } else {
    return undefined;
  }
};
