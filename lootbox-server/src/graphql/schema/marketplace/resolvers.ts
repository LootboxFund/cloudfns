import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { getAffiliateByUserIdpID } from "../../../api/firestore/affiliate";
import {
  browseActiveOffers,
  browseAllAffiliates,
} from "../../../api/firestore/marketplace";
import {
  BrowseActiveOffersResponse,
  BrowseAllAffiliatesResponse,
  Resolvers,
  StatusCode,
} from "../../generated/types";
import { Context } from "../../server";

const MarketplaceResolvers: Resolvers = {
  Query: {
    browseActiveOffers: async (
      _,
      args,
      context: Context,
      info
    ): Promise<BrowseActiveOffersResponse> => {
      info.cacheControl.setCacheHint({
        maxAge: 60 * 60 * 24,
        // @ts-ignore
        scope: "PRIVATE",
      });
      try {
        const affiliate = await getAffiliateByUserIdpID(context.userId);
        const offers = await browseActiveOffers(affiliate.organizerRank);
        if (!offers) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `An error occurred when browsing for offers in marketplace`,
            },
          };
        }
        return {
          offers,
        };
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    browseAllAffiliates: async (
      _,
      args,
      context: Context,
      info
    ): Promise<BrowseAllAffiliatesResponse> => {
      // @ts-ignore
      info.cacheControl.setCacheHint({ maxAge: 60 * 60 * 24, scope: "PUBLIC" });
      try {
        const affiliates = await browseAllAffiliates();
        if (!affiliates) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `An error occurred when browsing for affiliates in marketplace`,
            },
          };
        }
        return {
          affiliates,
        };
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
  },
  BrowseActiveOffersResponse: {
    __resolveType: (obj: BrowseActiveOffersResponse) => {
      if ("offers" in obj) {
        return "BrowseActiveOffersResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },
  BrowseAllAffiliatesResponse: {
    __resolveType: (obj: BrowseAllAffiliatesResponse) => {
      if ("affiliates" in obj) {
        return "BrowseAllAffiliatesResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },
};

const marketplaceResolverComposition = {};

const marketplaceResolvers = composeResolvers(
  MarketplaceResolvers,
  marketplaceResolverComposition
);

export default marketplaceResolvers;
