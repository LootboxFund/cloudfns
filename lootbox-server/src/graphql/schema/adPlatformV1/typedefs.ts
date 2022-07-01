import { gql } from "apollo-server";

const AdPlatformV1TypeDefs = gql`
  enum AdZone {
    SCROLL_FEED
    FOCUS_TRAILER
    SOCIAL_PREVIEW
    ACTIVATION_ASK
  }

  enum AdCreativeType {
    IMAGE
    GIF
    VIDEO
    URL
  }

  type ScrollFeedAd {
    title: String!
    description: String!
    creatives: [AdCreative!]
    slug: AdZone!
  }

  type AdCreative {
    alias: String!
    url: String!
    type: AdCreativeType!
  }

  type AdsScrollFeedV1ResponseSuccess {
    scrollFeedAds: [Any!]
  }

  union AdsScrollFeedV1Response = AdsScrollFeedV1ResponseSuccess | ResponseError

  extend type Query {
    myScrollFeed: AdsScrollFeedV1Response!
  }
`;

// type AdsScrollFeedV1ResponseSuccess {
//   scrollFeedAds: [ScrollFeedAd!]
// }

export default AdPlatformV1TypeDefs;
