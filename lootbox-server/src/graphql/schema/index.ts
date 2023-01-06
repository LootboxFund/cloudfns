import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  typeDefs as ScalarTypeDefs,
  resolvers as ScalarResolvers,
} from "graphql-scalars";
import CommonTypeDefs from "./common/typedefs";
import LootboxTypeDefs from "./lootbox/typedefs";
import UserTypeDefs from "./user/typedefs";
import TournamentTypeDefs from "./tournament/typedefs";
import AdvertiserTypeDefs from "./advertiser/typedefs";
import AnalyticsTypeDefs from "./analytics/typedefs";
import AffiliateTypeDefs from "./affiliate/typedefs";
import OfferTypeDefs from "./offer/typedefs";
import MarketplaceTypeDefs from "./marketplace/typedefs";
import ReferralTypeDefs from "./referral/typedefs";
import LootboxResolvers from "./lootbox/resolvers";
import UserResolvers from "./user/resolvers";
import AnalyticsResolvers from "./analytics/resolvers";
import TournamentResolvers from "./tournament/resolvers";
import AdvertiserResolvers from "./advertiser/resolvers";
import AffiliateResolvers from "./affiliate/resolvers";
import OfferResolvers from "./offer/resolvers";
import MarketplaceResolvers from "./marketplace/resolvers";
import ReferralResolvers from "./referral/resolvers";
import AdTypeDefs from "./ad/typedefs";
import AdResolvers from "./ad/resolvers";
// import CreativeResolvers from "./creative/resolvers";
// import CreativeTypeDefs from "./creative/typedefs";

const typeDefs = [
  ...ScalarTypeDefs,
  CommonTypeDefs,
  LootboxTypeDefs,
  TournamentTypeDefs,
  UserTypeDefs,
  AdvertiserTypeDefs,
  AffiliateTypeDefs,
  OfferTypeDefs,
  MarketplaceTypeDefs,
  AdTypeDefs,
  AnalyticsTypeDefs,
  ReferralTypeDefs,
];

const resolvers = {
  ...ScalarResolvers,
  ...LootboxResolvers,
  ...UserResolvers,
  ...TournamentResolvers,
  ...AdvertiserResolvers,
  ...OfferResolvers,
  ...MarketplaceResolvers,
  ...AffiliateResolvers,
  ...ReferralResolvers,
  ...AdResolvers,
  ...AnalyticsResolvers,
  Query: {
    ...ScalarResolvers.Query,
    ...LootboxResolvers.Query,
    ...UserResolvers.Query,
    ...TournamentResolvers.Query,
    ...AdvertiserResolvers.Query,
    ...OfferResolvers.Query,
    ...MarketplaceResolvers.Query,
    ...AffiliateResolvers.Query,
    ...ReferralResolvers.Query,
    ...AdResolvers.Query,
    ...AnalyticsResolvers.Query,
  },
  Mutation: {
    ...ScalarResolvers.Mutation,
    ...LootboxResolvers.Mutation,
    ...UserResolvers.Mutation,
    ...TournamentResolvers.Mutation,
    ...AdvertiserResolvers.Mutation,
    ...OfferResolvers.Mutation,
    ...MarketplaceResolvers.Mutation,
    ...AffiliateResolvers.Mutation,
    ...ReferralResolvers.Mutation,
    ...AdResolvers.Mutation,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
