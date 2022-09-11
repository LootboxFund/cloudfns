import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { Resolvers } from "../../generated/types";

const AdvertiserResolvers: Resolvers = {
  Query: {
    // advertiserAdminView: async (
    //   _,
    //   args: AdvertiserAdminViewArgs
    // ): Promise<AdvertiserAdminViewResponse> => {
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
    // advertiserPublicView: async (
    //   _,
    //   args: AdvertiserPublicViewArgs
    // ): Promise<AdvertiserPublicViewResponse> => {
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
  Mutation: {},

  // AdvertiserAdminViewResponse: {
  //   __resolveType: (obj: AdvertiserAdminViewResponse) => {
  //     if ("userID" in obj) {
  //       return "AdvertiserAdminViewResponseSuccess";
  //     }
  //     if ("error" in obj) {
  //       return "ResponseError";
  //     }

  //     return null;
  //   },
  // },
  // AdvertiserPublicViewResponse: {
  //   __resolveType: (obj: AdvertiserPublicViewResponse) => {
  //     if ("name" in obj) {
  //       return "AdvertiserPublicViewResponseSuccess";
  //     }
  //     if ("error" in obj) {
  //       return "ResponseError";
  //     }

  //     return null;
  //   },
  // },
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

const advertiserComposition = {};

const resolvers = composeResolvers(AdvertiserResolvers, advertiserComposition);

export default resolvers;
