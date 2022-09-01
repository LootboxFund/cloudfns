import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Resolvers } from "../../generated/types";

const AdResolvers: Resolvers = {
  Query: {},
};

const adComposition = {};

const resolvers = composeResolvers(AdResolvers, adComposition);

export default resolvers;
