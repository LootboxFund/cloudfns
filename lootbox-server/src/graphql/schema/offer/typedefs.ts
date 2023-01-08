import { gql } from "apollo-server";

const OfferTypeDefs = gql`
  type AdSetPreview {
    id: ID!
    name: String!
    status: AdSetStatus!
    placement: Placement!
    thumbnail: String
  }

  enum OfferVisibility {
    Public
    Private
  }

  type Offer {
    id: ID!
    title: String!
    description: String
    image: String
    advertiserID: ID!
    spentBudget: Float
    maxBudget: Float
    startDate: Timestamp
    endDate: Timestamp
    status: OfferStatus!
    affiliateBaseLink: String
    mmp: MeasurementPartnerType!
    adSets: [ID!]!
    activations: [Activation!]!
    adSetPreviews: [AdSetPreview!]!
    #targetingTags: [AdTargetTag!]!
    airdropMetadata: OfferAirdropMetadata
    afterTicketClaimMetadata: OfferAfterTicketClaimMetadata
    strategy: OfferStrategyType!
    visibility: OfferVisibility!
  }

  type OfferAirdropMetadata {
    oneLiner: String
    value: String!
    instructionsLink: String
    instructionsCallToAction: String
    callToActionLink: String
    questions: [QuestionAnswerPreview!]!
    excludedOffers: [ID!]!
    batchCount: Int
    lootboxTemplateID: ID!
    lootboxTemplateStamp: String!
  }

  type OfferAfterTicketClaimMetadata {
    questions: [QuestionAnswerPreview!]!
  }

  type QuestionAnswerPreview {
    id: ID!
    batch: ID!
    question: String!
    type: QuestionFieldType!
    mandatory: Boolean
    options: String
  }

  enum OfferStrategyType {
    Airdrop
    AfterTicketClaim
    None
  }

  type OfferAffiliateView {
    id: ID!
    title: String!
    description: String
    image: String
    advertiserID: ID!
    advertiserName: String!
    advertiserAvatar: String
    spentBudget: Float
    maxBudget: Float
    startDate: Timestamp
    endDate: Timestamp
    status: OfferStatus!
    adSetPreviews: [AdSetPreview!]!
    activationsForAffiliate(affiliateID: ID!): [RateQuoteEstimate!]!
    #targetingTags: [AdTargetTag!]!
  }

  type RateQuoteEstimate {
    activationID: ID!
    activationName: String!
    description: String
    pricing: Float!
    affiliateID: ID!
    rank: String
    order: Int
  }

  type OfferPreview {
    id: ID!
    title: String!
    description: String
    image: String
    advertiserID: ID!
    spentBudget: Float
    maxBudget: Float
    startDate: Timestamp
    endDate: Timestamp
    status: OfferStatus!
    strategy: OfferStrategyType!
  }

  #enum Currency {
  #  USD
  #}

  enum OfferStatus {
    Active
    Inactive
    Planned
    Archived
  }
  enum ActivationStatus {
    Active
    Inactive
    Planned
    Archived
  }

  input CreateActivationInput {
    name: String!
    description: String
    pricing: Float!
    status: ActivationStatus!
    mmp: MeasurementPartnerType!
    mmpAlias: String!
    offerID: ID!
    order: Int
  }
  input EditActivationInput {
    id: ID!
    name: String
    description: String
    pricing: Float
    status: ActivationStatus
    order: Int
  }

  type Activation {
    id: ID!
    name: String!
    description: String
    pricing: Float!
    status: ActivationStatus!
    mmp: MeasurementPartnerType!
    mmpAlias: String!
    offerID: ID!
    order: Int!
  }

  enum AdTargetTagType {
    Geography
    Interest
    Device
    Os
    Income
  }

  type AdTargetTag {
    id: ID!
    slug: String!
    title: String!
    description: String
    type: AdTargetTagType!
  }

  # --------- List Created Offers ---------
  type ListCreatedOffersResponseSuccess {
    offers: [OfferPreview!]!
  }
  union ListCreatedOffersResponse =
      ListCreatedOffersResponseSuccess
    | ResponseError

  # --------- View Created Offer ---------
  type ViewCreatedOfferResponseSuccess {
    offer: Offer!
  }
  union ViewCreatedOfferResponse =
      ViewCreatedOfferResponseSuccess
    | ResponseError

  # --------- List Offers Available to Organizer ---------
  type ListOffersAvailableForOrganizerResponseSuccess {
    offers: [OfferAffiliateView!]!
  }
  union ListOffersAvailableForOrganizerResponse =
      ListOffersAvailableForOrganizerResponseSuccess
    | ResponseError

  # --------- View Offer Details As Organizer ---------
  input ViewOfferDetailsAsEventAffiliatePayload {
    offerID: ID!
    affiliateID: ID!
  }
  type ViewOfferDetailsAsEventAffiliateResponseSuccess {
    offer: OfferAffiliateView!
  }
  union ViewOfferDetailsAsEventAffiliateResponse =
      ViewOfferDetailsAsEventAffiliateResponseSuccess
    | ResponseError

  # --------- Check If User Answered Airdrop Questions ---------
  type CheckIfUserAnsweredAirdropQuestionsResponseSuccess {
    status: Boolean!
  }
  union CheckIfUserAnsweredAirdropQuestionsResponse =
      CheckIfUserAnsweredAirdropQuestionsResponseSuccess
    | ResponseError

  extend type Query {
    # view offers that an advertiser created
    listCreatedOffers(advertiserID: ID!): ListCreatedOffersResponse!
    # view an offer with its adsets, as an advertiser
    viewCreatedOffer(offerID: ID!): ViewCreatedOfferResponse!
    # view offers that an organizer affiliate has access to
    listOffersAvailableForOrganizer(
      affiliateID: ID!
    ): ListOffersAvailableForOrganizerResponse!
    # view an offer with its details, adsets, as an affiliate
    viewOfferDetailsAsAffiliate(
      payload: ViewOfferDetailsAsEventAffiliatePayload!
    ): ViewOfferDetailsAsEventAffiliateResponse!
    # check if user answered airdrop questions
    checkIfUserAnsweredAirdropQuestions(
      lootboxID: ID!
    ): CheckIfUserAnsweredAirdropQuestionsResponse!
    # view the performance of an offer in an event, as an affiliate
    # viewOfferEventAffiliatePerformance(
    #   offerID: ID!
    #   tournamentID: ID!
    #   affiliateID: ID!
    # ): ViewOfferEventAffiliatePerformanceResponse!
    # view total offer performance as an organizer
    # viewTotalOfferPerformanceAsOrganizer(
    #   offerID: ID!
    #   affiliateID: ID!
    # ): ViewTotalOfferPerformanceAsOrganizerResponse!
  }

  # --------- Create Offer ---------
  input CreateOfferPayload {
    title: String!
    description: String
    image: String
    advertiserID: ID!
    maxBudget: Float
    # currency: Currency
    startDate: Timestamp
    endDate: Timestamp
    status: OfferStatus!
    affiliateBaseLink: String
    mmp: MeasurementPartnerType
    #targetingTags: [AdTargetTag!]!
    strategy: OfferStrategyType
    airdropMetadata: OfferAirdropMetadataCreateInput
    afterTicketClaimMetadata: OfferAfterTicketClaimMetadataCreateInput
  }
  input OfferAirdropMetadataCreateInput {
    oneLiner: String
    value: String
    instructionsLink: String
    instructionsCallToAction: String
    callToActionLink: String
    lootboxTemplateID: ID!
    questions: [QuestionCreateInput!]!
    excludedOffers: [ID!]!
  }
  input OfferAfterTicketClaimMetadataCreateInput {
    questions: [QuestionCreateInput!]!
  }
  input QuestionCreateInput {
    question: String!
    type: QuestionFieldType!
    mandatory: Boolean
    options: String
  }
  enum QuestionAnswerStatus {
    Active
    Inactive
  }
  type CreateOfferResponseSuccess {
    offer: Offer!
  }
  union CreateOfferResponse = CreateOfferResponseSuccess | ResponseError

  # --------- Edit Offer ---------
  input EditOfferPayload {
    id: ID!
    title: String
    description: String
    image: String
    advertiserID: ID!
    maxBudget: Float
    startDate: Timestamp
    endDate: Timestamp
    status: OfferStatus!
    airdropMetadata: OfferAirdropMetadataEditInput
    afterTicketClaimMetadata: OfferAfterTicketClaimMetadataEditInput
    lootboxTemplateID: ID
    visibility: OfferVisibility
    #targetingTags: [AdTargetTag!]!
  }
  input OfferAirdropMetadataEditInput {
    oneLiner: String
    value: String
    instructionsLink: String
    instructionsCallToAction: String
    callToActionLink: String
    excludedOffers: [ID!]
    activeQuestions: [ID!]
    inactiveQuestions: [ID!]
    questions: [QuestionCreateInput!]
    # newQuestions: [QuestionCreateInput!]!
  }
  input OfferAfterTicketClaimMetadataEditInput {
    questions: [QuestionCreateInput!]
  }
  type EditOfferResponseSuccess {
    offer: Offer!
  }
  union EditOfferResponse = EditOfferResponseSuccess | ResponseError

  # --------- Add Activations To Offer ---------
  input CreateActivationPayload {
    offerID: ID!
    activation: CreateActivationInput!
  }
  type CreateActivationResponseSuccess {
    activation: Activation!
  }
  union CreateActivationResponse =
      CreateActivationResponseSuccess
    | ResponseError

  # --------- Edit Activations To Offer ---------
  input EditActivationPayload {
    activationID: ID!
    activation: EditActivationInput!
  }
  type EditActivationResponseSuccess {
    activation: Activation!
  }
  union EditActivationResponse = EditActivationResponseSuccess | ResponseError

  # --------- Update Claim as Rewarded ---------
  input UpdateClaimRedemptionStatusPayload {
    claimID: ID!
    status: ClaimRedemptionStatus!
  }
  type UpdateClaimRedemptionStatusResponseSuccess {
    claimID: ID!
  }
  union UpdateClaimRedemptionStatusResponse =
      UpdateClaimRedemptionStatusResponseSuccess
    | ResponseError

  # --------- Answer Airdrop Question ---------
  input AnswerAirdropQuestionPayload {
    lootboxID: ID!
    claimID: ID
    answers: [AnswerAirdropQuestionInput!]!
    flightID: ID
  }
  input AnswerAirdropQuestionInput {
    questionID: ID!
    lootboxID: ID!
    answer: String!
  }
  type AnswerAirdropQuestionResponseSuccess {
    answerIDs: [ID!]!
  }
  union AnswerAirdropQuestionResponse =
      AnswerAirdropQuestionResponseSuccess
    | ResponseError

  # --------- Answer AfterTicketClaim Question ---------
  input AfterTicketClaimQuestionPayload {
    adSetID: ID!
    referralID: ID!
    claimID: ID
    answers: [AfterTicketClaimQuestionInput!]!
    flightID: ID
  }
  input AfterTicketClaimQuestionInput {
    questionID: ID!
    answer: String!
  }
  type AfterTicketClaimQuestionResponseSuccess {
    answerIDs: [ID!]!
  }
  union AfterTicketClaimQuestionResponse =
      AfterTicketClaimQuestionResponseSuccess
    | ResponseError

  type OfferClaimsCSVResponseSuccess {
    csvDownloadURL: String!
  }

  union OfferClaimsCSVResponse = OfferClaimsCSVResponseSuccess | ResponseError

  input OfferClaimsCSVPayload {
    offerID: ID!
  }

  extend type Mutation {
    # Advertiser creates an offer
    createOffer(
      advertiserID: ID!
      payload: CreateOfferPayload!
    ): CreateOfferResponse!
    # Advertiser edits an offer
    editOffer(payload: EditOfferPayload!): EditOfferResponse!
    # Advertiser adds activations to an offer
    createActivation(
      payload: CreateActivationPayload!
    ): CreateActivationResponse!
    # Advertiser edits the activations in an offer including potential deletions
    editActivation(payload: EditActivationPayload!): EditActivationResponse!
    # Update claim status as rewarded
    updateClaimRedemptionStatus(
      payload: UpdateClaimRedemptionStatusPayload!
    ): UpdateClaimRedemptionStatusResponse!
    #
    answerAirdropQuestion(
      payload: AnswerAirdropQuestionPayload!
    ): AnswerAirdropQuestionResponse!
    #
    answerAfterTicketClaimQuestion(
      payload: AfterTicketClaimQuestionPayload!
    ): AfterTicketClaimQuestionResponse!
    offerClaimsCSV(payload: OfferClaimsCSVPayload!): OfferClaimsCSVResponse!
  }
`;

export default OfferTypeDefs;
