import { AffiliateID, UserID } from "@wormgraph/helpers";
import { DocumentReference } from "firebase-admin/firestore";
import { User } from "../../graphql/generated/types";
import { db } from "../firebase";
import { Affiliate_Firestore } from "./affiliate.type";
import { Collection } from "./collection.types";

export const upgradeToAffiliate = async (
  userID: UserID
): Promise<Affiliate_Firestore> => {
  const userRef = db
    .collection(Collection.User)
    .doc(userID) as DocumentReference<User>;
  const userSnapshot = await userRef.get();
  const user = userSnapshot.data() as User;
  const affiliateRef = db
    .collection(Collection.Affiliate)
    .doc() as DocumentReference<Affiliate_Firestore>;
  const affiliate: Affiliate_Firestore = {
    id: affiliateRef.id as AffiliateID,
    userID: userID,
    name: user.username || `New Affiliate ${affiliateRef.id}`,
  };
  await affiliateRef.set(affiliate);
  return affiliate;
};
