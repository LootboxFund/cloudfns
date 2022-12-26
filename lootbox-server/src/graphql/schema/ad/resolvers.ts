import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  createAd,
  createAdSet,
  editAd,
  editAdSet,
  getAd,
  getAdSet,
  getAdsOfAdSet,
  listAdSetsOfAdvertiser,
  listAdsOfAdvertiser,
} from "../../../api/firestore/ad";
import { AdID, AdvertiserID } from "@wormgraph/helpers";
import {
  Resolvers,
  StatusCode,
  CreateAdResponse,
  MutationCreateAdArgs,
  Ad,
  MutationEditAdArgs,
  MutationCreateAdSetArgs,
  MutationEditAdSetArgs,
  ListAdSetsOfAdvertiserResponse,
  QueryListAdSetsOfAdvertiserArgs,
  AdSet,
  QueryViewAdSetArgs,
  ViewAdSetResponse,
  QueryViewAdArgs,
  ViewAdResponse,
} from "../../generated/types";
import { Context } from "../../server";
import {
  QueryListAdsOfAdvertiserArgs,
  QueryDecisionAdApiBetaV2Args,
} from "../../generated/types";
import {
  ListAdsOfAdvertiserResponse,
  DecisionAdApiBetaV2Response,
} from "../../generated/types";
import {
  EditAdResponse,
  CreateAdSetResponse,
  EditAdSetResponse,
} from "../../generated/types";
import {
  decideAdToServe,
  decideAirdropAdToServe,
  getQuestionsForAd,
} from "../../../api/firestore/decision";
import { AdSetID, UserIdpID } from "@wormgraph/helpers";
import { checkIfUserIdpMatchesAdvertiser } from "../../../api/identityProvider/firebase";
import { isAuthenticated } from "../../../lib/permissionGuard";
import {
  QueryDecisionAdAirdropV1Args,
  DecisionAdAirdropV1Response,
} from "../../generated/types";

const AdResolvers: Resolvers = {
  Mutation: {
    createAd: async (
      _,
      { payload }: MutationCreateAdArgs,
      context: Context
    ): Promise<CreateAdResponse> => {
      // check if user making request is the actual advertiser
      const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
        context.userId || ("" as UserIdpID),
        payload.advertiserID as AdvertiserID
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
        const ad = await createAd(payload);
        if (!ad) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No ad created for advertiser ${payload.advertiserID}`,
            },
          };
        }
        return { ad: ad as Ad };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    editAd: async (
      _,
      { payload }: MutationEditAdArgs,
      context: Context
    ): Promise<EditAdResponse> => {
      try {
        const ad = await editAd(payload, context.userId || ("" as UserIdpID));
        if (!ad) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not edit ad ${payload.id}`,
            },
          };
        }
        return { ad: ad as Ad };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    createAdSet: async (
      _,
      { payload }: MutationCreateAdSetArgs,
      context: Context
    ): Promise<CreateAdSetResponse> => {
      // check if user making request is the actual advertiser
      const isValidUserAdvertiser = await checkIfUserIdpMatchesAdvertiser(
        context.userId || ("" as UserIdpID),
        payload.advertiserID as AdvertiserID
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
        const adSet = await createAdSet(payload);
        if (!adSet) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not create adset advertiser ${payload.advertiserID}`,
            },
          };
        }
        return { adSet };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    editAdSet: async (
      _,
      { payload }: MutationEditAdSetArgs,
      context: Context
    ): Promise<EditAdSetResponse> => {
      try {
        const adSet = await editAdSet(
          payload,
          context.userId || ("" as UserIdpID)
        );
        if (!adSet) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not edit adset ${payload.id}`,
            },
          };
        }
        return { adSet };
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
  Query: {
    listAdsOfAdvertiser: async (
      _,
      { advertiserID }: QueryListAdsOfAdvertiserArgs,
      context: Context
    ): Promise<ListAdsOfAdvertiserResponse> => {
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
        const ads = await listAdsOfAdvertiser(advertiserID as AdvertiserID);
        if (!ads) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not return ads for advertiser ID ${advertiserID}`,
            },
          };
        }
        return {
          ads,
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
    listAdSetsOfAdvertiser: async (
      _,
      { advertiserID }: QueryListAdSetsOfAdvertiserArgs,
      context: Context
    ): Promise<ListAdSetsOfAdvertiserResponse> => {
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
        const adSets = await listAdSetsOfAdvertiser(
          advertiserID as AdvertiserID
        );
        if (!adSets) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not return ads for advertiser ID ${advertiserID}`,
            },
          };
        }
        return {
          adSets,
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
    viewAdSet: async (
      _,
      { adSetID }: QueryViewAdSetArgs,
      context: Context
    ): Promise<ViewAdSetResponse> => {
      try {
        const adSet = await getAdSet(adSetID as AdSetID);
        if (!adSet) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not return get adSet=${adSetID}`,
            },
          };
        }
        return {
          adSet,
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
    viewAd: async (
      _,
      { adID }: QueryViewAdArgs,
      context: Context
    ): Promise<ViewAdResponse> => {
      try {
        const ad = await getAd(adID as AdID);
        if (!ad) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not return get ad=${adID}`,
            },
          };
        }
        return {
          ad,
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
    // Ad Decision API
    decisionAdApiBetaV2: async (
      _,
      { payload }: QueryDecisionAdApiBetaV2Args,
      context: Context
    ): Promise<DecisionAdApiBetaV2Response> => {
      try {
        const ad = await decideAdToServe(payload);
        const questions = await getQuestionsForAd(ad);
        if (!ad) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "No Ad could be served",
            },
          };
        }
        return { ad, questions };
      } catch (err) {
        // console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    decisionAdAirdropV1: async (
      _,
      { payload }: QueryDecisionAdAirdropV1Args,
      context: Context
    ): Promise<DecisionAdAirdropV1Response> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized. User ID not found",
          },
        };
      }
      try {
        console.log(`Retrieving ad for user ${context.userId}`);
        console.log(payload);
        const ad = await decideAirdropAdToServe(payload, context.userId);
        console.log(`Got ad... ${ad.adID}`);
        const questions = await getQuestionsForAd(ad);
        console.log(`questions.legnth = ${questions.length}}`);
        if (!ad) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "No Ad could be served",
            },
          };
        }
        return { ad, questions };
      } catch (err) {
        // console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
  },

  AdSet: {
    ads: async (adSet: AdSet): Promise<Ad[] | null> => {
      try {
        const ads = await getAdsOfAdSet(adSet.adIDs as AdID[]);
        return ads;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
  },

  CreateAdResponse: {
    __resolveType: (obj: CreateAdResponse) => {
      if ("ad" in obj) {
        return "CreateAdResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  EditAdResponse: {
    __resolveType: (obj: EditAdResponse) => {
      if ("ad" in obj) {
        return "EditAdResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  CreateAdSetResponse: {
    __resolveType: (obj: CreateAdSetResponse) => {
      if ("adSet" in obj) {
        return "CreateAdSetResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  EditAdSetResponse: {
    __resolveType: (obj: EditAdSetResponse) => {
      if ("adSet" in obj) {
        return "EditAdSetResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ListAdsOfAdvertiserResponse: {
    __resolveType: (obj: ListAdsOfAdvertiserResponse) => {
      if ("ads" in obj) {
        return "ListAdsOfAdvertiserResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ListAdSetsOfAdvertiserResponse: {
    __resolveType: (obj: ListAdSetsOfAdvertiserResponse) => {
      if ("adSets" in obj) {
        return "ListAdSetsOfAdvertiserResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ViewAdSetResponse: {
    __resolveType: (obj: ViewAdSetResponse) => {
      if ("adSet" in obj) {
        return "ViewAdSetResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ViewAdResponse: {
    __resolveType: (obj: ViewAdResponse) => {
      if ("ad" in obj) {
        return "ViewAdResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  /**
   *
   * getAd() {
   *  const ad = getAdFirestore()
   *  const creative = getAdCreative()
   *  return { ad, creative }
   * }
   *
   */

  // Ad: {
  //   creative: async (ad: Ad): Promise<Creative | null> => {
  //     const creative = await getCreativeById(ad.creativeId as CreativeID);
  //     if (!creative) {
  //       return null;
  //     } else {
  //       return creative;
  //     }
  //   },
  // },

  DecisionAdApiBetaV2Response: {
    __resolveType: (obj: DecisionAdApiBetaV2Response) => {
      if ("ad" in obj) {
        return "DecisionAdApiBetaV2ResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  DecisionAdAirdropV1Response: {
    __resolveType: (obj: DecisionAdAirdropV1Response) => {
      if ("ad" in obj) {
        return "DecisionAdAirdropV1ResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const adComposition = {
  "Mutation.createAd": [isAuthenticated()],
  "Mutation.editAd": [isAuthenticated()],
  "Mutation.createAdSet": [isAuthenticated()],
  "Mutation.editAdSet": [isAuthenticated()],
  "Query.listAdsOfAdvertiser": [isAuthenticated()],
  "Query.listAdSetsOfAdvertiser": [isAuthenticated()],
  "Query.decisionAdApiBetaV2": [],
  "Query.viewAdSet": [isAuthenticated()],
  "Query.viewAd": [isAuthenticated()],
};

const resolvers = composeResolvers(AdResolvers, adComposition);

export default resolvers;
