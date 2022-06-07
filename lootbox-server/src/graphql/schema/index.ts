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

const typeDefs = [
  ...ScalarTypeDefs,
  CommonTypeDefs,
  LootboxTypeDefs,
  UserTypeDefs,
  TournamentTypeDefs,
];

const resolvers = {
  ...ScalarResolvers,
  ...LootboxResolvers,
  ...UserResolvers,
  ...TournamentResolvers,
  Query: {
    ...ScalarResolvers.Query,
    ...LootboxResolvers.Query,
    ...UserResolvers.Query,
    ...TournamentResolvers.Query,
  },
  Mutation: {
    ...ScalarResolvers.Mutation,
    ...LootboxResolvers.Mutation,
    ...UserResolvers.Mutation,
    ...TournamentResolvers.Mutation,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
