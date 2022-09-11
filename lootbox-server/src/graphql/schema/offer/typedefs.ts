import { gql } from "apollo-server";

const OfferTypeDefs = gql`
  enum OfferStatus {
    ACTIVE
    INACTIVE
    PLANNED
    ARCHIVED
  }

  enum MeasurementPartnerType {
    APPSFLYER
    LOOTBOX_PIXEL
  }

  type Activation {
    id: ID!
    name: String!
    description: String
    masterPricing: ActivationPricing!
  }

  type ActivationPricing {
    id: ID!
    activationID: ID!
    pricing: Number
    currency: Currency
    percentage: Number
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
    viewOfferDetailsForEventAffiliate(
      offerID: ID!
      eventID: ID!
    ): ViewOfferDetailsForEventAffiliateResponse!
    # view the performance of an offer in an event, as an affiliate
    viewOfferEventAffiliatePerformance(
      offerID: ID!
      tournamentID: ID!
      affiliateID: ID!
    ): ViewOfferEventAffiliatePerformanceResponse!
    # view total offer performance as an organizer
    viewTotalOfferPerformanceAsOrganizer(
      offerID: ID!
      affiliateID: ID!
    ): ViewTotalOfferPerformanceAsOrganizerResponse!
  }

  input CreateOfferPayload {
    id: ID!
    title: String!
    description: String
    image: String
    advertiserID: ID!
    maxBudget: Number
    currency: Currency
    startDate: Number
    endDate: Number
    status: OfferStatus
    affiliateBaseLink: String!
    mmp: MeasurementPartnerType!
    targetingTags: [AdTargetTag!]!
  }

  input EditOfferPayload {
    id: ID!
    title: String
    description: String
    image: String
    advertiserID: AdvertiserID!
    maxBudget: Number
    startDate: Number
    endDate: Number
    status: OfferStatus
    targetingTags: [AdTargetTag!]!
  }

  input AddActivationsToOfferPayload {
    offerID: ID!
    activations: [Activation!]!
  }

  input EditActivationsInOfferPayload {
    offerID: ID!
    activations: [Activation!]!
  }

  extend type Mutation {
    # Advertiser creates an offer
    createOffer(payload: CreateOfferPayload!): CreatePayloadResponse!
    # Advertiser edits an offer
    editOffer(payload: EditOfferPayload!): EditPayloadResponse!
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
