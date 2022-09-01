import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "../../../lib/permissionGuard";
import {
  BulkReferralCsvRow,
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
  MutationGenerateClaimsCsvArgs,
  GenerateClaimsCsvResponse,
  PublicUser,
  PartyBasketStatus,
  ReferralType,
  MutationBulkCreateReferralArgs,
  BulkCreateReferralResponse,
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
  completeClaim,
  createRewardClaim,
  getAllClaimsForReferral,
  paginateUserClaims,
  getCompletedUserReferralClaimsForTournament,
  getReferralById,
  getClaimsCsvData,
  getLootboxByAddress,
  getUser,
  getCompletedClaimsForReferral,
} from "../../../api/firestore";
import {
  ClaimID,
  PartyBasketID,
  ReferralID,
  ReferralSlug,
  TournamentID,
  UserID,
  UserIdpID,
} from "../../../lib/types";
import { Address } from "@wormgraph/helpers";
import { saveCsvToStorage } from "../../../api/storage";
import { manifest } from "../../../manifest";
import { convertUserToPublicUser } from "../user/utils";
import { csvCleaner } from "../../../lib/csv";
import provider from "../../../api/identityProvider/firebase";

// WARNING - this message is stupidly parsed in the frontend for internationalization.
//           if you change it, make sure you update @lootbox/widgets file OnboardingSignUp.tsx if needed
const HACKY_MESSAGE =
  "You have already accepted a referral for this tournament";

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
    userLink: async (claim: Claim): Promise<PublicUser | null> => {
      if (claim.type === ClaimType.Referral) {
        if (!claim.referrerId) {
          return null;
        }

        try {
          const user = await getUser(claim.referrerId);
          const publicUser = user ? convertUserToPublicUser(user) : null;

          return publicUser;
        } catch (err) {
          console.error(err);
          return null;
        }
      } else if (claim.type === ClaimType.Reward) {
        if (!claim.rewardFromFriendReferred) {
          return null;
        }

        try {
          const user = await getUser(claim.rewardFromFriendReferred);
          const publicUser = user ? convertUserToPublicUser(user) : null;

          return publicUser;
        } catch (err) {
          console.error(err);
          return null;
        }
      }

      return null;
    },
    chosenPartyBasket: async (claim: Claim): Promise<PartyBasket | null> => {
      if (!claim.chosenPartyBasketId) {
        return null;
      }

      const partyBasket = await getPartyBasketById(
        claim.chosenPartyBasketId as PartyBasketID
      );

      return !partyBasket ? null : partyBasket;
    },
    tournament: async (claim: Claim): Promise<Tournament | null> => {
      if (!claim.tournamentId) {
        return null;
      }

      const tournament = await getTournamentById(
        claim.tournamentId as TournamentID
      );

      return !tournament ? null : tournament;
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
    bulkCreateReferral: async (
      _,
      { payload }: MutationBulkCreateReferralArgs,
      context: Context
    ): Promise<BulkCreateReferralResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "You must be logged in to bulk create a referral",
          },
        };
      }

      if (payload.numReferrals === 0) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Must be greater than zero",
          },
        };
      }

      if (payload.numReferrals > 300) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Must be less than or equal to 300",
          },
        };
      }

      const campaignName = payload.campaignName || `Campaign ${nanoid(5)}`;

      let tournament: Tournament | undefined;
      let partyBasket: PartyBasket | undefined;

      // Tournament checks
      try {
        tournament = await getTournamentById(
          payload.tournamentId as TournamentID
        );
        if (!tournament) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Tournament not found",
            },
          };
        }
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: "Error fetching tournament",
          },
        };
      }

      if (
        payload.type === ReferralType.OneTime &&
        context.userId !== tournament.creatorId
      ) {
        return {
          error: {
            code: StatusCode.Forbidden,
            message: "You must own the tournament to make a one time referral",
          },
        };
      }

      // Party Basket checks
      if (!!payload.partyBasketId) {
        try {
          partyBasket = await getPartyBasketById(
            payload.partyBasketId as PartyBasketID
          );
        } catch (err) {
          // Swallow error, proceed without party basket
          console.log("error fetching party basket", err);
        }
      }

      if (
        !!partyBasket &&
        (partyBasket?.status === PartyBasketStatus.Disabled ||
          partyBasket?.status === PartyBasketStatus.SoldOut)
      ) {
        // Make sure the party basket is not disabled
        return {
          error: {
            code: StatusCode.InvalidOperation,
            message: "Party Basket is disabled or sold out",
          },
        };
      }

      if (!!payload.referrerId) {
        try {
          const user = await getUser(payload.referrerId);
          if (!user) {
            return {
              error: {
                code: StatusCode.NotFound,
                message: "Referrer requested does not exist",
              },
            };
          }
        } catch (err) {
          console.error(err);
          return {
            error: {
              code: StatusCode.ServerError,
              message: "An error occured!",
            },
          };
        }
      }

      try {
        const referrals = await Promise.allSettled(
          Array.from(Array(payload.numReferrals).keys()).map(async () => {
            const referrer = (payload.referrerId || context.userId) as
              | UserIdpID
              | undefined;
            const creator = context.userId as UserIdpID | undefined;
            if (!referrer) {
              console.error("Requested referrer not found", referrer);
              throw new Error("Requested referrer not found");
            }
            if (!creator) {
              console.error("User not authenticated", referrer);
              throw new Error("Not authenticated");
            }

            let slug = nanoid(10) as ReferralSlug;
            // Make sure the slug is not in use... :(
            const _referral = await getReferralBySlug(slug);
            if (!!_referral) {
              // oh snap... try again lol
              slug = nanoid(10) as ReferralSlug;
              const _referral2 = await getReferralBySlug(slug);
              if (!!_referral2) {
                throw new Error(
                  "Non-unique referral slug generated. Please try again."
                );
              }
            }

            const res = await createReferral({
              slug,
              referrerId: referrer,
              creatorId: creator,
              campaignName,
              type: payload.type,
              tournamentId: payload.tournamentId as TournamentID,
              seedPartyBasketId: payload.partyBasketId
                ? (payload.partyBasketId as PartyBasketID)
                : undefined,
            });

            return res;
          })
        );

        const data: BulkReferralCsvRow[] = [];
        const errs: BulkReferralCsvRow[] = [];

        referrals.map((a) => {
          if (a.status === "fulfilled") {
            data.push({
              url: `${manifest.microfrontends.webflow.referral}?r=${a.value.slug}`,
              error: "",
            });
          } else {
            // rejected
            errs.push({
              url: "",
              error: JSON.stringify(a.reason),
            });
          }
        });

        var lineArray: string[] = [];
        [...errs, ...data].forEach(function (claimsRow, index) {
          // If index == 0, then we are at the header row
          if (index == 0) {
            const titles = Object.keys(claimsRow);
            lineArray.push(titles.join(","));
          }

          const values = Object.values(claimsRow);
          var line = values.join(",");
          lineArray.push(line);
        });
        var csvContent = lineArray.join("\n");

        const downloadUrl = await saveCsvToStorage({
          fileName: `referrals/${tournament.id}-${
            payload.referrerId || context.userId
          }-${nanoid()}.csv`,
          data: csvContent,
          bucket: manifest.firebase.storageBucket,
        });

        return {
          csv: downloadUrl,
        };
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: "An error occured",
          },
        };
      }
    },
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
      const requestedReferralType =
        payload.type == undefined ? ReferralType.Viral : payload.type;

      try {
        const [existingReferral, tournament, partyBasket, requestedReferrer] =
          await Promise.all([
            getReferralBySlug(slug),
            getTournamentById(payload.tournamentId as TournamentID),
            !!payload.partyBasketId
              ? getPartyBasketById(payload.partyBasketId as PartyBasketID)
              : null,
            !!payload.referrerId
              ? getUser(payload.referrerId) // returns undefined if not found
              : null,
          ]);

        if (!!payload?.referrerId && !requestedReferrer) {
          console.error("Referrer not found");
          throw new Error("Requested referrer not found");
        }

        if (!!existingReferral) {
          // Make sure the slug does not already exist
          console.error("Referral slug already exists");
          throw new Error("Please try again");
        }
        if (!tournament) {
          // Make sure the tournament exists
          throw new Error("Tournament not found");
        }
        if (partyBasket === undefined) {
          // Makesure the party basket exists
          throw new Error("Party Basket not found");
        }
        if (
          requestedReferralType === ReferralType.OneTime &&
          context.userId !== tournament.creatorId
        ) {
          throw new Error(
            "You must own the tournament to make a one time referral"
          );
        }
        if (
          partyBasket?.status === PartyBasketStatus.Disabled ||
          partyBasket?.status === PartyBasketStatus.SoldOut
        ) {
          // Make sure the party basket is not disabled
          throw new Error("Party Basket is disabled or sold out");
        }

        const campaignName = payload.campaignName || `Campaign ${nanoid(5)}`;
        const referrerIdToSet = payload.referrerId
          ? (payload.referrerId as UserIdpID)
          : context.userId;

        const referral = await createReferral({
          slug,
          referrerId: referrerIdToSet,
          creatorId: context.userId,
          campaignName,
          type: requestedReferralType,
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

        let claimType: ClaimType.OneTime | ClaimType.Referral;
        if (referral.type === ReferralType.OneTime) {
          claimType = ClaimType.OneTime;
        } else if (
          referral.type === ReferralType.Viral ||
          referral.type === ReferralType.Genesis
        ) {
          claimType = ClaimType.Referral;
        } else {
          console.warn("invalid referral", referral);
          // This should throw an error, but allowed to allow old referrals to work (when referral.tyle===undefined)
          // default to viral
          claimType = ClaimType.Referral;
        }

        const claim = await createStartingClaim({
          claimType,
          referralCampaignName: referral.campaignName,
          referralId: referral.id as ReferralID,
          tournamentId: referral.tournamentId as TournamentID,
          referrerId: referral.referrerId as UserIdpID,
          referralSlug: payload.referralSlug as ReferralSlug,
          tournamentName: tournament.title,
          referralType: referral.type || ReferralType.Viral, // default to viral
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
        const [user, claim, partyBasket] = await Promise.all([
          provider.getUserById(context.userId),
          getClaimById(payload.claimId as ClaimID),
          getPartyBasketById(payload.chosenPartyBasketId as PartyBasketID),
        ]);

        if (!user || !user.phoneNumber) {
          // Prevent abuse by requiring a phone number
          return {
            error: {
              code: StatusCode.Forbidden,
              message:
                "You need to login with your PHONE NUMBER to claim a ticket.",
            },
          };
        }
        if (!claim || !!claim?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Claim not found",
            },
          };
        }
        if (context.userId === claim.referrerId) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: "You cannot redeem your own referral link!",
            },
          };
        }
        if (!partyBasket || !!partyBasket?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Party Basket not found",
            },
          };
        }
        if (claim.status === ClaimStatus.Complete) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Claim already completed",
            },
          };
        }
        if (
          partyBasket.status === PartyBasketStatus.Disabled ||
          partyBasket.status === PartyBasketStatus.SoldOut
        ) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Out of stock! Please select a different team.",
            },
          };
        }
        if (claim.type === ClaimType.Reward) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: "Cannot complete a Reward type claim",
            },
          };
        }

        // Make sure the user has not accepted a claim for a tournament before
        const [previousClaims, tournament, referral, lootbox] =
          await Promise.all([
            getCompletedUserReferralClaimsForTournament(
              context.userId,
              claim.tournamentId as TournamentID,
              1
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
        }
        if (!referral || !!referral.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Referral not found",
            },
          };
        }

        if (referral.referrerId === context.userId) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: "You cannot redeem your own referral link!",
            },
          };
        }
        if (!tournament || !!tournament.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Tournament not found",
            },
          };
        }

        // Old logic TODO: remove it in a week or two
        if (referral.type == undefined) {
          if (previousClaims.length > 0) {
            return {
              error: {
                code: StatusCode.BadRequest,
                // WARNING - this message is stupidly parsed in the frontend for internationalization.
                //           if you change it, make sure you update @lootbox/widgets file OnboardingSignUp.tsx if needed
                message: HACKY_MESSAGE,
              },
            };
          }
        } else {
          // New validation logic
          if (
            referral.type === ReferralType.Viral ||
            referral.type === ReferralType.Genesis ||
            claim.type === ClaimType.Referral
          ) {
            if (previousClaims.length > 0) {
              return {
                error: {
                  code: StatusCode.BadRequest,
                  // WARNING - this message is stupidly parsed in the frontend for internationalization.
                  //           if you change it, make sure you update @lootbox/widgets file OnboardingSignUp.tsx if needed
                  message: HACKY_MESSAGE,
                },
              };
            }
          }

          if (referral.type === ReferralType.OneTime) {
            const previousClaimsForReferral =
              await getCompletedClaimsForReferral(referral.id as ReferralID, 1);
            if (previousClaimsForReferral.length > 0) {
              return {
                error: {
                  code: StatusCode.BadRequest,
                  message: "This referral link has already been used",
                },
              };
            }
          }
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

        // Now write the referrers reward claim (type=REWARD)
        const currentAmount = partyBasket?.runningCompletedClaims || 0;
        const maxAmount = partyBasket?.maxClaimsAllowed || 10000;
        const isBonuxWithinLimit = currentAmount + 1 <= maxAmount; // +1 because we will be adding one bonus claim
        if (
          isBonuxWithinLimit &&
          (referral.type === ReferralType.Viral ||
            // Old deprecated thing
            (referral.type == undefined &&
              referral.referrerId &&
              !referral.isRewardDisabled))
        ) {
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
              claimerId: referral.referrerId as UserID,
              rewardFromFriendReferred: context.userId as unknown as UserID,
              chosenPartyBasketNFTBountyValue: !!partyBasket.nftBountyValue
                ? partyBasket.nftBountyValue
                : undefined,
            });
          } catch (err) {
            // If error here, we just make a log... but we dont return an error to client
            console.error("Error writting reward claim", err);
          }
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
    generateClaimsCsv: async (
      _,
      { payload }: MutationGenerateClaimsCsvArgs,
      context: Context
    ): Promise<GenerateClaimsCsvResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: "You must be logged in to generate a CSV",
          },
        };
      }

      try {
        const tournament = await getTournamentById(
          payload.tournamentId as TournamentID
        );

        if (!tournament || !!tournament.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Tournament not found",
            },
          };
        } else if (tournament?.creatorId !== context.userId) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message:
                "You do not have permission to generate a CSV for this tournament",
            },
          };
        }

        const csvData = await getClaimsCsvData(
          payload.tournamentId as TournamentID
        );

        var lineArray: string[] = [];
        csvData.forEach(function (claimsRow, index) {
          // If index == 0, then we are at the header row
          if (index == 0) {
            const titles = Object.keys(claimsRow);
            lineArray.push(titles.join(","));
          }

          const values = Object.values(claimsRow).map(csvCleaner);
          var line = values.join(",");
          // lineArray.push(
          //   index == 0 ? "data:text/csv;charset=utf-8," + line : line
          // );
          lineArray.push(line);
        });
        var csvContent = lineArray.join("\n");

        const downloadUrl = await saveCsvToStorage({
          fileName: `claims/${
            (tournament?.id ? `${tournament.id}-` : "") + nanoid()
          }.csv`,
          data: csvContent,
          bucket: manifest.firebase.storageBucket,
        });

        return {
          csv: downloadUrl,
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

  GenerateClaimsCsvResponse: {
    __resolveType: (obj: GenerateClaimsCsvResponse) => {
      if ("csv" in obj) {
        return "GenerateClaimsCsvResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },

  BulkCreateReferralResponse: {
    __resolveType: (obj: BulkCreateReferralResponse) => {
      if ("csv" in obj) {
        return "BulkCreateReferralResponseSuccess";
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
  "Mutation.generateClaimsCsv": [isAuthenticated()],
  "Mutation.bulkCreateReferral": [isAuthenticated()],
};

const referralResolvers = composeResolvers(
  ReferralResolvers,
  referralResolverComposition
);

export default referralResolvers;
