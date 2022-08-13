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
    firstName: String @deprecated(reason: "Replaced with username!")
    lastName: String @deprecated(reason: "Replaced with username!")
    avatar: String
    email: String
    phoneNumber: String
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
    wallets: [Wallet!]
    tournaments: [Tournament!]
    partyBaskets: [PartyBasket!]
  }

  # type UserSocials {
  #   twitter: String
  #   instagram: String
  #   tiktok: String
  #   facebook: String
  #   discord: String
  #   snapchat: String
  #   twitch: String
  #   web: String
  # }

  # Queries

  type GetMyProfileSuccess {
    user: User!
  }

  union GetMyProfileResponse = GetMyProfileSuccess | ResponseError

  extend type Query {
    getMyProfile: GetMyProfileResponse!
  }

  type CreateUserResponseSuccess {
    user: User!
  }

  union CreateUserResponse = CreateUserResponseSuccess | ResponseError

  input CreateUserWithPasswordPayload {
    firstName: String
    lastName: String
    email: EmailAddress!
    phoneNumber: PhoneNumber
    password: String!
  }

  input CreateUserWithWalletPayload {
    firstName: String
    lastName: String
    email: EmailAddress!
    phoneNumber: PhoneNumber
    message: String!
    signedMessage: String!
  }

  input UpdateUserPayload {
    username: String
    avatar: String
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
