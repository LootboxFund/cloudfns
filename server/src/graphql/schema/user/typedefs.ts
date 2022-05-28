import { gql } from "apollo-server";

const UserTypeDefs = gql`
  scalar Timestamp

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

  type UserResponseSuccess {
    user: User!
  }

  union GetUserResponse = UserResponseSuccess | ResponseError

  extend type Query {
    getUser(id: ID!): GetUserResponse
  }
`;

export default UserTypeDefs;
