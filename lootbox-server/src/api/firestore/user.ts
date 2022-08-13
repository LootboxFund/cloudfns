import { Collection } from "./collection.types";
import { DocumentReference, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { User } from "../../graphql/generated/types";
import { IIdpUser } from "../identityProvider/interface";

interface CreateFirestoreUserPayload {
  firstName?: string;
  lastName?: string;
}

export const createUser = async (
  idpUser: IIdpUser,
  payload: CreateFirestoreUserPayload
): Promise<User> => {
  const userRef = db
    .collection(Collection.User)
    .doc(idpUser.id) as DocumentReference<User>;

  const user: User = {
    id: idpUser.id,
    ...(!!idpUser.email && { email: idpUser.email }),
    ...(!!idpUser.phoneNumber && { phoneNumber: idpUser.phoneNumber }),
    ...(!!idpUser.username && { username: idpUser.username }),
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
    deletedAt: null,
  };

  if (!!payload.firstName) {
    user.firstName = payload.firstName;
  }
  if (!!payload.lastName) {
    user.lastName = payload.lastName;
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
};

interface UpdateUserRequest {
  username?: string;
  avatar?: string;
}
export const updateUser = async (
  id: string,
  request: UpdateUserRequest
): Promise<User> => {
  const userRef = db
    .collection(Collection.User)
    .doc(id) as DocumentReference<User>;

  const user = await userRef.get();

  if (!user.exists) {
    throw new Error("User not found");
  } else {
    const userData = user.data() as User;
    const updatedUser: Partial<User> = {
      ...(!!request.username && { username: request.username }),
      ...(!!request.avatar && { avatar: request.avatar }),
      updatedAt: Timestamp.now().toMillis(),
    };
    await userRef.update(updatedUser);
    return { ...userData, ...updatedUser };
  }
};
