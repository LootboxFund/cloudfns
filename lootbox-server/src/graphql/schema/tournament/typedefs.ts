import { gql } from "apollo-server";

const TournamentTypeDefs = gql`
  enum LootboxTournamentStatus {
    pending
    active
    rejected
  }

  enum StreamType {
    facebook
    twitch
    discord
    youtube
  }

  type TournamentTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type StreamTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type LootboxTournamentSnapshot {
    address: ID!
    issuer: ID!
    description: String!
    name: String!
    stampImage: String!
    image: String!
    backgroundColor: String!
    backgroundImage: String!
    metadataDownloadUrl: String
    timestamps: LootboxSnapshotTimestamps!
    status: LootboxTournamentStatus!
    socials: LootboxSocialsWithoutEmail!
    partyBaskets: [PartyBasket!]
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
    campaignCompleteURL: String
    streams: [Stream!]
  }

  type Stream {
    id: ID!
    creatorId: ID!
    type: StreamType!
    url: String!
    name: String!
    tournamentId: ID!
    timestamps: StreamTimestamps!
  }

  input StreamInput {
    type: StreamType!
    url: String!
    name: String!
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
    battleFeed(first: Int!, after: ID): BattleFeedResponse!
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

  type AddStreamResponseSuccess {
    stream: Stream!
  }

  type DeleteStreamResponseSuccess {
    stream: Stream!
  }

  type EditStreamResponseSuccess {
    stream: Stream!
  }

  union AddStreamResponse = AddStreamResponseSuccess | ResponseError

  union DeleteStreamResponse = DeleteStreamResponseSuccess | ResponseError

  union EditStreamResponse = EditStreamResponseSuccess | ResponseError

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
    campaignCompleteURL: String
    streams: [StreamInput!]
  }

  input EditTournamentPayload {
    id: ID!
    title: String
    description: String
    tournamentLink: String
    magicLink: String
    coverPhoto: String
    prize: String
    campaignCompleteURL: String
    tournamentDate: Timestamp
  }

  input AddStreamPayload {
    tournamentId: ID!
    stream: StreamInput!
  }

  input EditStreamPayload {
    id: ID!
    type: StreamType!
    url: String!
    name: String!
  }

  extend type Mutation {
    createTournament(
      payload: CreateTournamentPayload!
    ): CreateTournamentResponse!
    editTournament(payload: EditTournamentPayload!): EditTournamentResponse!
    deleteTournament(id: ID!): DeleteTournamentResponse!
    addStream(payload: AddStreamPayload!): AddStreamResponse!
    deleteStream(id: ID!): DeleteStreamResponse!
    editStream(payload: EditStreamPayload!): EditStreamResponse!
  }
`;

export default TournamentTypeDefs;
