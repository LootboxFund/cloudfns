import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { AffiliateID, UserID } from "../../../lib/types";
import {
  Affiliate,
  // MutationRemoveWhitelistAffiliateToOfferArgs,
  MutationUpgradeToAffiliateArgs,
  // MutationWhitelistAffiliateToOfferArgs,
  QueryAffiliatePublicViewArgs,
  Resolvers,
  StatusCode,
  UpgradeToAffiliateResponse,
} from "../../generated/types";
import { Context } from "../../server";
import {
  WhitelistAffiliateToOfferResponse,
  RemoveWhitelistAffiliateToOfferResponse,
} from "../../generated/types";
import {
  affiliateAdminView,
  affiliatePublicView,
  removeWhitelistAffiliateToOffer,
  upgradeToAffiliate,
  whitelistAffiliateToOffer,
} from "../../../api/firestore/affiliate";
import {
  AffiliateAdminViewResponse,
  AffiliatePublicViewResponse,
  QueryAffiliateAdminViewArgs,
} from "../../generated/types";
import { OrganizerOfferWhitelistID } from "@wormgraph/helpers";
import { checkIfUserIdpMatchesAffiliate } from "../../../api/identityProvider/firebase";

const AffiliateResolvers: Resolvers = {
  Query: {
    affiliateAdminView: async (
      _,
      { affiliateID }: QueryAffiliateAdminViewArgs,
      context: Context
    ): Promise<AffiliateAdminViewResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      // check if user making request is the actual advertiser
      const isValidUserAffiliate = await checkIfUserIdpMatchesAffiliate(
        context.userId,
        affiliateID as AffiliateID
      );
      if (!isValidUserAffiliate) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized. User do not have permissions for this affiliate`,
          },
        };
      }
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
      { affiliateID }: QueryAffiliatePublicViewArgs,
      context: Context
    ): Promise<AffiliatePublicViewResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
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
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
      try {
        const affiliate = await upgradeToAffiliate(
          userID as UserID,
          context.userId
        );
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
    // whitelistAffiliateToOffer: async (
    //   _,
    //   { payload }: MutationWhitelistAffiliateToOfferArgs,
    //   context: Context
    // ): Promise<WhitelistAffiliateToOfferResponse> => {
    //   if (!context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `Unauthorized`,
    //       },
    //     };
    //   }
    //   try {
    //     const whitelist = await whitelistAffiliateToOffer(payload);
    //     return {
    //       whitelist,
    //     };
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
    // removeWhitelistAffiliateToOffer: async (
    //   _,
    //   { id }: MutationRemoveWhitelistAffiliateToOfferArgs,
    //   context: Context
    // ): Promise<RemoveWhitelistAffiliateToOfferResponse> => {
    //   if (!context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `Unauthorized`,
    //       },
    //     };
    //   }
    //   try {
    //     const idOfDeletedWhitelist = await removeWhitelistAffiliateToOffer(
    //       id as OrganizerOfferWhitelistID
    //     );
    //     return {
    //       message: `Successfully removed whitelist-affiliate-offer=${idOfDeletedWhitelist}`,
    //     };
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
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
      if ("whitelist" in obj) {
        return "WhitelistAffiliateToOfferResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  RemoveWhitelistAffiliateToOfferResponse: {
    __resolveType: (obj: RemoveWhitelistAffiliateToOfferResponse) => {
      if ("message" in obj) {
        return "RemoveWhitelistAffiliateToOfferResponseSuccess";
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
