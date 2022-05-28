import { gql } from "apollo-server";

const UserTypeDefs = gql`
  type Wallet {
    id: ID!
    address: String!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String
    wallets: [Wallet!]
    phoneNumber: String
    isEnabled: Boolean!
  }
`;

export default UserTypeDefs;
