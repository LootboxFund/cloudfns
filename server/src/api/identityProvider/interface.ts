export type IClaims = any; // TODO refine this

export interface IIdpUser {
  id: string;
  email?: string;
  claims: IClaims;
  isEnabled: boolean;
  phoneNumber?: string;
}

export interface ICreateUserRequest {
  phoneNumber?: string;
  email?: string;
  password?: string; // Optional because we can use wallet signature instead
  emailVerified?: boolean;
  claims: IClaims;
}

export interface IIdentityProvider {
  readonly typeName: string;
  createUser(request: ICreateUserRequest): Promise<IIdpUser>;
  getUserById(id: string): Promise<IIdpUser | null>;
  // getUserByEmail(email: string): Promise<IIdpUser | null>;
  // getUsersById(ids: string[]): Promise<Map<string, IIdpUser | null>>;
  // updateUser(id: string, request: IUpdateUserRequest): Promise<void>;
  verifyIDToken(token: string, refreshToken: string): Promise<string | null>;
  generateEmailVerificationLink(email: string): Promise<string>;
}
