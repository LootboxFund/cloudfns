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
    # currency: Currency
    startDate: Timestamp
    endDate: Timestamp
    status: OfferStatus!
    affiliateBaseLink: String
    mmp: MeasurementPartnerType!
    activations: [Activation!]!
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
    ACTIVE
    INACTIVE
    PLANNED
    ARCHIVED
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

  input ActivationInput {
    id: ID!
    name: String!
    description: String
    masterPricing: ActivationPricingInput!
    status: ActivationStatus!
  }
  input ActivationPricingInput {
    id: ID!
    activationID: ID!
    pricing: Float
    percentage: Float
    affiliateID: ID!
    affiliateType: AffiliateType
  }

  type Activation {
    id: ID!
    name: String!
    description: String
    masterPricing: ActivationPricing!
    status: ActivationStatus!
  }

  type ActivationPricing {
    id: ID!
    activationID: ID!
    pricing: Float
    percentage: Float
    affiliateID: ID!
    affiliateType: AffiliateType
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
    activations: [ActivationInput!]!
  }
  type AddActivationsToOfferResponseSuccess {
    offer: Offer!
  }
  union AddActivationsToOfferResponse =
      AddActivationsToOfferResponseSuccess
    | ResponseError

  # --------- Edit Activations To Offer ---------
  input EditActivationsInOfferPayload {
    offerID: ID!
    activations: [ActivationInput!]!
  }
  type EditActivationsInOfferResponseSuccess {
    offer: Offer!
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
