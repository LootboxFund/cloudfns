import { gql } from "apollo-server";

const TournamentTypeDefs = gql`
  enum LootboxTournamentStatus {
    active
    disabled
    soldOut
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

  # this will live as a subcollection under the lootbox
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
    socials: LootboxSocialsWithoutEmail!
    status: LootboxTournamentStatus!
    partyBaskets: [PartyBasket!]
      @deprecated(reason: "Will be removed after Cosmic Lootbox refactor")
  }

  type Tournament {
    id: ID!
    title: String!
    description: String!
    tournamentLink: String
    timestamps: TournamentTimestamps!
    creatorId: ID!
    magicLink: String
    tournamentDate: Timestamp
    prize: String
    coverPhoto: String
    communityURL: String
    streams: [Stream!]
    # affiliateAdIds: [String] # For v0, we use an array of ids on the tournament
    organizer: ID
    promoters: [ID!]
    isPostCosmic: Boolean
      @deprecated(reason: "Will be removed after Cosmic Lootbox refactor")
    offers: [TournamentOffers!]
    lootboxSnapshots: [LootboxTournamentSnapshot!]
  }

  type TournamentOffers {
    id: ID!
    status: OfferInTournamentStatus!
    rateQuotes: [ID!]
    activeAdSets: [ID!]
    inactiveAdSets: [ID!]
  }

  enum OfferInTournamentStatus {
    Active
    Inactive
  }

  type TournamentPreview {
    id: ID!
    title: String!
    coverPhoto: String
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
    communityURL: String
    streams: [StreamInput!]
    organizer: ID
  }

  input EditTournamentPayload {
    id: ID!
    title: String
    description: String
    tournamentLink: String
    magicLink: String
    coverPhoto: String
    prize: String
    communityURL: String
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

  extend type Query {
    # get the public view a specific tournament
    tournament(id: ID!): TournamentResponse!
    # get the private view of a tournament you created
    myTournament(id: ID!): MyTournamentResponse!
    # get the public view of recent tournaments
    battleFeed(first: Int!, after: ID): BattleFeedResponse!
    # get the private organizer affiliate view of a tournament with earnings report
    #viewTournamentAsOrganizer(
    #  tournamentID: ID!
    #): ViewTournamentAsOrganizerResponse!
    # get the private promoter affiliate view of a tournament with earnings report
    #myMonetizedPromoterTournament(
    #  id: ID!
    #): myMonetizedPromoterTournamentResponse!
    # List monetized tournaments as an affiliate
    #listMonetizedTournaments(
    #  affiliateID: ID!
    #): ListMonetizedTournamentsResponse!
  }

  # ------------------- Add Offer AdSet To Tournament -------------------
  input AddOfferAdSetToTournamentPayload {
    tournamentID: ID!
    offerID: ID!
    adSetID: ID!
    organizerID: ID!
  }
  type AddOfferAdSetToTournamentResponseSuccess {
    tournament: Tournament!
  }
  union AddOfferAdSetToTournamentResponse =
      AddOfferAdSetToTournamentResponseSuccess
    | ResponseError

  # ------------------- Remove Offer AdSet To Tournament -------------------
  input RemoveOfferAdSetFromTournamentPayload {
    tournamentID: ID!
    offerID: ID!
    adSetID: ID!
  }
  type RemoveOfferAdSetFromTournamentResponseSuccess {
    tournament: Tournament!
  }
  union RemoveOfferAdSetFromTournamentResponse =
      RemoveOfferAdSetFromTournamentResponseSuccess
    | ResponseError

  # ------------------- Add Promoter To Tournament -------------------
  input RateQuoteInput {
    id: ID
    offerID: ID!
    activationID: ID!
    pricing: Float!
    tournamentID: ID!
    affiliateID: ID!
    affiliateType: AffiliateType!
  }
  input UpdatePromoterRateQuoteToTournamentPayload {
    tournamentID: ID!
    promoterID: ID!
    offerID: ID!
    rateQuotes: [RateQuoteInput!]!
  }
  type UpdatePromoterRateQuoteInTournamentResponseSuccess {
    tournament: Tournament!
  }
  union UpdatePromoterRateQuoteInTournamentResponse =
      UpdatePromoterRateQuoteInTournamentResponseSuccess
    | ResponseError

  # ------------------- Remove Promoter From Tournament -------------------
  input RemovePromoterFromTournamentPayload {
    tournamentID: ID!
    promoterID: ID!
  }
  type RemovePromoterFromTournamentResponseSuccess {
    tournament: Tournament!
  }
  union RemovePromoterFromTournamentResponse =
      RemovePromoterFromTournamentResponseSuccess
    | ResponseError

  extend type Mutation {
    # create a new tournament
    createTournament(
      payload: CreateTournamentPayload!
    ): CreateTournamentResponse!
    # edit an existing tournament
    editTournament(payload: EditTournamentPayload!): EditTournamentResponse!
    # delete an existing tournament
    deleteTournament(id: ID!): DeleteTournamentResponse!
    # add a stream to a tournament
    addStream(payload: AddStreamPayload!): AddStreamResponse!
    # edit a stream in a tournament
    deleteStream(id: ID!): DeleteStreamResponse!
    # delete a stream in a tournament
    editStream(payload: EditStreamPayload!): EditStreamResponse!
    # organizer adds an offer to a tournament
    addOfferAdSetToTournament(
      payload: AddOfferAdSetToTournamentPayload!
    ): AddOfferAdSetToTournamentResponse!
    # organizer removes an offer to a tournament
    removeOfferAdSetFromTournament(
      payload: RemoveOfferAdSetFromTournamentPayload!
    ): RemoveOfferAdSetFromTournamentResponse!
    # organizer updates a promoters rate quote in a tournament
    updatePromoterRateQuoteInTournament(
      payload: UpdatePromoterRateQuoteToTournamentPayload!
    ): UpdatePromoterRateQuoteInTournamentResponse!
    # organizer removes a promoter from a tournament
    removePromoterFromTournament(
      payload: RemovePromoterFromTournamentPayload!
    ): RemovePromoterFromTournamentResponse!
    # promoter leaves a tournament on their own accord
    #leaveAsPromoterInTournament(
    #  tournamentID: ID!
    #): LeaveAsPromoterInTournamentResponse!
    # organizer adds a label tag to tournament for sorting purposes
    #addLabelTagToTournament(
    #  tournamentID: ID!
    #  tag: String
    #): AddLabelTagToTournamentResponse!
    # organizer adds a label tag to tournament for sorting purposes
    #removeLabelTagFromTournament(
    #  tournamentID: ID!
    #  tag: String
    #): RemoveLabelTagFromTournamentResponse!
    # view earnings report for tournament as promoter affiliate
    #viewEarningsReportForTournamentAsPromoter(
    #  eventID: ID!
    #  affiliateID: ID!
    #): ViewEarningsReportForTournamentAsPromoterResponse!
    # view earnings report for tournament as organizer affiliate
    #viewEarningsReportForTournamentAsOrganizer(
    #  eventID: ID!
    #): ViewEarningsReportForTournamentAsOrganizerResponse!
  }
`;

export default TournamentTypeDefs;
