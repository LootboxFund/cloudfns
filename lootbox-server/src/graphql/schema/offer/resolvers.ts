import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { ActivationID, ConquestID, OfferID } from "@wormgraph/helpers";
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
  QueryAdvertiserAdminViewArgs,
  QueryAdvertiserPublicViewArgs,
  QueryGetConquestArgs,
  QueryListConquestPreviewsArgs,
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
} from "../../generated/types";
import { Context } from "../../server";
import { ConquestWithTournaments } from "../../../api/firestore/advertiser.type";
import { QueryListCreatedOffersArgs } from "../../generated/types";
import {
  createActivation,
  createOffer,
  editActivation,
  editOffer,
  listActivationsForOffer,
  listCreatedOffers,
  viewCreatedOffer,
} from "../../../api/firestore/offer";
import { CreateActivationResponse } from "../../generated/types";

const OfferResolvers: Resolvers = {
  Query: {
    listCreatedOffers: async (
      _,
      args: QueryListCreatedOffersArgs
    ): Promise<ListCreatedOffersResponse> => {
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
      args: QueryViewCreatedOfferArgs
    ): Promise<ViewCreatedOfferResponse> => {
      try {
        const offer = await viewCreatedOffer(args.offerID as OfferID);
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
  },
  Mutation: {
    createOffer: async (
      _,
      { advertiserID, payload }: MutationCreateOfferArgs,
      context: Context
    ): Promise<CreateOfferResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const offer = await editOffer(payload.id as OfferID, payload);
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const activation = await createActivation(
          payload.offerID as OfferID,
          payload.activation
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
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const activation = await editActivation(
          payload.activationID as ActivationID,
          payload.activation
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
};

const offerComposition = {
  "Mutation.createOffer": [],
  "Mutation.editOffer": [],
  "Mutation.createActivation": [],
  "Mutation.editActivationsInOffer": [],
};

const resolvers = composeResolvers(OfferResolvers, offerComposition);

export default resolvers;
