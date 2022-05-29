import { auth } from "../firebase";
import { default as adminAuth, UserRecord } from "firebase-admin/auth";
import { ICreateUserRequest, IIdentityProvider, IIdpUser } from "./interface";

const convertUserRecordToUser = (userRecord: UserRecord): IIdpUser => {
  return {
    id: userRecord.uid,
    email: userRecord.email ?? "",
    isEnabled: !userRecord.disabled,
    claims: userRecord.customClaims ? userRecord.customClaims : {},
  };
};

class FirebaseIdentityProvider implements IIdentityProvider {
  private readonly authInstance: adminAuth.Auth;

  constructor(authInstance: adminAuth.Auth) {
    this.authInstance = authInstance;
  }

  readonly typeName = "firebase";

  async createUser({
    email,
    password,
    phoneNumber,
    emailVerified = true,
    claims,
  }: ICreateUserRequest): Promise<IIdpUser> {
    const userRecord = await this.authInstance.createUser({
      email,
      password,
      emailVerified,
      phoneNumber,
    });
    await this.authInstance.setCustomUserClaims(userRecord.uid, claims);

    await this.generateEmailVerificationLink(email);

    return {
      id: userRecord.uid,
      email,
      claims,
      isEnabled: !userRecord.disabled,
    };
  }

  async getUserById(id: string): Promise<IIdpUser | null> {
    const userRecord = await this.authInstance.getUser(id);

    if (userRecord == null) {
      return null;
    }

    return convertUserRecordToUser(userRecord) as IIdpUser;
  }

  async verifyIDToken(token: string, refreshToken: string) {
    try {
      if (!token || !refreshToken) return null;

      const decodedToken = await this.authInstance.verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      // TODO: change when we add logger
      console.log(error);
      return null;
    }
  }

  async generateEmailVerificationLink(email: string): Promise<any> {
    return this.authInstance.generateEmailVerificationLink(email);
  }
}

const provider = new FirebaseIdentityProvider(auth);

export default provider;
