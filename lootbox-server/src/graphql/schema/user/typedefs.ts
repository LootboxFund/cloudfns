import { gql } from "apollo-server";

const UserTypeDefs = gql`
  type Wallet {
    id: ID!
    userId: ID!
    address: String!
    createdAt: Timestamp!
    lootboxSnapshots: [LootboxSnapshot!]
  }

  type User {
    id: ID!
    username: String
    avatar: String
    email: String
    phoneNumber: String
    socials: UserSocials
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
    wallets: [Wallet!]
    tournaments: [Tournament!]
    partyBaskets: [PartyBasket!]
  }

  type PublicUser {
    id: ID!
    username: String
    avatar: String
    socials: UserSocials
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
    claims(first: Int!, after: Timestamp): UserClaimsResponseSuccess
  }

  type UserSocials {
    twitter: String
    instagram: String
    tiktok: String
    facebook: String
    discord: String
    snapchat: String
    twitch: String
    web: String
  }

  input UserSocialsInput {
    twitter: String
    instagram: String
    tiktok: String
    facebook: String
    discord: String
    snapchat: String
    twitch: String
    web: String
  }

  # Queries

  type GetMyProfileSuccess {
    user: User!
  }

  type PublicUserResponseSuccess {
    user: PublicUser!
  }

  union GetMyProfileResponse = GetMyProfileSuccess | ResponseError

  union PublicUserResponse = PublicUserResponseSuccess | ResponseError

  extend type Query {
    getMyProfile: GetMyProfileResponse!
    publicUser(id: ID!): PublicUserResponse!
  }

  type CreateUserResponseSuccess {
    user: User!
  }

  union CreateUserResponse = CreateUserResponseSuccess | ResponseError

  input CreateUserWithPasswordPayload {
    email: EmailAddress!
    phoneNumber: PhoneNumber
    password: String!
  }

  input CreateUserWithWalletPayload {
    email: EmailAddress!
    phoneNumber: PhoneNumber
    message: String!
    signedMessage: String!
  }

  input UpdateUserPayload {
    username: String
    avatar: String
    socials: UserSocialsInput
  }

  type ConnectWalletResponseSuccess {
    wallet: Wallet!
  }

  type RemoveWalletResponseSuccess {
    id: ID!
  }

  type UpdateUserResponseSuccess {
    user: User!
  }

  union ConnectWalletResponse = ConnectWalletResponseSuccess | ResponseError

  union RemoveWalletResponse = RemoveWalletResponseSuccess | ResponseError

  union UpdateUserResponse = UpdateUserResponseSuccess | ResponseError

  input ConnectWalletPayload {
    message: String!
    signedMessage: String!
  }

  input AuthenticateWalletPayload {
    message: String!
    signedMessage: String!
  }

  type AuthenticateWalletResponseSuccess {
    token: String!
  }

  union AuthenticateWalletResponse =
      AuthenticateWalletResponseSuccess
    | ResponseError

  input RemoveWalletPayload {
    id: ID!
  }

  extend type Mutation {
    createUserWithPassword(
      payload: CreateUserWithPasswordPayload!
    ): CreateUserResponse!
    createUserWithWallet(
      payload: CreateUserWithWalletPayload!
    ): CreateUserResponse!
    connectWallet(payload: ConnectWalletPayload!): ConnectWalletResponse!
    authenticateWallet(
      payload: AuthenticateWalletPayload!
    ): AuthenticateWalletResponse!
    removeWallet(payload: RemoveWalletPayload!): RemoveWalletResponse!
    createUserRecord: CreateUserResponse!
    updateUser(payload: UpdateUserPayload!): UpdateUserResponse!
  }
`;

export default UserTypeDefs;
