import { composeResolvers } from "@graphql-tools/resolvers-composition";
import {
  ActivationID,
  AffiliateID,
  ClaimID,
  LootboxID,
  OfferID,
  UserID,
  UserIdpID,
} from "@wormgraph/helpers";
import { AdvertiserID } from "@wormgraph/helpers";
import {
  CreateOfferResponse,
  EditOfferResponse,
  MutationCreateOfferArgs,
  MutationEditOfferArgs,
  Offer,
  Resolvers,
  StatusCode,
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
  OfferAffiliateViewActivationsForAffiliateArgs,
  RateQuoteEstimate,
  ViewOfferDetailsAsEventAffiliateResponse,
  QueryViewOfferDetailsAsAffiliateArgs,
  AdSetStatus,
  MutationAnswerAirdropQuestionArgs,
  QueryCheckIfUserAnsweredAirdropQuestionsArgs,
  UpdateClaimRedemptionStatusResponse,
  MutationUpdateClaimRedemptionStatusArgs,
  MutationAnswerAfterTicketClaimQuestionArgs,
  MutationOfferClaimsCsvArgs,
  OfferClaimsCsvResponse,
} from "../../generated/types";
import { Context } from "../../server";
import {
  QueryListCreatedOffersArgs,
  AdSetPreview,
} from "../../generated/types";
import {
  answerAfterTicketClaimQuestion,
  answerAirdropLootboxQuestion,
  checkIfUserAnsweredAirdropQuestions,
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
import {
  CreateActivationResponse,
  AnswerAirdropQuestionResponse,
} from "../../generated/types";
import { checkIfUserIdpMatchesAdvertiser } from "../../../api/identityProvider/firebase";
import { isAuthenticated } from "../../../lib/permissionGuard";
import {
  getActivationsWithRateQuoteForAffiliate,
  viewOfferDetailsAsAffiliate,
} from "../../../api/firestore/affiliate";
import { updateClaimRedemptionStatus } from "../../../api/firestore/referral";
import {
  CheckIfUserAnsweredAirdropQuestionsResponse,
  AfterTicketClaimQuestionResponse,
} from "../../generated/types";
import * as analyticsService from "../../../service/analytics";
import { parseCSVRows } from "../../../lib/csv";
import { toFilename } from "../../../lib/parser";
import { nanoid } from "nanoid";
import { saveCsvToStorage } from "../../../api/storage";
import { manifest } from "../../../manifest";

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
          // @ts-ignore
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
    viewOfferDetailsAsAffiliate: async (
      _,
      { payload }: QueryViewOfferDetailsAsAffiliateArgs,
      context: Context
    ): Promise<ViewOfferDetailsAsEventAffiliateResponse> => {
      try {
        const offer = await viewOfferDetailsAsAffiliate(
          payload.offerID as OfferID
        );
        if (offer === undefined) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `No offer found with ID ${payload.offerID} for Affiliate ${payload.affiliateID}`,
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
    checkIfUserAnsweredAirdropQuestions: async (
      _,
      { lootboxID }: QueryCheckIfUserAnsweredAirdropQuestionsArgs,
      context: Context
    ): Promise<CheckIfUserAnsweredAirdropQuestionsResponse> => {
      try {
        const result = await checkIfUserAnsweredAirdropQuestions(
          lootboxID as LootboxID,
          (context.userId || "") as unknown as UserID
        );
        return {
          status: result.passed,
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
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }
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
        const offer = await createOffer(
          advertiserID as AdvertiserID,
          payload,
          context.userId
        );
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
    updateClaimRedemptionStatus: async (
      _,
      { payload }: MutationUpdateClaimRedemptionStatusArgs,
      context: Context
    ): Promise<UpdateClaimRedemptionStatusResponse> => {
      const { claimID, status } = payload;
      try {
        const updatedClaimID = await updateClaimRedemptionStatus(
          claimID as ClaimID,
          status,
          context.userId || ("" as UserIdpID)
        );

        if (!updatedClaimID) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not update claim ${claimID}`,
            },
          };
        }
        return { claimID: updatedClaimID };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    answerAirdropQuestion: async (
      _,
      { payload }: MutationAnswerAirdropQuestionArgs,
      context: Context
    ): Promise<AnswerAirdropQuestionResponse> => {
      try {
        const answerIDs = await answerAirdropLootboxQuestion(
          payload,
          context.userId || ("" as UserIdpID)
        );
        if (!answerIDs) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not answer questions for airdrop lootbox ${payload.lootboxID}`,
            },
          };
        }
        return { answerIDs };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    answerAfterTicketClaimQuestion: async (
      _,
      { payload }: MutationAnswerAfterTicketClaimQuestionArgs,
      context: Context
    ): Promise<AfterTicketClaimQuestionResponse> => {
      try {
        const answerIDs = await answerAfterTicketClaimQuestion(
          payload,
          context.userId || ("" as UserIdpID)
        );
        if (!answerIDs) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: `Could not answer questions for referral ${payload.referralID}`,
            },
          };
        }
        return { answerIDs };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    offerClaimsCSV: async (
      _,
      { payload }: MutationOfferClaimsCsvArgs,
      context: Context
    ): Promise<OfferClaimsCsvResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "Unauthorized",
          },
        };
      }

      try {
        const { data, offer } = await analyticsService.offerClaimsWithQA({
          offerID: payload.offerID as OfferID,
          callerUserID: context.userId,
        });

        const csvContent = parseCSVRows(data);
        const filename =
          toFilename(offer.title || offer.id) + "_" + nanoid(6) + ".csv";

        const downloadUrl = await saveCsvToStorage({
          fileName: `offer_claims_export/${filename}`,
          data: csvContent,
          bucket: manifest.firebase.storageBucket,
        });

        return { csvDownloadURL: downloadUrl };
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
      const adSets = await getAdSetPreviewsForOffer(offer.id as OfferID);
      return adSets.filter((a) => a.status === AdSetStatus.Active);
    },
    activationsForAffiliate: async (
      offer: OfferAffiliateView,
      args: OfferAffiliateViewActivationsForAffiliateArgs
    ): Promise<Omit<RateQuoteEstimate, "__typename">[]> => {
      const rateQuoteActivations =
        await getActivationsWithRateQuoteForAffiliate(
          args.affiliateID as AffiliateID,
          offer.id as OfferID
        );
      return rateQuoteActivations;
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
  ViewOfferDetailsAsEventAffiliateResponse: {
    __resolveType: (obj: ViewOfferDetailsAsEventAffiliateResponse) => {
      if ("offer" in obj) {
        return "ViewOfferDetailsAsEventAffiliateResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  UpdateClaimRedemptionStatusResponse: {
    __resolveType: (obj: UpdateClaimRedemptionStatusResponse) => {
      if ("claimID" in obj) {
        return "UpdateClaimRedemptionStatusResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  AnswerAirdropQuestionResponse: {
    __resolveType: (obj: AnswerAirdropQuestionResponse) => {
      if ("answerIDs" in obj) {
        return "AnswerAirdropQuestionResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  CheckIfUserAnsweredAirdropQuestionsResponse: {
    __resolveType: (obj: CheckIfUserAnsweredAirdropQuestionsResponse) => {
      if ("status" in obj) {
        return "CheckIfUserAnsweredAirdropQuestionsResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  AfterTicketClaimQuestionResponse: {
    __resolveType: (obj: AfterTicketClaimQuestionResponse) => {
      if ("answerIDs" in obj) {
        return "AfterTicketClaimQuestionResponseSuccess";
      }

      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
  OfferClaimsCSVResponse: {
    __resolveType: (obj: OfferClaimsCsvResponse) => {
      if ("csvDownloadURL" in obj) {
        return "OfferClaimsCSVResponseSuccess";
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
  "Mutation.offerClaimsCSV": [isAuthenticated()],
};

const resolvers = composeResolvers(OfferResolvers, offerComposition);

export default resolvers;
