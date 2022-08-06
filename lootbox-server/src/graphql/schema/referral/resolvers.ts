import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "../../../lib/permissionGuard";
import {
  CreateReferralResponse,
  MutationCreateReferralArgs,
  Resolvers,
  StatusCode,
  MutationCompleteClaimArgs,
  CompleteClaimResponse,
  MutationStartClaimArgs,
  StartClaimResponse,
  ClaimStatus,
  ClaimType,
} from "../../generated/types";
import { Context } from "../../server";
import { nanoid } from "nanoid";
import {
  getReferralBySlug,
  createReferral,
  getTournamentById,
  getPartyBasketById,
  createStartingClaim,
  getClaimById,
  getCompletedClaimsForUserReferral,
  completeClaim,
  createRewardClaim,
} from "../../../api/firestore";
import {
  ClaimID,
  PartyBasketID,
  ReferralID,
  ReferralSlug,
  TournamentID,
  UserIdpID,
} from "../../../lib/types";

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

      const slug = nanoid(10) as ReferralSlug;

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
    startClaim: async (
      _,
      { payload }: MutationStartClaimArgs
    ): Promise<StartClaimResponse> => {
      try {
        const referral = await getReferralBySlug(
          payload.referralSlug as ReferralSlug
        );

        if (!referral || !!referral.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Referral not found",
            },
          };
        }

        const tournament = await getTournamentById(
          referral.tournamentId as TournamentID
        );

        if (!tournament || !!tournament.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Tournament not found",
            },
          };
        }

        const claim = await createStartingClaim({
          referralId: referral.id as ReferralID,
          tournamentId: referral.tournamentId as TournamentID,
          referrerId: referral.referrerId as UserIdpID,
          referralSlug: payload.referralSlug as ReferralSlug,
        });

        return {
          claim,
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
    completeClaim: async (
      _,
      { payload }: MutationCompleteClaimArgs,
      context: Context
    ): Promise<CompleteClaimResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "You must be logged in to complete a claim",
          },
        };
      }

      try {
        const [claim, partyBasket] = await Promise.all([
          getClaimById(payload.claimId as ClaimID),
          getPartyBasketById(payload.chosenPartyBasketId as PartyBasketID),
        ]);

        if (!claim || !!claim?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Claim not found",
            },
          };
        } else if (context.userId === claim.referrerId) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: "You cannot redeem your own referral link!",
            },
          };
        } else if (!partyBasket || !!partyBasket?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Party Basket not found",
            },
          };
        } else if (claim.status === ClaimStatus.Complete) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Claim already completed",
            },
          };
        }

        // Make sure the user has not accepted one of these referrals before
        const previousClaimsForReferral =
          await getCompletedClaimsForUserReferral(
            context.userId,
            claim.referralId as ReferralID
          );

        if (previousClaimsForReferral.length > 0) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "You have already accepted a referral",
            },
          };
        }

        const updatedClaim = await completeClaim({
          claimId: claim.id as ClaimID,
          referralId: claim.referralId as ReferralID,
          chosenPartyBasketId: payload.chosenPartyBasketId as PartyBasketID,
          claimerUserId: context.userId,
          isNewUser: payload.isNewUser,
        });

        // Now write the referrers claim (type=REWARD)
        try {
          await createRewardClaim({
            referralId: claim.referralId as ReferralID,
            tournamentId: claim.tournamentId as TournamentID,
            referralSlug: claim.referralSlug as ReferralSlug,
            rewardFromClaim: claim.id as ClaimID,
          });
        } catch (err) {
          // If error here, we just make a log... but we dont return an error to client
          console.error("Error writting reward claim", err);
        }

        return {
          claim: updatedClaim,
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

  StartClaimResponse: {
    __resolveType: (obj: StartClaimResponse) => {
      if ("claim" in obj) {
        return "StartClaimResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },

  CompleteClaimResponse: {
    __resolveType: (obj: CompleteClaimResponse) => {
      if ("claim" in obj) {
        return "CompleteClaimResponseSuccess";
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
  "Mutation.completeClaim": [isAuthenticated()],
};

const referralResolvers = composeResolvers(
  ReferralResolvers,
  referralResolverComposition
);

export default referralResolvers;
