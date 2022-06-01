import { UserIdpID } from "../../lib/types";

export interface IIdpUser {
  id: UserIdpID;
  email: string;
  isEnabled: boolean;
  phoneNumber?: string;
  // claims: IClaims;
}

export interface ICreateUserRequest {
  phoneNumber?: string;
  email: string;
  password?: string; // Optional because we can use wallet signature instead
  emailVerified?: boolean;
}

export interface IIdentityProvider {
  readonly typeName: string;
  createUser(request: ICreateUserRequest): Promise<IIdpUser>;
  getUserById(id: string): Promise<IIdpUser | null>;
  // getUserByEmail(email: string): Promise<IIdpUser | null>;
  // getUsersById(ids: string[]): Promise<Map<string, IIdpUser | null>>;
  // updateUser(id: string, request: IUpdateUserRequest): Promise<void>;
  getSigninToken(userId: string): Promise<string>;
  verifyIDToken(token: string, refreshToken: string): Promise<string | null>;
  generateEmailVerificationLink(email: string): Promise<string>;
}
