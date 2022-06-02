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
    creatorId: ID!
  }

  type TournamentResponseSuccess {
    tournament: Tournament!
  }

  type MyTournamentResponseSuccess {
    tournament: Tournament!
  }

  union TournamentResponse = TournamentResponseSuccess | ResponseError
  union MyTournamentResponse = MyTournamentResponseSuccess | ResponseError

  extend type Query {
    tournament(id: ID!): TournamentResponse!
    myTournament(id: ID!): MyTournamentResponse!
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
