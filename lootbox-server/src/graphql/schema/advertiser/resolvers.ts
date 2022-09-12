import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  advertiserAdminView,
  advertiserPublicView,
  updateAdvertiserDetails,
  upgradeToAdvertiser,
} from "../../../api/firestore/advertiser";
import { AdvertiserID, UserID } from "../../../lib/types";
import {
  Advertiser,
  AdvertiserAdminViewResponse,
  AdvertiserPublicViewResponse,
  MutationUpdateAdvertiserDetailsArgs,
  MutationUpgradeToAdvertiserArgs,
  QueryAdvertiserAdminViewArgs,
  QueryAdvertiserPublicViewArgs,
  Resolvers,
  StatusCode,
  UpdateAdvertiserDetailsResponse,
  UpgradeToAdvertiserResponse,
} from "../../generated/types";
import { Context } from "../../server";

const AdvertiserResolvers: Resolvers = {
  Query: {
    advertiserAdminView: async (
      _,
      args: QueryAdvertiserAdminViewArgs
    ): Promise<AdvertiserAdminViewResponse> => {
      try {
        const advertiser = await advertiserAdminView(
          args.advertiserId as AdvertiserID
        );
        if (!advertiser) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No advertiser found with ID ${args.advertiserId}`,
            },
          };
        }
        return {
          ...advertiser,
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
    advertiserPublicView: async (
      _,
      args: QueryAdvertiserPublicViewArgs
    ): Promise<AdvertiserPublicViewResponse> => {
      try {
        const advertiser = await advertiserPublicView(
          args.advertiserId as AdvertiserID
        );
        if (!advertiser) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No advertiser found with ID ${args.advertiserId}`,
            },
          };
        }
        return {
          ...advertiser,
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
    // listConquests: async (
    //   _,
    //   args: ListConquestPreviewsArgs
    // ): Promise<ListConquestPreviewsResponse> => {
    //   try {
    //     return {};
    //   } catch (err) {
    //     console.error(err);
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
    // getConquest: async (
    //   _,
    //   args: GetConquestArgs
    // ): Promise<GetConquestResponse> => {
    //   try {
    //     return {};
    //   } catch (err) {
    //     console.error(err);
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
  },
  Mutation: {
    upgradeToAdvertiser: async (
      _,
      { payload }: MutationUpgradeToAdvertiserArgs,
      context: Context
    ): Promise<UpgradeToAdvertiserResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const advertiser = await upgradeToAdvertiser(payload.userID as UserID);
        if (!advertiser) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No advertiser created`,
            },
          };
        }
        const advertiserGQL = advertiser as unknown as Advertiser;
        return { advertiser: advertiserGQL };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    updateAdvertiserDetails: async (
      _,
      { advertiserID, payload }: MutationUpdateAdvertiserDetailsArgs,
      context: Context
    ): Promise<UpdateAdvertiserDetailsResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const advertiser = await updateAdvertiserDetails(
          advertiserID as AdvertiserID,
          payload
        );
        if (!advertiser) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No advertiser with ID ${advertiserID} updated`,
            },
          };
        }
        const advertiserGQL = advertiser as unknown as Advertiser;
        return { advertiser: advertiserGQL };
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

  UpgradeToAdvertiserResponse: {
    __resolveType: (obj: UpgradeToAdvertiserResponse) => {
      if ("advertiser" in obj) {
        return "UpgradeToAdvertiserResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  UpdateAdvertiserDetailsResponse: {
    __resolveType: (obj: UpdateAdvertiserDetailsResponse) => {
      if ("advertiser" in obj) {
        return "UpdateAdvertiserDetailsResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  AdvertiserAdminViewResponse: {
    __resolveType: (obj: AdvertiserAdminViewResponse) => {
      if ("userID" in obj) {
        return "AdvertiserAdminViewResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },
  AdvertiserPublicViewResponse: {
    __resolveType: (obj: AdvertiserPublicViewResponse) => {
      if ("id" in obj) {
        return "AdvertiserPublicViewResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  // ListConquestPreviewsResponse: {
  //   __resolveType: (obj: ListConquestPreviewsResponse) => {
  //     if ("conquests" in obj) {
  //       return "ListConquestPreviewsResponseSuccess";
  //     }
  //     if ("error" in obj) {
  //       return "ResponseError";
  //     }

  //     return null;
  //   },
  // },
  // GetConquestResponse: {
  //   __resolveType: (obj: GetConquestResponse) => {
  //     if ("conquest" in obj) {
  //       return "GetConquestResponseSuccess";
  //     }
  //     if ("error" in obj) {
  //       return "ResponseError";
  //     }

  //     return null;
  //   },
  // },
};

const advertiserComposition = {
  "Mutation.upgradeToAdvertiser": [],
  "Mutation.updateAdvertiserDetails": [],
  "Query.getAdvertiserAdminView": [],
  "Query.getAdvertiserPublicView": [],
};

const resolvers = composeResolvers(AdvertiserResolvers, advertiserComposition);

export default resolvers;
