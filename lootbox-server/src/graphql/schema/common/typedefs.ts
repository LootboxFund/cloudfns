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

  type Status {
    code: StatusCode!
    message: String!
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
`;

export default CommonTypeDefs;
