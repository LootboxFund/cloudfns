import { gql } from "apollo-server";

const TournamentTypeDefs = gql`
  type TournamentTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
  }

  type Tournament {
    id: ID!
    title: String!
    description: String!
    timestamps: TournamentTimestamps!
    lootboxSnapshots: [LootboxSnapshot!]
  }

  type TournamentResponseSuccess {
    tournament: Tournament!
  }

  union TournamentResponse = TournamentResponseSuccess | ResponseError

  extend type Query {
    tournament(id: ID!): TournamentResponse!
  }
`;

export default TournamentTypeDefs;
