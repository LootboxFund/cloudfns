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
    firstName: String!
    lastName: String!
    email: String
    wallets: [Wallet!]
    phoneNumber: String
    isEnabled: Boolean!
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

  input CreateUserPayload {
    firstName: String!
    lastName: String!
    email: EmailAddress # Optional, not used if email is in credentials
    phoneNumber: PhoneNumber # Optional, not used if phoneNumber is in credentials
    credentials: CreateUserCredentials!
  }

  type CreateUserWithWalletCredentials {
    message: String!
    signedMessage: String!
  }

  type CreateUserWithEmailCredentials {
    email: EmailAddress!
    password: String!
  }

  union CreateUserCredentials =
      CreateUserWithWalletCredentials
    | CreateUserWithEmailCredentials

  type CreateUserResponseSuccess {
    id: ID!
  }

  union CreateUserResponse = CreateUserResponseSuccess | ResponseError

  extend type Mutation {
    createUser(payload: CreateUserPayload!): CreateUserResponse
  }
`;

export default UserTypeDefs;
