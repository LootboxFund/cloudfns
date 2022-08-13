import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "../../../lib/permissionGuard";
import {
  CreateReferralResponse,
  MutationCreateReferralArgs,
  Resolvers,
  StatusCode,
  MutationCompleteClaimArgs,
  CompleteClaimResponse,
  MutationCreateClaimArgs,
  ClaimStatus,
  ClaimType,
  Referral,
  Claim,
  QueryReferralArgs,
  ReferralResponse,
  Tournament,
  UserClaimsResponse,
  PartyBasket,
  QueryUserClaimsArgs,
  CreateClaimResponse,
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
  getAllClaimsForReferral,
  paginateUserClaims,
  getLootboxByAddress,
  getCompletedUserReferralClaimsForTournament,
  getReferralById,
} from "../../../api/firestore";
import {
  ClaimID,
  PartyBasketID,
  ReferralID,
  ReferralSlug,
  TournamentID,
  UserIdpID,
} from "../../../lib/types";
import { Address } from "@wormgraph/helpers";

const ReferralResolvers: Resolvers = {
  Query: {
    referral: async (
      _,
      { slug }: QueryReferralArgs
    ): Promise<ReferralResponse> => {
      try {
        const referral = await getReferralBySlug(slug as ReferralSlug);

        if (!referral) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Referral not found",
            },
          };
        }

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
    userClaims: async (
      _,
      { userId, first, after }: QueryUserClaimsArgs
    ): Promise<UserClaimsResponse> => {
      try {
        const response = await paginateUserClaims(
          userId as UserIdpID,
          first,
          after
        );

        return response;
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

  Claim: {
    chosenPartyBasket: async (claim: Claim): Promise<PartyBasket | null> => {
      if (!claim.chosenPartyBasketId) {
        return null;
      }

      const partyBasket = await getPartyBasketById(
        claim.chosenPartyBasketId as PartyBasketID
      );

      return !partyBasket ? null : partyBasket;
    },
  },

  Referral: {
    claims: async (referral: Referral): Promise<Claim[]> => {
      return getAllClaimsForReferral(referral.id as ReferralID);
    },
    tournament: async (referral: Referral): Promise<Tournament | null> => {
      const tournament = await getTournamentById(
        referral.tournamentId as TournamentID
      );
      return !tournament ? null : tournament;
    },
    seedPartyBasket: async (
      referral: Referral
    ): Promise<PartyBasket | null> => {
      if (!referral.seedPartyBasketId) {
        return null;
      }
      const partyBasket = await getPartyBasketById(
        referral.seedPartyBasketId as PartyBasketID
      );

      return !partyBasket ? null : partyBasket;
    },
  },

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

        const campaignName = payload.campaignName || `Campaign ${nanoid(5)}`;

        const referral = await createReferral({
          slug,
          referrerId: context.userId,
          creatorId: context.userId,
          campaignName,
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
    createClaim: async (
      _,
      { payload }: MutationCreateClaimArgs
    ): Promise<CreateClaimResponse> => {
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
          referralCampaignName: referral.campaignName,
          referralId: referral.id as ReferralID,
          tournamentId: referral.tournamentId as TournamentID,
          referrerId: referral.referrerId as UserIdpID,
          referralSlug: payload.referralSlug as ReferralSlug,
          tournamentName: tournament.title,
          originPartyBasketId: !!referral.seedPartyBasketId
            ? (referral.seedPartyBasketId as PartyBasketID)
            : undefined,
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

        // Make sure the user has not accepted a claim for a tournament before
        const [previousClaims, tournament, referral, lootbox] =
          await Promise.all([
            getCompletedUserReferralClaimsForTournament(
              context.userId,
              claim.tournamentId as TournamentID
            ),
            getTournamentById(claim.tournamentId as TournamentID),
            getReferralById(claim.referralId as ReferralID),
            getLootboxByAddress(partyBasket.lootboxAddress as Address),
          ]);

        if (!lootbox) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Lootbox not found",
            },
          };
        } else if (!referral || !!referral.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Referral not found",
            },
          };
        } else if (!tournament || !!tournament.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Tournament not found",
            },
          };
        } else if (previousClaims.length > 0) {
          return {
            error: {
              code: StatusCode.BadRequest,
              // WARNING - this message is stupidly parsed in the frontend for internationalization.
              //           if you change it, make sure you update @lootbox/widgets file OnboardingSignUp.tsx if needed
              message:
                "You have already accepted a referral for this tournament",
            },
          };
        }

        const updatedClaim = await completeClaim({
          claimId: claim.id as ClaimID,
          referralId: claim.referralId as ReferralID,
          chosenPartyBasketId: payload.chosenPartyBasketId as PartyBasketID,
          chosenPartyBasketAddress: partyBasket.address as Address,
          chosenPartyBasketName: partyBasket.name,
          chosenPartyBasketNFTBountyValue: !!partyBasket.nftBountyValue
            ? partyBasket.nftBountyValue
            : undefined,
          lootboxAddress: lootbox.address as Address,
          lootboxName: lootbox.name,
          claimerUserId: context.userId,
        });

        // Now write the referrers claim (type=REWARD)
        try {
          await createRewardClaim({
            referralCampaignName: referral.campaignName,
            referralId: claim.referralId as ReferralID,
            tournamentId: claim.tournamentId as TournamentID,
            referralSlug: claim.referralSlug as ReferralSlug,
            rewardFromClaim: claim.id as ClaimID,
            tournamentName: tournament.title,
            chosenPartyBasketId: payload.chosenPartyBasketId as PartyBasketID,
            chosenPartyBasketAddress: partyBasket.address as Address,
            chosenPartyBasketName: partyBasket.name,
            lootboxAddress: lootbox.address,
            lootboxName: lootbox.name,
            chosenPartyBasketNFTBountyValue: !!partyBasket.nftBountyValue
              ? partyBasket.nftBountyValue
              : undefined,
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

  CreateClaimResponse: {
    __resolveType: (obj: CreateClaimResponse) => {
      if ("claim" in obj) {
        return "CreateClaimResponseSuccess";
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

  ReferralResponse: {
    __resolveType: (obj: ReferralResponse) => {
      if ("referral" in obj) {
        return "ReferralResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },

  UserClaimsResponse: {
    __resolveType: (obj: UserClaimsResponse) => {
      if ("edges" in obj) {
        return "UserClaimsResponseSuccess";
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
