import { Collection, UserID } from "@wormgraph/helpers";
import { CollectionReference } from "firebase-admin/firestore";
import { db } from "../firebase";

export interface BasicUser {
  id: UserID;
  email?: string;
  phoneNumber?: string;
}
export const getUserByEmail = async (email: string): Promise<BasicUser[]> => {
  const userRef = db
    .collection(Collection.User)
    .where("email", "==", email) as CollectionReference<BasicUser>;

  const collectionSnapshot = await userRef.get();

  if (collectionSnapshot.empty || collectionSnapshot.docs.length === 0) {
    return [];
  }
  return collectionSnapshot.docs.map((doc) => doc.data());
};
