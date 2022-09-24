import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Resolvers } from "../../generated/types";

const MarketplaceResolvers: Resolvers = {};

const marketplaceResolverComposition = {};

const marketplaceResolvers = composeResolvers(
  MarketplaceResolvers,
  marketplaceResolverComposition
);

export default marketplaceResolvers;
