import { gql } from "apollo-server";

const LootboxTypeDefs = gql`
  enum LootboxVariant {
    escrow
    instant
  }

  type LootboxChain {
    address: ID!
    title: String!
    chainIdHex: String!
    chainIdDecimal: String!
    chainName: String!
  }

  type LootboxCustomSchemaData {
    name: String!
    description: String!
    image: String!
    backgroundColor: String!
    backgroundImage: String!
    badgeImage: String!
    targetPaybackDate: Timestamp
    createdAt: Timestamp!
    fundraisingTarget: String!
    fundraisingTargetMax: String!
    basisPointsReturnTarget: String!
    returnAmountTarget: String!
    pricePerShare: String!
    lootboxThemeColor: String!
    transactionHash: String!
    blockNumber: String!
    factory: ID!
    tournamentId: ID
  }

  type LootboxSocials {
    twitter: String
    email: String!
    instagram: String
    tiktok: String
    facebook: String
    discord: String
    youtube: String
    snapchat: String
    twitch: String
    web: String
  }

  type LootboxSocialsWithoutEmail {
    twitter: String
    instagram: String
    tiktok: String
    facebook: String
    discord: String
    youtube: String
    snapchat: String
    twitch: String
    web: String
  }

  type LootboxCustomSchema {
    version: String!
    chain: LootboxChain!
    lootbox: LootboxCustomSchemaData!
    socials: LootboxSocials!
  }

  type LootboxMetadata {
    # points to stamp image - opensea compatible
    image: String!
    # points to lootbox page on lootbox.fund - opensea compatible
    external_url: String!
    # description of the lootbox - opensea compatible
    description: String!
    # name of the lootbox - opensea compatible
    name: String!
    # hex color, must be a six-character hexadecimal without a pre-pended # - opensea compatible
    background_color: String!
    # A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA
    animation_url: String
    # A URL to a YouTube video - opensea compatible
    youtube_url: String
    lootboxCustomSchema: LootboxCustomSchema # Used in lootbox custom code etc
  }

  type LootboxTimestamps {
    createdAt: Timestamp!
    indexedAt: Timestamp!
    updatedAt: Timestamp!
  }

  type TournamentMetadata {
    status: LootboxTournamentStatus!
  }

  type Lootbox {
    address: ID!
    factory: ID!
    tournamentId: ID # Optional, if lootboxes are associated to a tournament
    name: String!
    chainIdHex: String!
    variant: LootboxVariant!

    issuer: ID!
    treasury: ID!
    targetSharesSold: String!
    maxSharesSold: String!

    # From Block Trigger Event
    timestamps: LootboxTimestamps!

    # Metadata
    metadataDownloadUrl: String
    metadata: LootboxMetadata!

    tournamentMetadata: TournamentMetadata # Optional, if lootboxes are associated to a tournament - TODO: refactor this to be a subcollection under the tournament collection
    partyBaskets: [PartyBasket!]
  }

  type LootboxSnapshotTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
  }

  type LootboxSnapshot {
    address: ID!
    issuer: ID!
    description: String!

    name: String!
    stampImage: String
    image: String!
    backgroundColor: String!
    backgroundImage: String!

    metadataDownloadUrl: String
    timestamps: LootboxSnapshotTimestamps!
  }

  type LootboxResponseSuccess {
    lootbox: Lootbox!
  }

  union GetLootboxByAddressResponse = LootboxResponseSuccess | ResponseError

  type LootboxFeedEdge {
    node: LootboxSnapshot!
    cursor: ID!
  }

  type LootboxFeedResponseSuccess {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [LootboxFeedEdge!]!
  }

  union LootboxFeedResponse = LootboxFeedResponseSuccess | ResponseError

  extend type Query {
    getLootboxByAddress(address: ID!): GetLootboxByAddressResponse!
    lootboxFeed(first: Int!, after: ID): LootboxFeedResponse!
  }
`;

export default LootboxTypeDefs;
