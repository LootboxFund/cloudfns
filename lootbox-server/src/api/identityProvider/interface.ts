import { UserIdpID } from "@wormgraph/helpers";

export interface IIdpUserProviderData {
  providerId: string;
}
export interface IIdpUser {
  id: UserIdpID;
  email?: string;
  isEnabled: boolean;
  phoneNumber?: string;
  username?: string;
  avatar?: string;
  emailVerified: boolean;
  providerData?: IIdpUserProviderData[];
  // claims: IClaims;
}

export interface ICreateUserRequest {
  phoneNumber?: string;
  email: string;
  password?: string; // Optional because we can use wallet signature instead
  emailVerified?: boolean;
  username?: string;
}

export interface UpdateUserRequest {
  username?: string;
  avatar?: string;
  email?: string;
}

export interface IIdentityProvider {
  readonly typeName: string;
  createUser(request: ICreateUserRequest): Promise<IIdpUser>;
  getUserById(id: string): Promise<IIdpUser | null>;
  getUserByEmail(email: string): Promise<IIdpUser | null>;
  // getUsersById(ids: string[]): Promise<Map<string, IIdpUser | null>>;
  updateUser(id: string, request: UpdateUserRequest): Promise<IIdpUser>;
  getSigninToken(userId: string): Promise<string>;
  verifyIDToken(token: string, refreshToken: string): Promise<string | null>;
  // generateEmailVerificationLink(email: string): Promise<string>;
}
