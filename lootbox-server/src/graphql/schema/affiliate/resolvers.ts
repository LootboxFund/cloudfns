import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { AffiliateID, UserID } from "../../../lib/types";
import {
  Affiliate,
  MutationUpgradeToAffiliateArgs,
  MutationWhitelistAffiliateToOfferArgs,
  QueryAffiliatePublicViewArgs,
  Resolvers,
  StatusCode,
  UpgradeToAffiliateResponse,
} from "../../generated/types";
import { Context } from "../../server";
import { WhitelistAffiliateToOfferResponse } from "../../generated/types";
import {
  affiliateAdminView,
  affiliatePublicView,
  upgradeToAffiliate,
  whitelistAffiliateToOffer,
} from "../../../api/firestore/affiliate";
import {
  AffiliateAdminViewResponse,
  AffiliatePublicViewResponse,
  QueryAffiliateAdminViewArgs,
} from "../../generated/types";

const AffiliateResolvers: Resolvers = {
  Query: {
    affiliateAdminView: async (
      _,
      { affiliateID }: QueryAffiliateAdminViewArgs
    ): Promise<AffiliateAdminViewResponse> => {
      try {
        const affiliate = await affiliateAdminView(affiliateID as AffiliateID);
        if (!affiliate) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No affiliate found with ID ${affiliate}`,
            },
          };
        }
        return {
          affiliate,
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
    affiliatePublicView: async (
      _,
      { affiliateID }: QueryAffiliatePublicViewArgs
    ): Promise<AffiliatePublicViewResponse> => {
      try {
        const affiliate = await affiliatePublicView(affiliateID as AffiliateID);
        if (!affiliate) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No affiliate found with ID ${affiliateID}`,
            },
          };
        }
        return {
          affiliate,
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
  Mutation: {
    upgradeToAffiliate: async (
      _,
      { userID }: MutationUpgradeToAffiliateArgs,
      context: Context
    ): Promise<UpgradeToAffiliateResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const affiliate = await upgradeToAffiliate(userID as UserID);
        if (!affiliate) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No affiliate created for user ${userID}`,
            },
          };
        }
        const affiliateGQL = affiliate as unknown as Affiliate;
        return { affiliate: affiliateGQL };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    whitelistAffiliateToOffer: async (
      _,
      { payload }: MutationWhitelistAffiliateToOfferArgs,
      context: Context
    ): Promise<WhitelistAffiliateToOfferResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        await whitelistAffiliateToOffer(payload);
        return {
          message: `Successfully whitelisted affiliate=${payload.affiliateID} to offer=${payload.offerID} from advertiser=${payload.advertiserID}`,
        };
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

  UpgradeToAffiliateResponse: {
    __resolveType: (obj: UpgradeToAffiliateResponse) => {
      if ("affiliate" in obj) {
        return "UpgradeToAffiliateResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  AffiliateAdminViewResponse: {
    __resolveType: (obj: AffiliateAdminViewResponse) => {
      if ("affiliate" in obj) {
        return "AffiliateAdminViewResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  AffiliatePublicViewResponse: {
    __resolveType: (obj: AffiliatePublicViewResponse) => {
      if ("affiliate" in obj) {
        return "AffiliatePublicViewResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  WhitelistAffiliateToOfferResponse: {
    __resolveType: (obj: WhitelistAffiliateToOfferResponse) => {
      if ("message" in obj) {
        return "WhitelistAffiliateToOfferResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const AffiliateComposition = {
  "Mutation.upgradeToAffililate": [],
};

const resolvers = composeResolvers(AffiliateResolvers, AffiliateComposition);

export default resolvers;
