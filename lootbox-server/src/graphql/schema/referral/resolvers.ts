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
  ClaimType,
  Referral,
  Claim,
  QueryReferralArgs,
  ReferralResponse,
  Tournament,
  UserClaimsResponse,
  QueryUserClaimsArgs,
  CreateClaimResponse,
  MutationGenerateClaimsCsvArgs,
  GenerateClaimsCsvResponse,
  PublicUser,
  ReferralType,
  MutationBulkCreateReferralArgs,
  BulkCreateReferralResponse,
  Lootbox,
  MintWhitelistSignature,
  QueryClaimByIdArgs,
  ClaimByIdResponse,
  ListAvailableLootboxesForClaimResponse,
} from "../../generated/types";
import { Context } from "../../server";
import { nanoid } from "nanoid";
import {
  getReferralBySlug,
  createReferral,
  getTournamentById,
  createStartingClaim,
  getClaimById,
  completeClaim,
  getAllClaimsForReferral,
  paginateUserClaims,
  getClaimsCsvData,
  getUser,
  getLootbox,
  getAffiliate,
  getMintWhistlistSignature,
  getLootboxTournamentSnapshotByLootboxID,
  completeAnonClaim,
  getLootboxOptionsForTournament,
} from "../../../api/firestore";
import {
  AffiliateID,
  ClaimID,
  Claim_Firestore,
  LootboxID,
  LootboxMintWhitelistID,
  LootboxStatus_Firestore,
  LootboxTournamentSnapshot_Firestore,
  LootboxTournamentStatus_Firestore,
  Lootbox_Firestore,
  ReferralID,
  ReferralSlug,
  TournamentID,
  UserID,
  UserIdpID,
} from "@wormgraph/helpers";
import {
  Address,
  Tournament_Firestore,
  ClaimStatus_Firestore,
  ClaimType_Firestore,
  ReferralType_Firestore,
} from "@wormgraph/helpers";
import { saveCsvToStorage } from "../../../api/storage";
import { manifest } from "../../../manifest";
import { convertUserToPublicUser } from "../user/utils";
import { csvCleaner } from "../../../lib/csv";
import provider from "../../../api/identityProvider/firebase";
import { convertTournamentDBToGQL } from "../../../lib/tournament";
import {
  convertClaimDBToGQL,
  convertClaimPrivacyScopeDBToGQL,
  convertClaimPrivacyScopeGQLToDB,
  convertReferralDBToGQL,
  convertReferralTypeGQLToDB,
} from "../../../lib/referral";
import {
  convertLootboxDBToGQL,
  convertMintWhitelistSignatureDBToGQL,
} from "../../../lib/lootbox";
import * as claimService from "../../../service/claim";
import { QueryListAvailableLootboxesForClaimArgs } from "../../generated/types";
import * as referralService from "../../../service/referral";

// WARNING - this message is stupidly parsed in the frontend for internationalization.
//           if you change it, make sure you update @lootbox/widgets file OnboardingSignUp.tsx if needed
// Also this is duplicated in @firebase/functions
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

        return { referral: convertReferralDBToGQL(referral) };
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
    claimByID: async (
      _,
      { claimID }: QueryClaimByIdArgs
    ): Promise<ClaimByIdResponse> => {
      try {
        const claim = await getClaimById(claimID as ClaimID);

        if (!claim || claim.timestamps.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Claim not found",
            },
          };
        }

        return { claim: convertClaimDBToGQL(claim) };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }
    },
    listAvailableLootboxesForClaim: async (
      _,
      { tournamentID }: QueryListAvailableLootboxesForClaimArgs
    ): Promise<ListAvailableLootboxesForClaimResponse> => {
      try {
        const { termsOfService, lootboxOptions } =
          await getLootboxOptionsForTournament(tournamentID as TournamentID);
        console.log(`Lootbox Options = `);
        console.log(lootboxOptions.map((l) => l.id));
        return {
          termsOfService: termsOfService,
          lootboxOptions: lootboxOptions,
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

  Claim: {
    whitelist: async (claim: Claim): Promise<MintWhitelistSignature | null> => {
      if (!claim.whitelistId || !claim.lootboxID) {
        return null;
      }

      const whitelist = await getMintWhistlistSignature(
        claim.lootboxID as LootboxID,
        claim.whitelistId as LootboxMintWhitelistID
      );

      return whitelist ? convertMintWhitelistSignatureDBToGQL(whitelist) : null;
    },
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
    chosenLootbox: async (claim: Claim): Promise<Lootbox | null> => {
      let lootboxID = claim.lootboxID;
      if (!lootboxID) {
        // Is it in deprecated spot?
        // @ts-ignore
        lootboxID = claim?.chosenLootboxId;
      }

      if (!lootboxID) {
        return null;
      }

      try {
        const lootbox = await getLootbox(lootboxID as LootboxID);
        if (!lootbox) {
          throw new Error("Lootbox not found");
        }

        return convertLootboxDBToGQL(lootbox);
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    tournament: async (claim: Claim): Promise<Tournament | null> => {
      if (!claim.tournamentId) {
        return null;
      }

      const tournament = await getTournamentById(
        claim.tournamentId as TournamentID
      );

      return !tournament ? null : convertTournamentDBToGQL(tournament);
    },
  },

  Referral: {
    claims: async (referral: Referral): Promise<Claim[]> => {
      const claims = await getAllClaimsForReferral(referral.id as ReferralID);
      return claims.map(convertClaimDBToGQL);
    },
    tournament: async (referral: Referral): Promise<Tournament | null> => {
      const tournament = await getTournamentById(
        referral.tournamentId as TournamentID
      );
      return !tournament ? null : convertTournamentDBToGQL(tournament);
    },
    seedLootbox: async (referral: Referral): Promise<Lootbox | null> => {
      if (!referral.seedLootboxID) {
        return null;
      }

      try {
        const lootbox = await getLootbox(referral.seedLootboxID as LootboxID);
        if (!lootbox) {
          throw new Error("Lootbox not found");
        }

        return convertLootboxDBToGQL(lootbox);
      } catch (err) {
        console.error(err);
        return null;
      }
    },
  },

  Mutation: {
    /** @todo: refactor logic into service layer */
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

      let tournament: Tournament_Firestore | undefined;
      let lootbox: Lootbox_Firestore | undefined;
      let lootboxTournamentSnapshot:
        | LootboxTournamentSnapshot_Firestore
        | undefined;

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
        (context.userId as unknown as UserID) !== tournament.creatorId
      ) {
        return {
          error: {
            code: StatusCode.Forbidden,
            message: "You must own the tournament to make a one time referral",
          },
        };
      }

      if (!!payload.lootboxID) {
        try {
          lootbox = await getLootbox(payload.lootboxID as LootboxID);
        } catch (err) {
          console.log("error fetching lootbox", err);
        }
      }

      let isSeedLootboxEnabled =
        !!payload.lootboxID &&
        !!lootbox &&
        lootbox.status !== LootboxStatus_Firestore.disabled &&
        lootbox.status !== LootboxStatus_Firestore.soldOut;

      // we get the lootbox tournament snapshot
      if (!!isSeedLootboxEnabled && !!lootbox) {
        const lootboxTournamentSnapshot =
          await getLootboxTournamentSnapshotByLootboxID(
            tournament.id,
            lootbox.id
          );
        // Only allow the seed lootbox if it is enabled for the tournament
        isSeedLootboxEnabled =
          isSeedLootboxEnabled &&
          !!lootboxTournamentSnapshot &&
          !lootboxTournamentSnapshot.timestamps.deletedAt &&
          lootboxTournamentSnapshot.status ===
            LootboxTournamentStatus_Firestore.active;
      }

      if (isSeedLootboxEnabled && lootbox?.safetyFeatures?.isExclusiveLootbox) {
        const callerUserID = context.userId as unknown as UserID;
        // Dont allow exclusive lootbox referrals if the user is not tournament host or lootbox creator
        isSeedLootboxEnabled =
          isSeedLootboxEnabled &&
          (callerUserID === tournament.creatorId ||
            callerUserID === lootbox.creatorID);
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
        let userIdFromPromoter;
        let promoterIdToSet;
        if (payload.promoterId) {
          const affiliate = await getAffiliate(
            payload.promoterId as AffiliateID
          );
          if (affiliate) {
            userIdFromPromoter = affiliate.userID;
            promoterIdToSet = affiliate.id;
          }
        }
        const referrals = await Promise.allSettled(
          Array.from(Array(payload.numReferrals).keys()).map(async () => {
            const referrer = (userIdFromPromoter ||
              payload.referrerId ||
              context.userId) as UserID | undefined;
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

            const campaignName =
              payload.campaignName || `Campaign ${nanoid(5)}`;

            const res = await createReferral({
              slug,
              referrerId: referrer,
              promoterId: promoterIdToSet,
              creatorId: creator as unknown as UserID,
              campaignName,
              type: convertReferralTypeGQLToDB(payload.type),
              tournamentId: payload.tournamentId as TournamentID,
              seedLootboxID:
                lootbox && isSeedLootboxEnabled ? lootbox.id : undefined,
              isPostCosmic: true,
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

      try {
        if (!payload.tournamentId) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Event ID is required",
            },
          };
        }
        const referral = await referralService.create(
          {
            campaignName: payload.campaignName,
            promoterId: payload.promoterId as AffiliateID | null | undefined,
            referrerId: payload.referrerId as UserID | null | undefined,
            tournamentId: payload.tournamentId as TournamentID,
            type: payload.type,
            lootboxID: payload.lootboxID as LootboxID | null | undefined,
          },
          context.userId as unknown as UserID
        );
        const rf = convertReferralDBToGQL(referral);

        return { referral: rf };
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
        const claim = await claimService.startClaimProcess({
          referralSlug: payload.referralSlug as ReferralSlug,
        });

        return {
          claim: convertClaimDBToGQL(claim),
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
        const [user, claim] = await Promise.all([
          provider.getUserById(context.userId as unknown as UserID),
          getClaimById(payload.claimId as ClaimID),
        ]);

        if (!user) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: "You need to login to claim a ticket.",
            },
          };
        }
        if (!claim) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Claim not found",
            },
          };
        }

        if (!payload.chosenLootboxID) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Must choose a lootbox",
            },
          };
        }

        // To prevent abuse, we ensure the user has a phone number to complete a claim.
        // If they dont, they are usually an anonymous user and the claim actually becomes status = unverified
        // In this case, no side effects happen until some async method changes the claim status to status = complete
        // & firebase cloud function "onClaimWrite" gets triggered
        const isPhoneVerified = !!user.phoneNumber;
        let updatedClaim: Claim_Firestore | undefined;
        if (isPhoneVerified) {
          const { targetLootbox } =
            await claimService.validatePendingClaimForCompletion(
              claim,
              user,
              payload.chosenLootboxID as LootboxID
            );

          // set status = complete
          updatedClaim = await completeClaim({
            claimId: claim.id as ClaimID,
            referralId: claim.referralId as ReferralID,
            lootboxID: payload.chosenLootboxID as LootboxID,
            lootboxAddress: targetLootbox.address,
            lootboxName: targetLootbox.name,
            lootboxNFTBountyValue: targetLootbox.nftBountyValue,
            lootboxMaxTickets: targetLootbox.maxTickets,
            claimerUserId: context.userId as unknown as UserID,
          });
        } else {
          const { targetLootbox } =
            await claimService.validatePendingClaimForUnverified(
              claim,
              user,
              payload.chosenLootboxID as LootboxID
            );

          // set status = unverified
          // side effects like firebase cloud function "onClaimWrite" DO NOT get triggered
          updatedClaim = await completeAnonClaim({
            claimId: claim.id as ClaimID,
            referralId: claim.referralId as ReferralID,
            lootboxID: payload.chosenLootboxID as LootboxID,
            lootboxAddress: targetLootbox.address,
            lootboxName: targetLootbox.name,
            lootboxNFTBountyValue: targetLootbox.nftBountyValue,
            lootboxMaxTickets: targetLootbox.maxTickets,
            claimerUserId: context.userId as unknown as UserID,
          });
        }

        return {
          claim: convertClaimDBToGQL(updatedClaim),
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
        } else if (
          (tournament?.creatorId as unknown as UserIdpID) !== context.userId
        ) {
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

  ClaimByIDResponse: {
    __resolveType: (obj: ClaimByIdResponse) => {
      if ("claim" in obj) {
        return "ClaimByIDResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }
      return null;
    },
  },
  ListAvailableLootboxesForClaimResponse: {
    __resolveType: (obj: ListAvailableLootboxesForClaimResponse) => {
      if ("lootboxOptions" in obj) {
        return "ListAvailableLootboxesForClaimResponseSuccess";
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
  "Mutation.completeUntrustedClaim": [isAuthenticated()],
  "Mutation.pendingClaimToUntrusted": [isAuthenticated()],
};

const referralResolvers = composeResolvers(
  ReferralResolvers,
  referralResolverComposition
);

export default referralResolvers;
