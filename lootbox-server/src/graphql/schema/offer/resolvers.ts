import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  ActivationID,
  AffiliateID,
  ConquestID,
  OfferID,
  UserIdpID,
} from "@wormgraph/helpers";
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
  CreateOfferResponse,
  EditOfferResponse,
  GetConquestResponse,
  ListConquestPreviewsResponse,
  MutationCreateConquestArgs,
  MutationCreateOfferArgs,
  MutationEditOfferArgs,
  MutationUpdateAdvertiserDetailsArgs,
  MutationUpdateConquestArgs,
  MutationUpgradeToAdvertiserArgs,
  Offer,
  Resolvers,
  StatusCode,
  UpdateAdvertiserDetailsResponse,
  UpdateConquestResponse,
  UpgradeToAdvertiserResponse,
  EditActivationResponse,
  MutationEditActivationArgs,
  ListCreatedOffersResponse,
  ViewCreatedOfferResponse,
  QueryViewCreatedOfferArgs,
  Activation,
  MutationCreateActivationArgs,
  ListOffersAvailableForOrganizerResponse,
  QueryListOffersAvailableForOrganizerArgs,
  OfferAffiliateView,
  RateQuote,
} from "../../generated/types";
import { Context } from "../../server";
import { ConquestWithTournaments } from "../../../api/firestore/advertiser.type";
import {
  QueryListCreatedOffersArgs,
  AdSetPreview,
} from "../../generated/types";
import {
  createActivation,
  createOffer,
  editActivation,
  editOffer,
  getAdSetPreviewsForOffer,
  listActivationsForOffer,
  listCreatedOffers,
  listOffersAvailableForOrganizer,
  viewCreatedOffer,
} from "../../../api/firestore/offer";
import { CreateActivationResponse, Affiliate } from "../../generated/types";
import { checkIfUserIdpMatchesAdvertiser } from "../../../api/identityProvider/firebase";
import { isAuthenticated } from "../../../lib/permissionGuard";

const OfferResolvers: Resolvers = {
  Query: {
    listCreatedOffers: async (
      _,
      args: QueryListCreatedOffersArgs,
      context: Context
    ): Promise<ListCreatedOffersResponse> => {
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
        const offers = await listCreatedOffers(
          args.advertiserID as AdvertiserID
        );
        if (!offers) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No advertiser found with ID ${args.advertiserID}`,
            },
          };
        }
        return {
          offers,
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
    viewCreatedOffer: async (
      _,
      args: QueryViewCreatedOfferArgs,
      context: Context
    ): Promise<ViewCreatedOfferResponse> => {
      try {
        const offer = await viewCreatedOffer(
          args.offerID as OfferID,
          context.userId || ("" as UserIdpID)
        );
        if (!offer) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No offer found with ID ${args.offerID}`,
            },
          };
        }
        return {
          offer,
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
    listOffersAvailableForOrganizer: async (
      _,
      args: QueryListOffersAvailableForOrganizerArgs,
      context: Context
    ): Promise<ListOffersAvailableForOrganizerResponse> => {
      try {
        const offers = await listOffersAvailableForOrganizer(
          args.affiliateID as AffiliateID
        );
        if (!offers) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No offers found for Affiliate ID ${args.affiliateID}`,
            },
          };
        }
        return {
          offers,
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
    createOffer: async (
      _,
      { advertiserID, payload }: MutationCreateOfferArgs,
      context: Context
    ): Promise<CreateOfferResponse> => {
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
        const offer = await createOffer(advertiserID as AdvertiserID, payload);
        if (!offer) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No offer created for advertiser ${advertiserID}`,
            },
          };
        }
        // const advertiserGQL = advertiser as unknown as Advertiser;
        return { offer: offer as unknown as Offer };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    editOffer: async (
      _,
      { payload }: MutationEditOfferArgs,
      context: Context
    ): Promise<EditOfferResponse> => {
      try {
        const offer = await editOffer(
          payload.id as OfferID,
          payload,
          context.userId || ("" as UserIdpID)
        );
        if (!offer) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not update offer ${payload.id} from advertiser ${payload.advertiserID}`,
            },
          };
        }
        return { offer: offer as unknown as Offer };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    createActivation: async (
      _,
      { payload }: MutationCreateActivationArgs,
      context: Context
    ): Promise<CreateActivationResponse> => {
      try {
        const activation = await createActivation(
          payload.offerID as OfferID,
          payload.activation,
          context.userId || ("" as UserIdpID)
        );
        console.log(`After createActivation...`);
        console.log(activation);
        if (!activation) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No activation created for ${payload.offerID}`,
            },
          };
        }
        return { activation };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    editActivation: async (
      _,
      { payload }: MutationEditActivationArgs,
      context: Context
    ): Promise<EditActivationResponse> => {
      try {
        const activation = await editActivation(
          payload.activationID as ActivationID,
          payload.activation,
          context.userId || ("" as UserIdpID)
        );
        console.log(`activation= `, activation);
        if (!activation) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not edit activation ${payload.activationID}`,
            },
          };
        }
        return { activation };
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

  Offer: {
    activations: async (offer: Offer): Promise<Activation[]> => {
      return listActivationsForOffer(offer.id as OfferID);
    },
    adSetPreviews: async (offer: Offer): Promise<AdSetPreview[]> => {
      return getAdSetPreviewsForOffer(offer.id as OfferID);
    },
  },
  OfferAffiliateView: {
    adSetPreviews: async (
      offer: OfferAffiliateView
    ): Promise<AdSetPreview[]> => {
      return getAdSetPreviewsForOffer(offer.id as OfferID);
    },
    // activationsForAffiliate: async (
    //   offer: OfferAffiliateView,
    //   args
    // ): Promise<RateQuote[]> => {
    //   return getRateQuoteForOfferAndAffiliate(
    //     offer.id as OfferID,
    //     affiliateID as AffiliateID
    //   );
    // },
  },

  CreateOfferResponse: {
    __resolveType: (obj: CreateOfferResponse) => {
      if ("offer" in obj) {
        return "CreateOfferResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  EditOfferResponse: {
    __resolveType: (obj: EditOfferResponse) => {
      if ("offer" in obj) {
        return "EditOfferResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  CreateActivationResponse: {
    __resolveType: (obj: CreateActivationResponse) => {
      if ("activation" in obj) {
        return "CreateActivationResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  EditActivationResponse: {
    __resolveType: (obj: EditActivationResponse) => {
      if ("activation" in obj) {
        return "EditActivationResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ListCreatedOffersResponse: {
    __resolveType: (obj: ListCreatedOffersResponse) => {
      if ("offers" in obj) {
        return "ListCreatedOffersResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ViewCreatedOfferResponse: {
    __resolveType: (obj: ViewCreatedOfferResponse) => {
      if ("offer" in obj) {
        return "ViewCreatedOfferResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  ListOffersAvailableForOrganizerResponse: {
    __resolveType: (obj: ListOffersAvailableForOrganizerResponse) => {
      if ("offers" in obj) {
        return "ListOffersAvailableForOrganizerResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const offerComposition = {
  "Query.listCreatedOffers": [isAuthenticated()],
  "Query.viewCreatedOffer": [isAuthenticated()],
  "Mutation.createOffer": [isAuthenticated()],
  "Mutation.editOffer": [isAuthenticated()],
  "Mutation.createActivation": [isAuthenticated()],
  "Mutation.editActivationsInOffer": [isAuthenticated()],
};

const resolvers = composeResolvers(OfferResolvers, offerComposition);

export default resolvers;
