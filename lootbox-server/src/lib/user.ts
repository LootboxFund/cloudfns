import { User_Firestore, Wallet_Firestore } from "@wormgraph/helpers";
import { IIdpUser } from "../api/identityProvider/interface";

/** determines if a user is loosely defined as Anonymous */
export const isAnon = (
  userIDP: IIdpUser,
  userDB: User_Firestore,
  userWallets: Wallet_Firestore[]
): boolean => {
  if (
    userIDP.email ||
    userIDP.emailVerified ||
    userIDP.phoneNumber ||
    // userDB.email ||  // this is not a good check because this field can exist, but it might not be linked to credentials. Thus, we check the IDP email
    userDB.phoneNumber ||
    userWallets.length > 0 ||
    (userIDP.providerData && userIDP.providerData.length > 0)
  ) {
    return false;
  }

  return true;
};
