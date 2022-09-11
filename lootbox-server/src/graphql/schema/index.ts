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
import ReferralTypeDefs from "./referral/typedefs";
import LootboxResolvers from "./lootbox/resolvers";
import UserResolvers from "./user/resolvers";
import TournamentResolvers from "./tournament/resolvers";
import PartyBasketTypeDefs from "./partyBasket/typedefs";
import PartyBasketResolvers from "./partyBasket/resolvers";
import ReferralResolvers from "./referral/resolvers";
import AdTypeDefs from "./ad/typedefs";
import AdResolvers from "./ad/resolvers";
import CreativeResolvers from "./creative/resolvers";
import CreativeTypeDefs from "./creative/typedefs";

const typeDefs = [
  ...ScalarTypeDefs,
  CommonTypeDefs,
  LootboxTypeDefs,
  UserTypeDefs,
  TournamentTypeDefs,
  AdvertiserTypeDefs,
  PartyBasketTypeDefs,
  ReferralTypeDefs,
  AdTypeDefs,
  CreativeTypeDefs,
];

const resolvers = {
  ...ScalarResolvers,
  ...LootboxResolvers,
  ...UserResolvers,
  ...TournamentResolvers,
  ...PartyBasketResolvers,
  ...ReferralResolvers,
  ...AdResolvers,
  ...CreativeResolvers,
  Query: {
    ...ScalarResolvers.Query,
    ...LootboxResolvers.Query,
    ...UserResolvers.Query,
    ...TournamentResolvers.Query,
    ...PartyBasketResolvers.Query,
    ...ReferralResolvers.Query,
    ...AdResolvers.Query,
    ...CreativeResolvers.Query,
  },
  Mutation: {
    ...ScalarResolvers.Mutation,
    ...LootboxResolvers.Mutation,
    ...UserResolvers.Mutation,
    ...TournamentResolvers.Mutation,
    ...PartyBasketResolvers.Mutation,
    ...ReferralResolvers.Mutation,
    ...AdResolvers.Mutation,
    ...CreativeResolvers.Mutation,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
