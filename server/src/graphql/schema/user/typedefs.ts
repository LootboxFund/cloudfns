import { gql } from "apollo-server";

const UserTypeDefs = gql`
  type Wallet {
    id: ID!
    userId: ID!
    address: String!
    createdAt: Timestamp!
  }

  type User {
    id: ID!
    firstName: String
    lastName: String
    email: String!
    wallets: [Wallet!]
    phoneNumber: String
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  # Queries

  type GetMyProfileSuccess {
    user: User!
  }

  union GetMyProfileResponse = GetMyProfileSuccess | ResponseError

  extend type Query {
    getMyProfile: GetMyProfileResponse!
  }

  # Mutations

  input CreateUserWithWalletCredentials {
    message: String!
    signedMessage: String!
  }

  type CreateUserResponseSuccess {
    id: ID!
  }

  union CreateUserResponse = CreateUserResponseSuccess | ResponseError

  input CreateUserPayload {
    firstName: String
    lastName: String
    email: EmailAddress!
    phoneNumber: PhoneNumber
    password: String # Optional, not used if walletCredentials exists
    walletCredentials: CreateUserWithWalletCredentials
  }

  type ConnectWalletResponseSuccess {
    wallet: Wallet!
  }

  union ConnectWalletResponse = ConnectWalletResponseSuccess | ResponseError

  input ConnectWalletPayload {
    message: String!
    signedMessage: String!
  }

  extend type Mutation {
    createUser(payload: CreateUserPayload!): CreateUserResponse!
    connectWallet(payload: ConnectWalletPayload!): ConnectWalletResponse!
  }
`;

export default UserTypeDefs;
