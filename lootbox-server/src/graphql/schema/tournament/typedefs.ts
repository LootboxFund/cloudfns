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
    tournamentDate: Timestamp
    prize: String
    coverPhoto: String
  }

  type TournamentResponseSuccess {
    tournament: Tournament!
  }

  type MyTournamentResponseSuccess {
    tournament: Tournament!
  }

  type BattleFeedEdge {
    node: Tournament!
    cursor: ID!
  }

  type BattleFeedResponseSuccess {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [BattleFeedEdge!]!
  }

  union TournamentResponse = TournamentResponseSuccess | ResponseError
  union MyTournamentResponse = MyTournamentResponseSuccess | ResponseError
  union BattleFeedResponse = BattleFeedResponseSuccess | ResponseError

  extend type Query {
    tournament(id: ID!): TournamentResponse!
    myTournament(id: ID!): MyTournamentResponse!
    battleFeed(first: Int, after: ID): BattleFeedResponse!
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
    coverPhoto: String
    prize: String
    tournamentDate: Timestamp!
  }

  input EditTournamentPayload {
    id: ID!
    title: String
    description: String
    tournamentLink: String
    magicLink: String
    coverPhoto: String
    prize: String
    tournamentDate: Timestamp
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
