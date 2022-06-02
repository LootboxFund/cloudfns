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
    magicLink: String
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

  type CreateTournamentResponseSuccess {
    tournament: Tournament!
  }

  type EditTournamentResponseSuccess {
    tournament: Tournament!
  }

  union CreateTournamentResponse =
      CreateTournamentResponseSuccess
    | ResponseError

  union EditTournamentResponse = EditTournamentResponseSuccess | ResponseError

  input CreateTournamentPayload {
    title: String!
    description: String!
    tournamentLink: String
  }

  input EditTournamentPayload {
    id: ID!
    title: String
    description: String
    tournamentLink: String
    magicLink: String
  }

  extend type Mutation {
    createTournament(
      payload: CreateTournamentPayload!
    ): CreateTournamentResponse!
    editTournament(payload: EditTournamentPayload!): EditTournamentResponse!
  }
`;

export default TournamentTypeDefs;
