import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { getScrollFeedAds } from "../../../api/ad-platform/v1/scrollFeed";

import { AdsScrollFeedV1Response, StatusCode } from "../../generated/types";
import { Context } from "../../server";

const AdPlatformResolversV1 = {
  Query: {
    myScrollFeed: async (
      _,
      {},
      context: Context
    ): Promise<AdsScrollFeedV1Response> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }

      try {
        const scrollFeedAds = await getScrollFeedAds();
        return { scrollFeedAds };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
  },
  AdsScrollFeedV1Response: {
    __resolveType: (obj: AdsScrollFeedV1Response) => {
      if ("scrollFeedAds" in obj) {
        return "AdsScrollFeedV1ResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },
};

const AdPlatformV1ResolverComposition = {
  "Query.myScrollFeed": [],
};

const resolvers = composeResolvers(
  AdPlatformResolversV1,
  AdPlatformV1ResolverComposition
);

export default resolvers;
