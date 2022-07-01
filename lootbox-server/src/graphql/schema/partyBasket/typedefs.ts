import { gql } from "apollo-server";

const PartyBasketTypeDefs = gql`
  type PartyBasketTimestamps {
    createdAt: Timestamp!
    updatedAt: Timestamp!
    deletedAt: Timestamp
  }

  type PartyBasket {
    id: ID! # firestore id
    address: ID!
    factory: ID!
    creatorId: ID!
    creatorAddress: ID!
    lootboxAddress: ID!
    name: String!
    chainIdHex: String!
    timestamps: PartyBasketTimestamps!
    lootboxSnapshot: LootboxSnapshot
    # whitelistSignatures: [String!]
  }

  type PartyBasketWhitelistSignature {
    signature: String!
    signer: ID! # Address of the signer
    whitelistedAddress: ID! # Address of the user being whitelisted
    partyBasketAddress: ID!
    isRedeemed: Boolean!
    timestamps: PartyBasketTimestamps!
  }

  type GetPartyBasketResponseSuccess {
    partyBasket: PartyBasket!
  }

  union GetPartyBasketResponse = GetPartyBasketResponseSuccess | ResponseError

  type GetWhitelistSignaturesResponseSuccess {
    signatures: [PartyBasketWhitelistSignature]!
  }

  union GetWhitelistSignaturesResponse =
      GetWhitelistSignaturesResponseSuccess
    | ResponseError

  extend type Query {
    getWhitelistSignatures(
      message: String!
      signedMessage: String!
    ): GetWhitelistSignaturesResponse!
    getPartyBasket(address: ID!): GetPartyBasketResponse!
  }

  input CreatePartyBasketPayload {
    address: ID!
    chainIdHex: String!
    factory: ID!
    name: String!
    lootboxAddress: ID!
    creatorAddress: ID!
  }

  type CreatePartyBasketResponseSuccess {
    partyBasket: PartyBasket!
  }

  input BulkWhitelistPayload {
    whitelistAddresses: [ID!]! # Address of the user being whitelisted
    partyBasketAddress: ID!
  }

  type BulkWhitelistResponseSuccess {
    signatures: [String]!
    errors: [String] # For partial errors
  }

  type RedeemSignatureResponseSuccess {
    signature: PartyBasketWhitelistSignature!
  }

  input RedeemSignaturePayload {
    signatureId: ID!
    message: String!
    signedMessage: String!
    partyBasketId: ID!
  }

  union RedeemSignatureResponse = RedeemSignatureResponseSuccess | ResponseError

  union CreatePartyBasketResponse =
      CreatePartyBasketResponseSuccess
    | ResponseError

  union BulkWhitelistResponse = BulkWhitelistResponseSuccess | ResponseError

  extend type Mutation {
    createPartyBasket(
      payload: CreatePartyBasketPayload!
    ): CreatePartyBasketResponse!
    bulkWhitelist(payload: BulkWhitelistPayload!): BulkWhitelistResponse!
    redeemSignature(payload: RedeemSignaturePayload!): RedeemSignatureResponse!
  }
`;

export default PartyBasketTypeDefs;
