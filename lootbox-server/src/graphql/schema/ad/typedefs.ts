import { gql } from "apollo-server";

const AdTypeDefs = gql`

type Campaign {
   # metadata
   id: ID!
   creatorId: ID!
   campaignName: String

   # ad config data
   callToActionText: String
   callToActionUrl: String
   videoUrl: String!
   thumbnailUrl: String!
   infographicUrl [potentially un-needed with the proposed UI using past winning tickets]
   themeColor [optional]

   isVerificationImageRequired? boolean [optional]. # if they must submit photo evidence

   # Ad subcollection (below)
   # These are in flight or previously served ads
   ads: Ad[]
}




  
  
  
  extend type Query {
    getPartyBasket(address: ID!): GetPartyBasketResponse!
  }





  extend type Mutation {

  }

`;

export default AdTypeDefs;
