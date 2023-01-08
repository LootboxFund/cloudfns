import {
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "../firebase";
import { User, UserSocials } from "../../graphql/generated/types";
import { IIdpUser } from "../identityProvider/interface";
import {
  Collection,
  UserID,
  UserSocials_Firestore,
  User_Firestore,
} from "@wormgraph/helpers";

export const createUser = async (
  payload: User_Firestore
): Promise<User_Firestore> => {
  const userRef = db
    .collection(Collection.User)
    .doc(payload.id) as DocumentReference<User_Firestore>;

  await userRef.set(payload);

  return payload;
};

const parseUserData = (user: User): User_Firestore => {
  return {
    id: user.id as UserID,
    email: user.email || "",
    username: user.username || "",
    avatar: user.avatar || "",
    biography: user.biography || "",
    headshot: user.headshot || [],
    socials: { ...user.socials } as UserSocials_Firestore,
    phoneNumber: user.phoneNumber || "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getUsersByEmail = async (
  email: string
): Promise<UserWithoutWalletsOrLootboxSnapshots[]> => {
  const userRef = db
    .collection(Collection.User)
    .where("email", "==", email) as CollectionReference<User>;

  const collectionSnapshot = await userRef.get();

  if (collectionSnapshot.empty || collectionSnapshot.docs.length === 0) {
    return [];
  } else {
    return collectionSnapshot.docs.map((doc) => parseUserData(doc.data()));
  }
};

export type UserWithoutWalletsOrLootboxSnapshots = Omit<
  User,
  "wallets" | "lootboxSnapshots"
>;

export const getUser = async (
  id: string
): Promise<User_Firestore | undefined> => {
  const userRef = db
    .collection(Collection.User)
    .doc(id) as DocumentReference<User>;

  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    return undefined;
  } else {
    const user = userSnapshot.data() as User;
    return parseUserData(user);
  }
};

interface UpdateUserRequest {
  username?: string;
  avatar?: string;
  socials?: UserSocials;
  headshot?: string;
  biography?: string;
  email?: string;
  phoneNumber?: string;
}
export const updateUser = async (
  id: string,
  request: UpdateUserRequest
): Promise<User_Firestore> => {
  const userRef = db
    .collection(Collection.User)
    .doc(id) as DocumentReference<User_Firestore>;

  const user = await userRef.get();

  const userData = user.data();
  if (!user.exists || !userData) {
    throw new Error("User not found");
  }

  const updatedUser: Partial<User_Firestore> = {
    updatedAt: Timestamp.now().toMillis(),
  };

  if (request.phoneNumber !== undefined) {
    updatedUser.phoneNumber = request.phoneNumber;
  }

  if (request.email !== undefined) {
    updatedUser.email = request.email;
  }

  if (request.username !== undefined) {
    updatedUser.username = request.username;
  }

  if (request.avatar !== undefined) {
    updatedUser.avatar = request.avatar;
  }

  if (request.biography !== undefined) {
    updatedUser.biography = request.biography;
  }

  if (request.headshot !== undefined) {
    updatedUser.headshot = [request.headshot];
  }

  if (request.socials !== undefined) {
    const newSocials: Partial<UserSocials_Firestore> = { ...userData.socials };

    if (request.socials.facebook != undefined) {
      newSocials.facebook = request.socials.facebook;
    }

    if (request.socials.twitter != undefined) {
      newSocials.twitter = request.socials.twitter;
    }

    if (request.socials.discord != undefined) {
      newSocials.discord = request.socials.discord;
    }

    if (request.socials.instagram != undefined) {
      newSocials.instagram = request.socials.instagram;
    }

    if (request.socials.tiktok != undefined) {
      newSocials.tiktok = request.socials.tiktok;
    }

    if (request.socials.snapchat != undefined) {
      newSocials.snapchat = request.socials.snapchat;
    }

    if (request.socials.twitch != undefined) {
      newSocials.twitch = request.socials.twitch;
    }

    if (request.socials.web != undefined) {
      newSocials.web = request.socials.web;
    }

    updatedUser.socials = newSocials;
  }

  await userRef.update(updatedUser);
  return { ...userData, ...updatedUser };
};
