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
    email: idpUser.email,
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
    deletedAt: null,
  };

  if (idpUser.phoneNumber) {
    user.phoneNumber = idpUser.phoneNumber;
  }
  if (payload.firstName) {
    user.firstName = payload.firstName;
  }
  if (payload.lastName) {
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
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
};
