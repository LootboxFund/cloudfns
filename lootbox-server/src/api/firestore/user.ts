import { Collection } from "./collection.types";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { User, UserSocials } from "../../graphql/generated/types";
import { IIdpUser } from "../identityProvider/interface";

export const createUser = async (idpUser: IIdpUser): Promise<User> => {
  const userRef = db
    .collection(Collection.User)
    .doc(idpUser.id) as DocumentReference<User>;

  const user: User = {
    id: idpUser.id,
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
    deletedAt: null,
  };

  if (!!idpUser.email) {
    user.email = idpUser.email;
  }

  if (!!idpUser.phoneNumber) {
    user.phoneNumber = idpUser.phoneNumber;
  }

  if (!!idpUser.username) {
    user.username = idpUser.username;
  }

  await userRef.set(user);

  return user;
};

type UserWithoutWalletsOrLootboxSnapshots = Omit<
  User,
  "wallets" | "lootboxSnapshots"
>;

export const getUser = async (
  id: string
): Promise<UserWithoutWalletsOrLootboxSnapshots | undefined> => {
  const userRef = db
    .collection(Collection.User)
    .doc(id) as DocumentReference<User>;

  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    return undefined;
  } else {
    const user = userSnapshot.data() as User;
    return {
      id: userSnapshot.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      socials: { ...user.socials },
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
};

interface UpdateUserRequest {
  username?: string;
  avatar?: string;
  socials?: UserSocials;
}
export const updateUser = async (
  id: string,
  request: UpdateUserRequest
): Promise<User> => {
  const userRef = db
    .collection(Collection.User)
    .doc(id) as DocumentReference<User>;

  const user = await userRef.get();

  const userData = user.data();
  if (!user.exists || !userData) {
    throw new Error("User not found");
  } else {
    const updatedUser: Partial<User> = {
      updatedAt: Timestamp.now().toMillis(),
    };

    if (!!request.username) {
      updatedUser.username = request.username;
    }

    if (!!request.avatar) {
      updatedUser.avatar = request.avatar;
    }

    if (!!request.socials) {
      const newSocials: Partial<UserSocials> = { ...userData.socials };

      if (!!request.socials.facebook) {
        newSocials.facebook = request.socials.facebook;
      }

      if (!!request.socials.twitter) {
        newSocials.twitter = request.socials.twitter;
      }

      if (!!request.socials.discord) {
        newSocials.discord = request.socials.discord;
      }

      if (!!request.socials.instagram) {
        newSocials.instagram = request.socials.instagram;
      }

      if (!!request.socials.tiktok) {
        newSocials.tiktok = request.socials.tiktok;
      }

      if (!!request.socials.snapchat) {
        newSocials.snapchat = request.socials.snapchat;
      }

      if (!!request.socials.twitch) {
        newSocials.twitch = request.socials.twitch;
      }

      if (!!request.socials.web) {
        newSocials.web = request.socials.web;
      }

      updatedUser.socials = newSocials;
    }

    await userRef.update(updatedUser);
    return { ...userData, ...updatedUser };
  }
};
