import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "../../../lib/permissionGuard";
import {
  CreateReferralResponse,
  MutationCreateReferralArgs,
  Resolvers,
  StatusCode,
} from "../../generated/types";
import { Context } from "../../server";
import { nanoid } from "nanoid";
import {
  getReferralBySlug,
  createReferral,
  getTournamentById,
  getPartyBasketById,
} from "../../../api/firestore";
import { PartyBasketID, ReferralSlug, TournamentID } from "../../../lib/types";

const ReferralResolvers: Resolvers = {
  Mutation: {
    createReferral: async (
      _,
      { payload }: MutationCreateReferralArgs,
      context: Context
    ): Promise<CreateReferralResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "You must be logged in to create a referral",
          },
        };
      }

      const slug = nanoid(12) as ReferralSlug;

      try {
        const [existingReferral, tournament, partyBasket] = await Promise.all([
          getReferralBySlug(slug),
          getTournamentById(payload.tournamentId as TournamentID),
          !!payload.partyBasketId
            ? getPartyBasketById(payload.partyBasketId as PartyBasketID)
            : null,
        ]);

        if (!!existingReferral) {
          // Make sure the slug does not already exist
          console.error("Referral slug already exists");
          throw new Error("Please try again");
        } else if (!tournament) {
          // Make sure the tournament exists
          throw new Error("Tournament not found");
        } else if (partyBasket === undefined) {
          // Makesure the party basket exists
          throw new Error("Party Basket not found");
        }

        const referral = await createReferral({
          slug,
          referrerId: context.userId,
          creatorId: context.userId,
          campaignName: payload.campaignName,
          tournamentId: payload.tournamentId as TournamentID,
          seedPartyBasketId: payload.partyBasketId
            ? (payload.partyBasketId as PartyBasketID)
            : undefined,
        });

        return { referral };
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

  CreateReferralResponse: {
    __resolveType: (obj: CreateReferralResponse) => {
      if ("referral" in obj) {
        return "CreateReferralResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },
};

const referralResolverComposition = {
  "Mutation.createReferral": [isAuthenticated()],
};

const referralResolvers = composeResolvers(
  ReferralResolvers,
  referralResolverComposition
);

export default referralResolvers;
