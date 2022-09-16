import { gql } from "apollo-server";

const OfferTypeDefs = gql`
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
    #targetingTags: [AdTargetTag!]!
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
    ACTIVE
    INACTIVE
    PLANNED
    ARCHIVED
  }

  enum MeasurementPartnerType {
    Appsflyer
    LootboxPixel
    Manual
  }

  input CreateActivationInput {
    name: String!
    description: String
    pricing: Float!
    status: ActivationStatus!
    mmpAlias: String!
    offerID: ID!
  }
  input EditActivationInput {
    id: ID!
    name: String
    description: String
    pricing: Float
    status: ActivationStatus
    mmpAlias: String
  }

  type Activation {
    id: ID!
    name: String!
    description: String
    pricing: Float!
    status: ActivationStatus!
    mmpAlias: String!
    offerID: ID!
  }

  enum AdTargetTagType {
    GEOGRAPHY
    INTEREST
    DEVICE
    OS
    INCOME
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

  extend type Query {
    # view offers that an advertiser created
    listCreatedOffers(advertiserID: ID!): ListCreatedOffersResponse!
    # view an offer with its adsets, as an advertiser
    viewCreatedOffer(offerID: ID!): ViewCreatedOfferResponse!
    # view offers that an organizer affiliate has access to
    #listOffersAvailableForOrganizer(
    #  affiliateID: ID!
    #): ListOffersAvailableForOrganizerResponse!
    # view an offer with its details, adsets, as an affiliate
    # viewOfferDetailsForEventAffiliate(
    #   offerID: ID!
    #   eventID: ID!
    # ): ViewOfferDetailsForEventAffiliateResponse!
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
    #targetingTags: [AdTargetTag!]!
  }
  type EditOfferResponseSuccess {
    offer: Offer!
  }
  union EditOfferResponse = EditOfferResponseSuccess | ResponseError

  # --------- Add Activations To Offer ---------
  input AddActivationsToOfferPayload {
    offerID: ID!
    activations: [CreateActivationInput!]!
  }
  type AddActivationsToOfferResponseSuccess {
    activations: [Activation!]!
  }
  union AddActivationsToOfferResponse =
      AddActivationsToOfferResponseSuccess
    | ResponseError

  # --------- Edit Activations To Offer ---------
  input EditActivationsInOfferPayload {
    offerID: ID!
    activations: [EditActivationInput!]!
  }
  type EditActivationsInOfferResponseSuccess {
    activations: [Activation!]!
  }
  union EditActivationsInOfferResponse =
      EditActivationsInOfferResponseSuccess
    | ResponseError

  extend type Mutation {
    # Advertiser creates an offer
    createOffer(
      advertiserID: ID!
      payload: CreateOfferPayload!
    ): CreateOfferResponse!
    # Advertiser edits an offer
    editOffer(payload: EditOfferPayload!): EditOfferResponse!
    # Advertiser adds activations to an offer
    addActivationsToOffer(
      payload: AddActivationsToOfferPayload!
    ): AddActivationsToOfferResponse!
    # Advertiser edits the activations in an offer including potential deletions
    editActivationsInOffer(
      payload: EditActivationsInOfferPayload!
    ): EditActivationsInOfferResponse!
  }
`;

export default OfferTypeDefs;
