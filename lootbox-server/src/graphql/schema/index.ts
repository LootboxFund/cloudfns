import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  typeDefs as ScalarTypeDefs,
  resolvers as ScalarResolvers,
} from "graphql-scalars";
import CommonTypeDefs from "./common/typedefs";
import LootboxTypeDefs from "./lootbox/typedefs";
import UserTypeDefs from "./user/typedefs";
import TournamentTypeDefs from "./tournament/typedefs";
import LootboxResolvers from "./lootbox/resolvers";
import UserResolvers from "./user/resolvers";
import TournamentResolvers from "./tournament/resolvers";
import PartyBasketTypeDefs from "./partyBasket/typedefs";
import PartyBasketResolvers from "./partyBasket/resolvers";

const typeDefs = [
  ...ScalarTypeDefs,
  CommonTypeDefs,
  LootboxTypeDefs,
  UserTypeDefs,
  TournamentTypeDefs,
  PartyBasketTypeDefs,
];

const resolvers = {
  ...ScalarResolvers,
  ...LootboxResolvers,
  ...UserResolvers,
  ...TournamentResolvers,
  ...PartyBasketResolvers,
  Query: {
    ...ScalarResolvers.Query,
    ...LootboxResolvers.Query,
    ...UserResolvers.Query,
    ...TournamentResolvers.Query,
    ...PartyBasketResolvers.Query,
  },
  Mutation: {
    ...ScalarResolvers.Mutation,
    ...LootboxResolvers.Mutation,
    ...UserResolvers.Mutation,
    ...TournamentResolvers.Mutation,
    ...PartyBasketResolvers.Mutation,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
