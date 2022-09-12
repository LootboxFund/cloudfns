import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { ConquestID, OfferID } from "@wormgraph/helpers";
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
  EditActivationsInOfferResponse,
  MutationEditActivationsInOfferArgs,
  ListCreatedOffersResponse,
  ViewCreatedOfferResponse,
  QueryViewCreatedOfferArgs,
} from "../../generated/types";
import { Context } from "../../server";
import { ConquestWithTournaments } from "../../../api/firestore/advertiser.type";
import { QueryListCreatedOffersArgs } from "../../generated/types";
import {
  addActivationsToOffer,
  createOffer,
  editActivationsInOffer,
  editOffer,
  listCreatedOffers,
  viewCreatedOffer,
} from "../../../api/firestore/offer";
import {
  MutationAddActivationsToOfferArgs,
  AddActivationsToOfferResponse,
} from "../../generated/types";

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
    addActivationsToOffer: async (
      _,
      { payload }: MutationAddActivationsToOfferArgs,
      context: Context
    ): Promise<AddActivationsToOfferResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const offer = await addActivationsToOffer(
          payload.offerID as OfferID,
          payload
        );
        if (!offer) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No activations added to offer ${payload.offerID}`,
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
    editActivationsInOffer: async (
      _,
      { payload }: MutationEditActivationsInOfferArgs,
      context: Context
    ): Promise<EditActivationsInOfferResponse> => {
      // if (!context.userId) {
      //   return {
      //     error: {
      //       code: StatusCode.Unauthorized,
      //       message: `Unauthorized`,
      //     },
      //   };
      // }
      try {
        const offer = await editActivationsInOffer(
          payload.offerID as OfferID,
          payload
        );
        if (!offer) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No activations added to offer ${payload.offerID}`,
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
  AddActivationsToOfferResponse: {
    __resolveType: (obj: AddActivationsToOfferResponse) => {
      if ("offer" in obj) {
        return "AddActivationsToOfferResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  EditActivationsInOfferResponse: {
    __resolveType: (obj: EditActivationsInOfferResponse) => {
      if ("offer" in obj) {
        return "EditActivationsInOfferResponseSuccess";
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
  "Mutation.addActivationsToOffer": [],
  "Mutation.editActivationsInOffer": [],
};

const resolvers = composeResolvers(OfferResolvers, offerComposition);

export default resolvers;
