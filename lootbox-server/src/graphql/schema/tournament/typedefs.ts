import { gql } from "apollo-server";

const TournamentTypeDefs = gql`
  enum LootboxTournamentStatus {
    pending
    active
    rejected
  }

  type TournamentTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type LootboxTournamentSnapshot {
    address: ID!
    issuer: ID!

    name: String!
    stampImage: String!
    image: String!
    backgroundColor: String!
    backgroundImage: String!

    metadataDownloadUrl: String
    timestamps: LootboxSnapshotTimestamps!

    status: LootboxTournamentStatus!
  }

  type Tournament {
    id: ID!
    title: String!
    description: String!
    tournamentLink: String
    timestamps: TournamentTimestamps!
    lootboxSnapshots: [LootboxTournamentSnapshot!]
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

  type DeleteTournamentResponseSuccess {
    tournament: Tournament!
  }

  union CreateTournamentResponse =
      CreateTournamentResponseSuccess
    | ResponseError

  union EditTournamentResponse = EditTournamentResponseSuccess | ResponseError

  union DeleteTournamentResponse =
      DeleteTournamentResponseSuccess
    | ResponseError

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
    deleteTournament(id: ID!): DeleteTournamentResponse!
  }
`;

export default TournamentTypeDefs;
