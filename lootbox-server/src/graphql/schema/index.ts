import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  typeDefs as ScalarTypeDefs,
  resolvers as ScalarResolvers,
} from "graphql-scalars";
import CommonTypeDefs from "./common/typedefs";
import LootboxTypeDefs from "./lootbox/typedefs";
import UserTypeDefs from "./user/typedefs";
import TournamentTypeDefs from "./tournament/typedefs";
import ReferralTypeDefs from "./referral/typedefs";
import LootboxResolvers from "./lootbox/resolvers";
import UserResolvers from "./user/resolvers";
import TournamentResolvers from "./tournament/resolvers";
import PartyBasketTypeDefs from "./partyBasket/typedefs";
import PartyBasketResolvers from "./partyBasket/resolvers";
import ReferralResolvers from "./referral/resolvers";

const typeDefs = [
  ...ScalarTypeDefs,
  CommonTypeDefs,
  LootboxTypeDefs,
  UserTypeDefs,
  TournamentTypeDefs,
  PartyBasketTypeDefs,
  ReferralTypeDefs,
];

const resolvers = {
  ...ScalarResolvers,
  ...LootboxResolvers,
  ...UserResolvers,
  ...TournamentResolvers,
  ...PartyBasketResolvers,
  ...ReferralResolvers,
  Query: {
    ...ScalarResolvers.Query,
    ...LootboxResolvers.Query,
    ...UserResolvers.Query,
    ...TournamentResolvers.Query,
    ...PartyBasketResolvers.Query,
    ...ReferralResolvers.Query,
  },
  Mutation: {
    ...ScalarResolvers.Mutation,
    ...LootboxResolvers.Mutation,
    ...UserResolvers.Mutation,
    ...TournamentResolvers.Mutation,
    ...PartyBasketResolvers.Mutation,
    ...ReferralResolvers.Mutation,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
