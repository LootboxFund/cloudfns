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
    tournamentLink: String
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

  type CreateTournamentResponseSuccess {
    tournament: Tournament!
  }

  union CreateTournamentResponse =
      CreateTournamentResponseSuccess
    | ResponseError

  input CreateTournamentPayload {
    title: String!
    description: String!
    tournamentLink: String
  }

  extend type Mutation {
    createTournament(
      payload: CreateTournamentPayload!
    ): CreateTournamentResponse!
  }
`;

export default TournamentTypeDefs;
