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

export type UserWithoutWalletsOrLootboxSnapshots = Omit<
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

    if (request.username !== undefined) {
      updatedUser.username = request.username;
    }

    if (request.avatar !== undefined) {
      updatedUser.avatar = request.avatar;
    }

    if (request.socials !== undefined) {
      const newSocials: Partial<UserSocials> = { ...userData.socials };

      if (request.socials.facebook !== undefined) {
        newSocials.facebook = request.socials.facebook;
      }

      if (request.socials.twitter !== undefined) {
        newSocials.twitter = request.socials.twitter;
      }

      if (request.socials.discord !== undefined) {
        newSocials.discord = request.socials.discord;
      }

      if (request.socials.instagram !== undefined) {
        newSocials.instagram = request.socials.instagram;
      }

      if (request.socials.tiktok !== undefined) {
        newSocials.tiktok = request.socials.tiktok;
      }

      if (request.socials.snapchat !== undefined) {
        newSocials.snapchat = request.socials.snapchat;
      }

      if (request.socials.twitch !== undefined) {
        newSocials.twitch = request.socials.twitch;
      }

      if (request.socials.web !== undefined) {
        newSocials.web = request.socials.web;
      }

      updatedUser.socials = newSocials;
    }

    await userRef.update(updatedUser);
    return { ...userData, ...updatedUser };
  }
};
