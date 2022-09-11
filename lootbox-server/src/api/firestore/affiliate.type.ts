import { AffiliateID, UserID } from "../../lib/types";

export interface Affiliate_Firestore {
  id: AffiliateID;
  userID: UserID;
  name: string;
}
