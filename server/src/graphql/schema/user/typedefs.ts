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

  type UserResponseSuccess {
    user: User!
  }

  union GetUserResponse = UserResponseSuccess | ResponseError

  extend type Query {
    getUser(id: ID!): GetUserResponse
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

  type AuthenticateWalletResponseSuccess {
    token: String!
  }

  union AuthenticateWalletResponse =
      AuthenticateWalletResponseSuccess
    | ResponseError

  input AuthenticateWalletPayload {
    message: String!
    signedMessage: String!
  }

  extend type Mutation {
    createUser(payload: CreateUserPayload!): CreateUserResponse
    authenticateWallet(
      payload: AuthenticateWalletPayload!
    ): AuthenticateWalletResponse
  }
`;

export default UserTypeDefs;
