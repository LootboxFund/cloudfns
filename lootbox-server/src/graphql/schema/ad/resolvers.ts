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
} from "../../generated/types";
import { Context } from "../../server";
import { QueryListAdsOfAdvertiserArgs } from "../../generated/types";
import { ListAdsOfAdvertiserResponse } from "../../generated/types";
import { AdSet_Firestore } from "../../../api/firestore/ad.types";
import {
  EditAdResponse,
  CreateAdSetResponse,
  EditAdSetResponse,
} from "../../generated/types";

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
      { payload }: QueryListAdsOfAdvertiserArgs
    ): Promise<ListAdsOfAdvertiserResponse> => {
      try {
        const ads = await listAdsOfAdvertiser(
          payload.advertiserID as AdvertiserID
        );
        if (!ads) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not return ads for advertiser ID ${payload.advertiserID}`,
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
      { payload }: QueryListAdSetsOfAdvertiserArgs
    ): Promise<ListAdSetsOfAdvertiserResponse> => {
      try {
        const adSets = await listAdSetsOfAdvertiser(
          payload.advertiserID as AdvertiserID
        );
        if (!adSets) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not return ads for advertiser ID ${payload.advertiserID}`,
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
    // decisionAdApiBeta: async (
    //   _,
    //   args: QueryDecisionAdApiBetaArgs
    // ): Promise<DecisionAdApiBetaResponse> => {
    //   try {
    //     const tournament = await getTournamentById(
    //       args.tournamentId as TournamentID
    //     );
    //     if (!tournament) {
    //       return {
    //         error: {
    //           code: StatusCode.NotFound,
    //           message: "Tournament not found",
    //         },
    //       };
    //     }
    //     if (tournament.affiliateAdIds && tournament.affiliateAdIds.length > 0) {
    //       // get the first ad
    //       const ad = await getAdById(tournament.affiliateAdIds[0] as AdID);
    //       return { ad: !!ad ? ad : null };
    //     }
    //     return { ad: null };
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

  // DecisionAdApiBetaResponse: {
  //   __resolveType: (obj: DecisionAdApiBetaResponse) => {
  //     if ("ad" in obj) {
  //       return "DecisionAdApiBetaResponseSuccess";
  //     }
  //     if ("error" in obj) {
  //       return "ResponseError";
  //     }

  //     return null;
  //   },
  // },
};

const adComposition = {};

const resolvers = composeResolvers(AdResolvers, adComposition);

export default resolvers;
