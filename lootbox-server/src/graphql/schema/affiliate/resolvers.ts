import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { AffiliateID, UserID } from "@wormgraph/helpers";
import {
  Affiliate,
  ListWhitelistedAffiliatesToOfferResponse,
  MutationEditWhitelistAffiliateToOfferArgs,

  // MutationRemoveWhitelistAffiliateToOfferArgs,
  MutationWhitelistAffiliateToOfferArgs,
  // MutationWhitelistAffiliateToOfferArgs,
  QueryAffiliatePublicViewArgs,
  QueryListWhitelistedAffiliatesToOfferArgs,
  QueryViewMyTournamentsAsOrganizerArgs,
  QueryViewTournamentAsOrganizerArgs,
  Resolvers,
  StatusCode,
  Tournament,
  UpgradeToAffiliateResponse,
  ViewTournamentAsOrganizerResponse,
} from "../../generated/types";
import { Context } from "../../server";
import {
  WhitelistAffiliateToOfferResponse,
  EditWhitelistAffiliateToOfferResponse,
} from "../../generated/types";
import {
  affiliateAdminView,
  affiliatePublicView,
  editWhitelistAffiliateToOffer,
  upgradeToAffiliate,
  viewMyTournamentsAsOrganizer,
  viewTournamentAsOrganizer,
  viewWhitelistedAffiliatesToOffer,
  whitelistAffiliateToOffer,
} from "../../../api/firestore/affiliate";
import {
  AffiliateAdminViewResponse,
  AffiliatePublicViewResponse,
} from "../../generated/types";
import {
  OfferID,
  OrganizerOfferWhitelistID,
  TournamentID,
  UserIdpID,
} from "@wormgraph/helpers";
import { checkIfUserIdpMatchesAffiliate } from "../../../api/identityProvider/firebase";
import { isAuthenticated } from "../../../lib/permissionGuard";
import {
  ViewMyTournamentsAsOrganizerResponse,
  MutationUpdateAffiliateDetailsArgs,
  UpdateAffiliateDetailsResponse,
} from "../../generated/types";
import { updateAdvertiserDetails } from "../../../api/firestore";
import { updateAffiliateDetails } from "../../../api/firestore/affiliate";

const AffiliateResolvers: Resolvers = {
  Query: {
    affiliateAdminView: async (
      _,
      args,
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
      try {
        const affiliate = await affiliateAdminView(context.userId);
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
    viewMyTournamentsAsOrganizer: async (
      _,
      { affiliateID }: QueryViewMyTournamentsAsOrganizerArgs,
      context: Context
    ): Promise<ViewMyTournamentsAsOrganizerResponse> => {
      try {
        const tournaments = await viewMyTournamentsAsOrganizer(
          affiliateID as AffiliateID,
          context.userId
        );
        if (!tournaments) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No tournaments found for affiliate ID ${affiliateID}`,
            },
          };
        }
        return {
          // this needs to be figured out how to cooperate types nicely
          tournaments: tournaments as Tournament[],
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
    viewTournamentAsOrganizer: async (
      _,
      { tournamentID }: QueryViewTournamentAsOrganizerArgs,
      context: Context
    ): Promise<ViewTournamentAsOrganizerResponse> => {
      try {
        const tournament = await viewTournamentAsOrganizer(
          tournamentID as TournamentID,
          context.userId
        );
        if (!tournament) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No tournament ID ${tournamentID}`,
            },
          };
        }
        return {
          // this needs to be figured out how to cooperate types nicely
          tournament: tournament as unknown as Tournament,
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
    listWhitelistedAffiliatesToOffer: async (
      _,
      { payload }: QueryListWhitelistedAffiliatesToOfferArgs,
      context: Context
    ): Promise<ListWhitelistedAffiliatesToOfferResponse> => {
      try {
        const whitelists = await viewWhitelistedAffiliatesToOffer(
          payload.offerID as OfferID,
          context.userId
        );
        return {
          whitelists,
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
  Mutation: {
    upgradeToAffiliate: async (
      _,
      args,
      context: Context
    ): Promise<UpgradeToAffiliateResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "You are not authenticated!",
          },
        };
      }
      try {
        const affiliate = await upgradeToAffiliate(context.userId);
        if (!affiliate) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No affiliate created for user ${context.userId}`,
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
    updateAffiliateDetails: async (
      _,
      { affiliateID, payload }: MutationUpdateAffiliateDetailsArgs,
      context: Context
    ): Promise<UpdateAffiliateDetailsResponse> => {
      try {
        const affiliate = await updateAffiliateDetails(
          affiliateID as AffiliateID,
          payload,
          context.userId
        );
        if (!affiliate) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No affiliate with ID ${affiliateID} updated`,
            },
          };
        }
        return { affiliate };
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
      try {
        const whitelist = await whitelistAffiliateToOffer(
          payload,
          context.userId
        );
        return {
          whitelist,
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
    editWhitelistAffiliateToOffer: async (
      _,
      { payload }: MutationEditWhitelistAffiliateToOfferArgs,
      context: Context
    ): Promise<EditWhitelistAffiliateToOfferResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
      try {
        const whitelist = await editWhitelistAffiliateToOffer(
          payload,
          context.userId
        );
        if (!whitelist) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No whitelist found with ID ${payload.id}`,
            },
          };
        }
        return {
          whitelist,
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
      if ("whitelist" in obj) {
        return "WhitelistAffiliateToOfferResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  EditWhitelistAffiliateToOfferResponse: {
    __resolveType: (obj: EditWhitelistAffiliateToOfferResponse) => {
      if ("whitelist" in obj) {
        return "EditWhitelistAffiliateToOfferResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ViewMyTournamentsAsOrganizerResponse: {
    __resolveType: (obj: ViewMyTournamentsAsOrganizerResponse) => {
      if ("tournaments" in obj) {
        return "ViewMyTournamentsAsOrganizerResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ViewTournamentAsOrganizerResponse: {
    __resolveType: (obj: ViewTournamentAsOrganizerResponse) => {
      if ("tournament" in obj) {
        return "ViewTournamentAsOrganizerResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ListWhitelistedAffiliatesToOfferResponse: {
    __resolveType: (obj: ListWhitelistedAffiliatesToOfferResponse) => {
      if ("whitelists" in obj) {
        return "ListWhitelistedAffiliatesToOfferResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  UpdateAffiliateDetailsResponse: {
    __resolveType: (obj: UpdateAffiliateDetailsResponse) => {
      if ("affiliate" in obj) {
        return "UpdateAffiliateDetailsResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const AffiliateComposition = {
  "Query.affiliateAdminView": [isAuthenticated()],
  "Query.affiliatePublicView": [isAuthenticated()],
  "Query.viewMyTournamentsAsOrganizer": [isAuthenticated()],
  "Query.listWhitelistedAffiliatesToOffer": [isAuthenticated()],
  "Mutation.upgradeToAffiliate": [isAuthenticated()],
  "Mutation.updateAffiliateDetails": [isAuthenticated()],
  "Mutation.whitelistAffiliateToOffer": [isAuthenticated()],
  "Mutation.editWhitelistAffiliateToOffer": [isAuthenticated()],
};

const resolvers = composeResolvers(AffiliateResolvers, AffiliateComposition);

export default resolvers;
