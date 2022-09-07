import { auth } from "../firebase";
import {
  default as adminAuth,
  UpdateRequest as FirebaseUserUpdateRequest,
  UserRecord,
} from "firebase-admin/auth";
import {
  ICreateUserRequest,
  IIdentityProvider,
  IIdpUser,
  UpdateUserRequest,
} from "./interface";
import { UserIdpID } from "../../lib/types";

const ERROR_CODE_USER_NOT_FOUND = "auth/user-not-found";

const convertUserRecordToUser = (userRecord: UserRecord): IIdpUser => {
  return {
    id: userRecord.uid as UserIdpID,
    email: userRecord.email ?? "",
    phoneNumber: userRecord.phoneNumber ?? "",
    isEnabled: !userRecord.disabled,
    username: userRecord.displayName ?? "",
    avatar: userRecord.photoURL ?? "",
  };
};

class FirebaseIdentityProvider implements IIdentityProvider {
  private readonly authInstance: adminAuth.Auth;
  readonly typeName = "firebase";

  constructor(authInstance: adminAuth.Auth) {
    this.authInstance = authInstance;
  }

  async createUser({
    email,
    password,
    phoneNumber,
    emailVerified = true,
    username,
  }: ICreateUserRequest): Promise<IIdpUser> {
    const userRecord = await this.authInstance.createUser({
      email,
      password,
      emailVerified,
      phoneNumber,
      disabled: false,
      displayName: username,
    });

    // await this.generateEmailVerificationLink(email);

    return convertUserRecordToUser(userRecord);
  }

  async updateUser(id: string, request: UpdateUserRequest): Promise<IIdpUser> {
    const updateRequest: FirebaseUserUpdateRequest = {};
    if (!!request.username) {
      updateRequest.displayName = request.username;
    }
    if (!!request.avatar) {
      updateRequest.photoURL = request.avatar;
    }
    if (!!request.email) {
      updateRequest.email = request.email;
      updateRequest.emailVerified = false;
    }

    const userRecord = await this.authInstance.updateUser(id, updateRequest);

    return convertUserRecordToUser(userRecord);
  }

  async getUserById(id: string): Promise<IIdpUser | null> {
    let userRecord: UserRecord | null = null;
    try {
      userRecord = await this.authInstance.getUser(id);
    } catch (err) {
      if ((err as any)?.code === ERROR_CODE_USER_NOT_FOUND) {
        // catch this error and just return null
        return null;
      } else {
        throw err;
      }
    }

    if (userRecord == null) {
      return null;
    }

    return convertUserRecordToUser(userRecord);
  }

  async getUserByEmail(email: string): Promise<IIdpUser | null> {
    let userRecord: UserRecord | null = null;
    try {
      userRecord = await this.authInstance.getUserByEmail(email);
    } catch (err) {
      if ((err as any)?.code === ERROR_CODE_USER_NOT_FOUND) {
        // catch this error and just return null
        return null;
      } else {
        throw err;
      }
    }

    if (userRecord == null) {
      return null;
    }

    return convertUserRecordToUser(userRecord);
  }

  async verifyIDToken(token: string): Promise<UserIdpID | null> {
    try {
      if (!token) return null;

      const decodedToken = await this.authInstance.verifyIdToken(token);
      return decodedToken.uid as UserIdpID;
    } catch (error) {
      // TODO: change when we add logger
      console.log(error);
      return null;
    }
  }

  // async generateEmailVerificationLink(email: string): Promise<any> {
  //   return this.authInstance.generateEmailVerificationLink(email);
  // }

  async getSigninToken(userId: string): Promise<string> {
    const token = await auth.createCustomToken(userId);
    return token;
  }
}

const provider = new FirebaseIdentityProvider(auth);

export default provider;
