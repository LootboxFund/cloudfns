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
    firstName: String
    lastName: String
    email: String!
    phoneNumber: String
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
    wallets: [Wallet!]
  }

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

  type ConnectWalletResponseSuccess {
    wallet: Wallet!
  }

  union ConnectWalletResponse = ConnectWalletResponseSuccess | ResponseError

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
  }
`;

export default UserTypeDefs;
