import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { ConquestID } from "@wormgraph/helpers";
import {
  advertiserAdminView,
  advertiserPublicView,
  createConquest,
  getConquest,
  listConquestPreviews,
  updateAdvertiserDetails,
  updateConquest,
  upgradeToAdvertiser,
} from "../../../api/firestore/advertiser";
import { AdvertiserID, UserID } from "../../../lib/types";
import {
  Advertiser,
  AdvertiserAdminViewResponse,
  AdvertiserPublicViewResponse,
  Conquest,
  CreateConquestResponse,
  GetConquestResponse,
  ListConquestPreviewsResponse,
  MutationCreateConquestArgs,
  MutationUpdateAdvertiserDetailsArgs,
  MutationUpdateConquestArgs,
  MutationUpgradeToAdvertiserArgs,
  QueryAdvertiserAdminViewArgs,
  QueryAdvertiserPublicViewArgs,
  QueryGetConquestArgs,
  QueryListConquestPreviewsArgs,
  Resolvers,
  StatusCode,
  UpdateAdvertiserDetailsResponse,
  UpdateConquestResponse,
  UpgradeToAdvertiserResponse,
} from "../../generated/types";
import { Context } from "../../server";
import { ConquestWithTournaments } from "../../../api/firestore/advertiser.type";

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
    listConquestPreviews: async (
      _,
      args: QueryListConquestPreviewsArgs
    ): Promise<ListConquestPreviewsResponse> => {
      try {
        const conquest_previews = await listConquestPreviews(
          args.advertiserID as AdvertiserID
        );
        if (!conquest_previews) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not retrieve conquest previews for AdvertiserID ${args.advertiserID}`,
            },
          };
        }
        return {
          conquests: conquest_previews,
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
    getConquest: async (
      _,
      args: QueryGetConquestArgs
    ): Promise<GetConquestResponse> => {
      try {
        const conquestWithTournaments = await getConquest(
          args.advertiserID as AdvertiserID,
          args.conquestID as ConquestID
        );
        if (!conquestWithTournaments) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No conquest ${args.conquestID} found for advertiser ${args.advertiserID}`,
            },
          };
        }
        return conquestWithTournaments;
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
    createConquest: async (
      _,
      { payload }: MutationCreateConquestArgs,
      context: Context
    ): Promise<CreateConquestResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const conquest = await createConquest(
          payload.title || "",
          payload.advertiserID as AdvertiserID
        );
        if (!conquest) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No conquest for advertiser ${payload.advertiserID} created`,
            },
          };
        }
        const conquestGQL = conquest as unknown as Conquest;
        return { conquest: conquestGQL };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    updateConquest: async (
      _,
      { advertiserID, payload }: MutationUpdateConquestArgs,
      context: Context
    ): Promise<UpdateConquestResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const conquest = await updateConquest(
          payload.id as ConquestID,
          advertiserID as AdvertiserID,
          payload
        );
        if (!conquest) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No conquest with ${payload.id} updated`,
            },
          };
        }
        const conquestGQL = conquest as unknown as Conquest;
        return { conquest: conquestGQL };
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
  CreateConquestResponse: {
    __resolveType: (obj: CreateConquestResponse) => {
      if ("conquest" in obj) {
        return "CreateConquestResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  UpdateConquestResponse: {
    __resolveType: (obj: UpdateConquestResponse) => {
      if ("conquest" in obj) {
        return "UpdateConquestResponseSuccess";
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
  ListConquestPreviewsResponse: {
    __resolveType: (obj: ListConquestPreviewsResponse) => {
      if ("conquests" in obj) {
        return "ListConquestPreviewsResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  GetConquestResponse: {
    __resolveType: (obj: GetConquestResponse) => {
      if ("conquest" in obj) {
        return "GetConquestResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const advertiserComposition = {
  "Mutation.upgradeToAdvertiser": [],
  "Mutation.updateAdvertiserDetails": [],
  "Mutation.createConquest": [],
  "Mutation.updateConquest": [],
  "Query.getAdvertiserAdminView": [],
  "Query.getAdvertiserPublicView": [],
  "Query.listConquestPreviews": [],
  "Query.getConquest": [],
};

const resolvers = composeResolvers(AdvertiserResolvers, advertiserComposition);

export default resolvers;
