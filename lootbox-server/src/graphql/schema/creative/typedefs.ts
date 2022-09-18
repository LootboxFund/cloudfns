// import { gql } from "apollo-server";

// const CreativeTypeDefs = gql`
//   enum CreativeType {
//     image
//     video
//   }
//   type Creative {
//     id: ID!
//     advertiserID: ID! # [usually == creatorId, but can be a separate abstraction]
//     creativeType: CreativeType!
//     creativeLinks: [String!]! # For video, we need webm (ios) + mp4 (other) support for best coverage. thats why this is an array
//     callToAction: String
//     thumbnail: String
//     infographicLink: String
//     aspectRatio: String! # Temp hardcoded for mobile fullscreen video
//     themeColor: String
//   }
// `;

// export default CreativeTypeDefs;
