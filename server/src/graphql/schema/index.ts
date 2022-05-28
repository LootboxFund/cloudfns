import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  typeDefs as ScalarTypeDefs,
  resolvers as ScalarResolvers,
} from "graphql-scalars";
import CommonTypeDefs from "./common/typedefs";
import LootboxTypeDefs from "./lootbox/typedefs";
import LootboxResolvers from "./lootbox/resolvers";

const typeDefs = [...ScalarTypeDefs, CommonTypeDefs, LootboxTypeDefs];

const resolvers = {
  ...ScalarResolvers,
  ...LootboxResolvers,
  Query: {
    ...ScalarResolvers.Query,
    ...LootboxResolvers.Query,
  },
  Mutation: {
    ...ScalarResolvers.Mutation,
    ...LootboxResolvers.Mutation,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
