import { gql } from "apollo-server";

const AdPlatformV1TypeDefs = gql`
  enum ScrollAdCreativeType {
    IMAGE
    GIF
    VIDEO
  }

  type ScrollFeedAd {
    title: String!
    description: String!
    creatives: [ScrollFeedAdCreative!]!
  }

  type ScrollFeedAdCreative {
    alias: String!
    url: String!
    type: ScrollAdCreativeType!
  }

  type AdsScrollFeedV1ResponseSuccess {
    scrollFeedAds: [ScrollFeedAd!]!
  }

  union AdsScrollFeedV1Response = AdsScrollFeedV1ResponseSuccess | ResponseError

  extend type Query {
    myScrollFeed: AdsScrollFeedV1Response!
  }
`;

export default AdPlatformV1TypeDefs;
