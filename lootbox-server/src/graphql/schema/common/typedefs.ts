import { gql } from "apollo-server";

const CommonTypeDefs = gql`
  scalar EmailAddress
  scalar PhoneNumber
  scalar Timestamp

  enum StatusCode {
    Success
    NotImplemented
    BadRequest
    NotFound
    ServerError
    InvalidOperation
    Forbidden
    Unauthorized
  }

  enum OrganizerRank {
    ClayRank1
    IronRank2
    BronzeRank3
    SilverRank4
    GoldRank5
    PlatinumRank6
    DiamondRank7
    GhostRank0
  }

  enum AffiliateType {
    Organizer
    Promoter
    Lootbox
  }

  type Status {
    code: StatusCode!
    message: String!
  }

  enum QuestionFieldType {
    Text
    Number
    Phone
    Email
    Address
    Date
    Time
    DateTime
    Screenshot
    Link
    File
    Range
    SingleSelect
    MultiSelect
  }

  type Query {
    version: ID!
  }

  type Mutation {
    version: ID!
  }

  type ResponseError {
    error: Status!
  }

  type PageInfo {
    endCursor: String # ID of the last document
    hasNextPage: Boolean!
  }
`;

export default CommonTypeDefs;
