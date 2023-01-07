import {
  UserID,
  UserSocials_Firestore,
  User_Firestore,
} from "@wormgraph/helpers";
import { Timestamp } from "firebase-admin/firestore";
import { createUser, getUser } from "../api/firestore";
import identityProvider from "../api/identityProvider";
import {
  getRandomPortraitFromLexicaHardcoded,
  getRandomUserName,
} from "../api/lexica-images";
import { formatEmail } from "../lib/utils";

type CreateUserServiceRequestAuthOpts =
  | {
      // Anonymous users
      email?: string;
    }
  | {
      // email & pw
      email: string;
      password: string;
    }
  | {
      // Phone users
      email?: string;
      phone: string;
    };

interface CreateUserServiceRequest {
  username?: string;
  avatar?: string;
  socials?: UserSocials_Firestore;
  biography?: string;
  authOpts?: CreateUserServiceRequestAuthOpts;
}

export const create = async (
  request: CreateUserServiceRequest
): Promise<User_Firestore> => {
  // Make sure the user does not exist
  const requestedEmail = request.authOpts?.email
    ? formatEmail(request.authOpts.email)
    : undefined;

  if (requestedEmail) {
    const _idpUser = await identityProvider.getUserByEmail(requestedEmail);
    if (!!_idpUser && _idpUser.emailVerified) {
      throw new Error("Email already in use");
    }
  }
  if (request.authOpts && "phone" in request.authOpts) {
    const _idpUser = await identityProvider.getUserByPhoneNumber(
      request.authOpts.phone
    );
    if (!!_idpUser) {
      throw new Error("Phone number already in use");
    }
  }

  const [username, avatar] = await Promise.all([
    request.username ||
      getRandomUserName({ type: "user", seedEmail: requestedEmail }),
    request.avatar || getRandomPortraitFromLexicaHardcoded(),
  ]);

  const idpUser = await identityProvider.createUser({
    email: requestedEmail,
    phoneNumber:
      request.authOpts && "phone" in request.authOpts
        ? request.authOpts.phone
        : undefined,
    emailVerified: false,
    password:
      request.authOpts && "password" in request.authOpts
        ? request.authOpts.password
        : undefined,
    username,
    avatar,
  });

  const userDB = await createUserDBFromIDP({
    userID: idpUser.id as unknown as UserID,
    biography: request.biography,
    socials: request.socials,
  });

  return userDB;
};

interface CreateUserDBServiceRequest {
  userID: UserID;
  biography?: string;
  socials?: UserSocials_Firestore;
  unverifiedEmail?: string;
}

export const createUserDBFromIDP = async (
  request: CreateUserDBServiceRequest
): Promise<User_Firestore> => {
  const idpUser = await identityProvider.getUserById(request.userID);
  if (!idpUser || !idpUser.id) {
    throw new Error("IDP user not found");
  }

  const dbUser = await getUser(idpUser.id);

  if (!!dbUser) {
    // User is already created
    return dbUser;
  }

  const [username, avatar] = await Promise.all([
    idpUser?.username ||
      getRandomUserName({
        type: "user",
        seedEmail: idpUser?.email || undefined,
      }),
    idpUser?.avatar || getRandomPortraitFromLexicaHardcoded(),
  ]);

  const newUserBody: User_Firestore = {
    id: idpUser.id as unknown as UserID,
    username,
    avatar,
    headshot: [],
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
    deletedAt: null,
  };

  if (idpUser.email) {
    newUserBody.email = formatEmail(idpUser.email);
  } else if (request.unverifiedEmail) {
    // We add the email to our DB if the user provided the email address. However, we don't want to
    // update the underlying AUTH user object because firebase will force a token refresh, invalidating
    // the users current token. This will kinda fuck with the viral onboarding flow. So just update
    // the database object and then later the user can confirm it in their profile.
    newUserBody.email = formatEmail(request.unverifiedEmail);
  }

  if (idpUser.phoneNumber) {
    newUserBody.phoneNumber = idpUser.phoneNumber;
  }

  if (request.biography) {
    newUserBody.biography = request.biography;
  }

  if (request.socials) {
    newUserBody.socials = request.socials;
  }

  // TODO: make username unique

  const userDB = await createUser(newUserBody);

  // NOTE: we are NOT updating idp object with unverified email... see comment above
  const shouldUpdateIDP = idpUser?.username !== userDB.username;

  if (shouldUpdateIDP) {
    await identityProvider.updateUser(userDB.id, {
      username: userDB.username,
    });
  }

  return userDB;
};
