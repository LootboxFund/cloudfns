import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  // getAdById,
  getClaimById,
  // getCreativeById,
  getTournamentById,
} from "../../../api/firestore";
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
import {
  AdID,
  AdvertiserID,
  ClaimID,
  CreativeID,
  TournamentID,
} from "../../../lib/types";
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
import { AdSet_Firestore } from "../../../api/firestore/ad.types";
import {
  EditAdResponse,
  CreateAdSetResponse,
  EditAdSetResponse,
} from "../../generated/types";
import { decideAdToServe } from "../../../api/firestore/decision";
import { AdSetID } from "@wormgraph/helpers";

const AdResolvers: Resolvers = {
  Mutation: {
    createAd: async (
      _,
      { payload }: MutationCreateAdArgs,
      context: Context
    ): Promise<CreateAdResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const ad = await editAd(payload);
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const adSet = await editAdSet(payload);
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
      { advertiserID }: QueryListAdsOfAdvertiserArgs
    ): Promise<ListAdsOfAdvertiserResponse> => {
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
      { advertiserID }: QueryListAdSetsOfAdvertiserArgs
    ): Promise<ListAdSetsOfAdvertiserResponse> => {
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
    decisionAdApiBetaV2: async (
      _,
      { payload }: QueryDecisionAdApiBetaV2Args
    ): Promise<DecisionAdApiBetaV2Response> => {
      try {
        const ad = await decideAdToServe(payload);
        if (!ad) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "No Ad could be served",
            },
          };
        }
        return { ad };
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
      { adSetID }: QueryViewAdSetArgs
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
    viewAd: async (_, { adID }: QueryViewAdArgs): Promise<ViewAdResponse> => {
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
};

const adComposition = {};

const resolvers = composeResolvers(AdResolvers, adComposition);

export default resolvers;
