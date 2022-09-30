import { gql } from "apollo-server";

const LootboxTypeDefs = gql`
  enum LootboxStatus {
    active
    disabled
    soldOut
  }

  enum LootboxVariant {
    escrow
    instant
    cosmic
  }

  type LootboxChain {
    address: ID!
    title: String!
    chainIdHex: String!
    chainIdDecimal: String!
    chainName: String!
  }

  type LootboxTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type MintWhitelistSignature {
    id: ID!
    signature: String!
    signer: ID! # Address of the signer
    whitelistedAddress: ID! # Address of the user being whitelisted
    lootboxAddress: ID!
    isRedeemed: Boolean!
    nonce: String!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  # Subcollection under the Lootbox
  type LootboxTicket {
    id: ID!
    lootboxID: ID!
    lootboxAddress: ID!
    ticketID: ID! # web3 ticket id
    minterUserID: ID!
    minterAddress: ID!
    mintWhitelistID: ID!
    createdAt: Timestamp!
    stampImage: String!
    metadataURL: String!
    claimID: ID
  }

  type Lootbox {
    # Immutable stuff
    id: ID!
    address: ID!
    factory: ID!
    creatorAddress: ID!
    creatorID: ID!
    chainIdHex: String!
    variant: LootboxVariant!
    timestamps: LootboxTimestamps!
    chainIdDecimal: String!
    chainName: String!
    transactionHash: String!
    blockNumber: String!

    # Mutable
    name: String!
    description: String!
    status: LootboxStatus!
    nftBountyValue: String
    joinCommunityUrl: String
    maxTickets: Int!
    stampImage: String!
    logo: String!
    backgroundImage: String!
    badgeImage: String
    themeColor: String!
    version: String!

    # DEPRECATED
    metadata: LootboxMetadata @deprecated(reason: "Use metadataV2")
    partyBaskets: [PartyBasket!]
      @deprecated(reason: "Use Cosmic Lootbox Instead")
    tournamentId: ID
      @deprecated(
        reason: "Use LootboxTournamentSnapshot subcollection instead - will be removed after Cosmic"
      ) # Optional, if lootboxes are associated to a tournament
    mintWhitelistSignatures: [MintWhitelistSignature!]
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

  union GetWhitelistSignaturesResponse =
      GetWhitelistSignaturesResponseSuccess
    | ResponseError

  union LootboxFeedResponse = LootboxFeedResponseSuccess | ResponseError

  extend type Query {
    getLootboxByAddress(address: ID!): GetLootboxByAddressResponse!
    lootboxFeed(first: Int!, after: ID): LootboxFeedResponse!
  }

  # input CreateLootboxPayload {
  #   address: ID!
  #   name: String!
  # }

  input EditLootboxPayload {
    lootboxID: ID!
    name: String
    description: String
    logo: String
    backgroundImage: String
    nftBountyValue: String
    joinCommunityUrl: String
    status: LootboxStatus
    maxTickets: Int
    themeColor: String
  }

  input BulkMintWhitelistPayload {
    whitelistAddresses: [ID!]! # Address of the user being whitelisted
    lootboxAddress: ID!
  }

  input MintLootboxTicketPayload {
    mintWhitelistID: ID!
    message: String!
    signedMessage: String!
    lootboxID: ID!
    ticketID: ID!
    minterAddress: ID!
    claimID: ID
  }

  # type CreateLootboxResponseSuccess {
  #   lootbox: Lootbox!
  # }

  type MintLootboxTicketResponseSuccess {
    ticket: LootboxTicket!
  }

  type EditLootboxResponseSuccess {
    lootbox: Lootbox!
  }

  type BulkMintWhitelistResponseSuccess {
    signatures: [String]!
    errors: [String] # For partial errors
  }

  # union CreateLootboxResponse = CreateLootboxResponseSuccess | ResponseError
  union EditLootboxResponse = EditLootboxResponseSuccess | ResponseError
  union GetWhitelistSignaturesResponse =
      GetWhitelistSignaturesResponseSuccess
    | ResponseError
  union BulkMintWhitelistResponse =
      BulkMintWhitelistResponseSuccess
    | ResponseError
  union MintLootboxTicketResponse =
      MintLootboxTicketResponseSuccess
    | ResponseError

  extend type Mutation {
    # createLootbox(payload: CreateLootboxPayload!): CreateLootboxResponse!
    editLootbox(payload: EditLootboxPayload!): EditLootboxResponse!
    bulkMintWhitelist(
      payload: BulkMintWhitelistPayload!
    ): BulkMintWhitelistResponse!
    mintLootboxTicket(
      payload: MintLootboxTicketPayload!
    ): MintLootboxTicketResponse!
  }

  # -------------- DEPRECATED SHIT --------------

  # DEPRECATED
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

  # DEPRECATED
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

  # DEPRECATED
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

  # DEPRECATED
  type LootboxCustomSchema {
    version: String!
    chain: LootboxChain!
    lootbox: LootboxCustomSchemaData!
    socials: LootboxSocials!
  }

  # DEPRECATED
  type LootboxMetadata {
    # points to stamp image - opensea compatible
    image: String! @deprecated(reason: "removing after Cosmic Lootbox Refactor")
    # points to lootbox page on lootbox.fund - opensea compatible
    external_url: String!
      @deprecated(reason: "removing after Cosmic Lootbox Refactor")
    # description of the lootbox - opensea compatible
    description: String!
      @deprecated(reason: "removing after Cosmic Lootbox Refactor")
    # name of the lootbox - opensea compatible
    name: String! @deprecated(reason: "removing after Cosmic Lootbox Refactor")
    # hex color, must be a six-character hexadecimal without a pre-pended # - opensea compatible
    background_color: String!
      @deprecated(reason: "removing after Cosmic Lootbox Refactor")
    # A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA
    animation_url: String
      @deprecated(reason: "removing after Cosmic Lootbox Refactor")
    # A URL to a YouTube video - opensea compatible
    youtube_url: String
      @deprecated(reason: "removing after Cosmic Lootbox Refactor")
    lootboxCustomSchema: LootboxCustomSchema
      @deprecated(reason: "removing after Cosmic Lootbox Refactor") # Used in lootbox custom code etc
  }
`;

export default LootboxTypeDefs;
