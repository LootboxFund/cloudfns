import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { ConquestID, UserIdpID } from "@wormgraph/helpers";
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
import { checkIfUserIdpMatchesAdvertiser } from "../../../api/identityProvider/firebase";
import { isAuthenticated } from "../../../lib/permissionGuard";

const AdvertiserResolvers: Resolvers = {
  Query: {
    advertiserAdminView: async (
      _,
      args,
      context: Context
    ): Promise<AdvertiserAdminViewResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
      try {
        const advertiser = await advertiserAdminView(context.userId);
        if (!advertiser) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No advertiser found for user IDP ${context.userId}`,
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
      args: QueryAdvertiserPublicViewArgs,
      context: Context
    ): Promise<AdvertiserPublicViewResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
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
      args: QueryListConquestPreviewsArgs,
      context: Context
    ): Promise<ListConquestPreviewsResponse> => {
      // check if user making request is the actual advertiser
      const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
        context.userId || ("" as UserIdpID),
        args.advertiserID as AdvertiserID
      );
      if (!isValidUserAdvertiser) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized. User do not have permissions for this advertiser`,
          },
        };
      }
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
      args: QueryGetConquestArgs,
      context: Context
    ): Promise<GetConquestResponse> => {
      try {
        const conquestWithTournaments = await getConquest(
          args.advertiserID as AdvertiserID,
          args.conquestID as ConquestID,
          context.userId || ("" as UserIdpID)
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
      try {
        const advertiser = await upgradeToAdvertiser(
          payload.userID as UserID,
          context.userId || ("" as UserIdpID)
        );
        if (!advertiser) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No advertiser created for user ${payload.userID}`,
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
      // check if user making request is the actual advertiser
      const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
        context.userId || ("" as UserIdpID),
        advertiserID as AdvertiserID
      );
      if (!isValidUserAdvertiser) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized. User do not have permissions for this advertiser`,
          },
        };
      }
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
      { advertiserID, payload }: MutationCreateConquestArgs,
      context: Context
    ): Promise<CreateConquestResponse> => {
      // check if user making request is the actual advertiser
      const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
        context.userId || ("" as UserIdpID),
        advertiserID as AdvertiserID
      );
      if (!isValidUserAdvertiser) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized. User do not have permissions for this advertiser`,
          },
        };
      }
      try {
        const conquest = await createConquest(
          payload.title || "",
          advertiserID as AdvertiserID
        );
        if (!conquest) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No conquest for advertiser ${advertiserID} created`,
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
      try {
        const conquest = await updateConquest(
          payload.id as ConquestID,
          advertiserID as AdvertiserID,
          payload,
          context.userId || ("" as UserIdpID)
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
  "Mutation.upgradeToAdvertiser": [isAuthenticated()],
  "Mutation.updateAdvertiserDetails": [isAuthenticated()],
  "Mutation.createConquest": [isAuthenticated()],
  "Mutation.updateConquest": [isAuthenticated()],
  "Query.getAdvertiserAdminView": [isAuthenticated()],
  "Query.getAdvertiserPublicView": [isAuthenticated()],
  "Query.listConquestPreviews": [isAuthenticated()],
  "Query.getConquest": [isAuthenticated()],
};

const resolvers = composeResolvers(AdvertiserResolvers, advertiserComposition);

export default resolvers;
