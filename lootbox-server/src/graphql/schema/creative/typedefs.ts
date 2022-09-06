import { gql } from "apollo-server";

const CreativeTypeDefs = gql`
  enum CreativeType {
    image
    video
  }
  type Creative {
    id: ID!
    creatorId: ID!
    advertiserId: ID! # [usually == creatorId, but can be a separate abstraction]
    creativeType: CreativeType!
    creativeLink: String!
    callToActionText: String
    url: String!
    clickUrl: String # kevel uses this and it seems like they redirect to url and track clicks that way...
    thumbnail: String
    infographicLink: String
    creativeAspectRatio: String! # Temp hardcoded for mobile fullscreen video
    themeColor: String
  }
`;

export default CreativeTypeDefs;
