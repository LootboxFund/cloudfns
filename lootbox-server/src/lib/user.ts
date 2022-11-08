import { User_Firestore, Wallet_Firestore } from "@wormgraph/helpers";
import { IIdpUser } from "../api/identityProvider/interface";
import { User } from "../graphql/generated/types";

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

export const convertUserDBToGQL = (userDB: User_Firestore): User => {
  return {
    avatar: userDB.avatar,
    biography: userDB.biography,
    createdAt: userDB.createdAt,
    deletedAt: userDB.deletedAt || null,
    email: userDB.email || null,
    headshot: userDB.headshot || null,
    id: userDB.id,
    phoneNumber: userDB.phoneNumber,
    socials: userDB.socials,
    updatedAt: userDB.updatedAt,
    username: userDB.username,
  };
};
