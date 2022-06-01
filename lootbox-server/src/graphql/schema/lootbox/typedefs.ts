import { gql } from "apollo-server";

const LootboxTypeDefs = gql`
  type Lootbox {
    id: ID!
    address: String!
  }

  type LootboxSnapshot {
    address: String!
  }

  type LootboxResponseSuccess {
    lootbox: Lootbox!
  }

  union GetLootboxByAddressResponse = LootboxResponseSuccess | ResponseError

  extend type Query {
    getLootboxByAddress(address: ID!): GetLootboxByAddressResponse
  }
`;

export default LootboxTypeDefs;
