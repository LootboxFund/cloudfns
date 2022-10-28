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
  Lootbox,
  MintWhitelistSignature,
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
  getLootbox,
  getAffiliate,
  getMintWhistlistSignature,
  getLootboxTournamentSnapshot,
  getLootboxTournamentSnapshotByLootboxID,
} from "../../../api/firestore";
import {
  AffiliateID,
  ClaimID,
  LootboxID,
  LootboxMintWhitelistID,
  LootboxStatus_Firestore,
  LootboxTournamentSnapshot_Firestore,
  LootboxTournamentStatus_Firestore,
  Lootbox_Firestore,
  PartyBasketID,
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
  convertReferralDBToGQL,
  convertReferralTypeGQLToDB,
} from "../../../lib/referral";
import {
  convertLootboxDBToGQL,
  convertMintWhitelistSignatureDBToGQL,
} from "../../../lib/lootbox";

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

      if (tournament.isPostCosmic) {
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
      } else {
        // ################ DEPRECATED ################
        let partyBasket: PartyBasket | undefined;
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

        // ################################
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
              seedPartyBasketId: payload.partyBasketId
                ? (payload.partyBasketId as PartyBasketID)
                : undefined,
              isPostCosmic: !!tournament?.isPostCosmic,
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
        const [existingReferral, tournament, lootbox, requestedReferrer] =
          await Promise.all([
            getReferralBySlug(slug),
            getTournamentById(payload.tournamentId as TournamentID),
            !!payload.lootboxID
              ? getLootbox(payload.lootboxID as LootboxID)
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
        if (
          requestedReferralType === ReferralType.OneTime &&
          (context.userId as unknown as UserID) !== tournament.creatorId
        ) {
          throw new Error(
            "You must own the tournament to make a one time referral"
          );
        }
        if (lootbox === undefined) {
          // If lootbox=null then it was not requested & the request will go through
          throw new Error("Lootbox not found");
        }

        let isSeedLootboxEnabled =
          !!payload.lootboxID &&
          !!lootbox &&
          lootbox.status !== LootboxStatus_Firestore.disabled &&
          lootbox.status !== LootboxStatus_Firestore.soldOut;

        if (tournament.isPostCosmic) {
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
        } else {
          /** @deprecated - todo only use Lootbox */
          let partyBasket: PartyBasket | undefined = undefined;
          if (payload.partyBasketId) {
            /** @deprecated!!!!! */
            partyBasket = await getPartyBasketById(
              payload.partyBasketId as PartyBasketID
            );

            if (partyBasket === undefined) {
              // Makesure the party basket exists
              throw new Error("Party Basket not found");
            }

            if (
              partyBasket?.status === PartyBasketStatus.Disabled ||
              partyBasket?.status === PartyBasketStatus.SoldOut
            ) {
              // Make sure the party basket is not disabled
              throw new Error("Party Basket is disabled or sold out");
            }
          }
        }

        const campaignName = payload.campaignName || `Campaign ${nanoid(5)}`;
        let referrerIdToSet = payload.referrerId
          ? (payload.referrerId as UserID)
          : (context.userId as unknown as UserID);
        let promoterIdToSet;
        if (payload.promoterId) {
          const affiliate = await getAffiliate(
            payload.promoterId as AffiliateID
          );
          if (affiliate) {
            referrerIdToSet = affiliate.userID;
            promoterIdToSet = affiliate.id;
          }
        }

        const referral = await createReferral({
          slug,
          referrerId: referrerIdToSet,
          promoterId: promoterIdToSet,
          creatorId: context.userId as unknown as UserID,
          campaignName,
          type: convertReferralTypeGQLToDB(requestedReferralType),
          tournamentId: payload.tournamentId as TournamentID,
          seedLootboxID: isSeedLootboxEnabled
            ? (payload.lootboxID as LootboxID)
            : undefined,

          /** @deprecated */
          seedPartyBasketId: payload.partyBasketId
            ? (payload.partyBasketId as PartyBasketID)
            : undefined,
          isPostCosmic: !!tournament.isPostCosmic,
        });
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

        let claimType:
          | ClaimType_Firestore.one_time
          | ClaimType_Firestore.referral;
        if (referral.type === ReferralType_Firestore.one_time) {
          claimType = ClaimType_Firestore.one_time;
        } else if (
          referral.type === ReferralType_Firestore.viral ||
          referral.type === ReferralType_Firestore.genesis
        ) {
          claimType = ClaimType_Firestore.referral;
        } else {
          console.warn("invalid referral", referral);
          // This should throw an error, but allowed to allow old referrals to work (when referral.tyle===undefined)
          // default to viral
          claimType = ClaimType_Firestore.referral;
        }

        const claim = await createStartingClaim({
          claimType,
          referralCampaignName: referral.campaignName,
          referralId: referral.id as ReferralID,
          promoterId: referral.promoterId,
          tournamentId: referral.tournamentId as TournamentID,
          referrerId: referral.referrerId as unknown as UserIdpID,
          referralSlug: payload.referralSlug as ReferralSlug,
          tournamentName: tournament.title,
          referralType: referral.type || ReferralType.Viral, // default to viral
          originLootboxID: referral.seedLootboxID,
          originPartyBasketId: !!referral.seedPartyBasketId
            ? (referral.seedPartyBasketId as PartyBasketID)
            : undefined,
          isPostCosmic: !!referral.isPostCosmic,
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
        if ((context.userId as unknown as UserID) === claim.referrerId) {
          return {
            error: {
              code: StatusCode.Forbidden,
              message: "You cannot redeem your own referral link!",
            },
          };
        }
        if (claim.status === ClaimStatus_Firestore.complete) {
          return {
            error: {
              code: StatusCode.BadRequest,
              message: "Claim already completed",
            },
          };
        }
        if (claim.type === ClaimType_Firestore.reward) {
          return {
            error: {
              code: StatusCode.ServerError,
              message: "Cannot complete a Reward type claim",
            },
          };
        }

        if (!!claim?.isPostCosmic) {
          if (!payload.chosenLootboxID) {
            return {
              error: {
                code: StatusCode.BadRequest,
                message: "Must choose a lootbox",
              },
            };
          }

          // Make sure the user has not accepted a claim for a tournament before
          const [
            previousClaims,
            tournament,
            referral,
            lootbox,
            lootboxTournamentSnapshot,
          ] = await Promise.all([
            getCompletedUserReferralClaimsForTournament(
              context.userId,
              claim.tournamentId as TournamentID,
              1
            ),
            getTournamentById(claim.tournamentId as TournamentID),
            getReferralById(claim.referralId as ReferralID),
            getLootbox(payload.chosenLootboxID as LootboxID),
            getLootboxTournamentSnapshotByLootboxID(
              claim.tournamentId,
              payload.chosenLootboxID as LootboxID
            ),
          ]);

          if (!lootbox || !!lootbox?.timestamps?.deletedAt) {
            return {
              error: {
                code: StatusCode.NotFound,
                message: "Lootbox not found",
              },
            };
          }
          if (
            lootbox.status === LootboxStatus_Firestore.disabled ||
            lootbox.status === LootboxStatus_Firestore.soldOut
          ) {
            return {
              error: {
                code: StatusCode.BadRequest,
                message: "Out of stock! Please select a different team.",
              },
            };
          }

          if (
            !lootboxTournamentSnapshot ||
            !!lootboxTournamentSnapshot.timestamps.deletedAt
          ) {
            return {
              error: {
                code: StatusCode.NotFound,
                message: "Lootbox Tournament Snapshot not found",
              },
            };
          }

          if (
            lootboxTournamentSnapshot.status ===
            LootboxTournamentStatus_Firestore.disabled
          ) {
            return {
              error: {
                code: StatusCode.BadRequest,
                message: "Out of stock! Please select a different team.",
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

          if (
            (referral.referrerId as unknown as UserIdpID) === context.userId
          ) {
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

          if (
            referral.type === ReferralType_Firestore.viral ||
            referral.type === ReferralType_Firestore.genesis ||
            claim.type === ClaimType_Firestore.referral
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

          if (referral.type === ReferralType_Firestore.one_time) {
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

          const updatedClaim = await completeClaim({
            claimId: claim.id as ClaimID,
            referralId: claim.referralId as ReferralID,
            lootboxID: payload.chosenLootboxID as LootboxID,
            lootboxAddress: lootbox.address,
            lootboxName: lootbox.name,
            lootboxNFTBountyValue: lootbox.nftBountyValue,
            lootboxMaxTickets: lootbox.maxTickets,
            claimerUserId: context.userId as unknown as UserID,
          });

          return {
            claim: convertClaimDBToGQL(updatedClaim),
          };
        } else {
          // DEPRECATED
          if (!payload.chosenPartyBasketId) {
            return {
              error: {
                code: StatusCode.BadRequest,
                message: "Must choose a party basket",
              },
            };
          }

          const partyBasket = await getPartyBasketById(
            payload.chosenPartyBasketId as PartyBasketID
          );

          if (!partyBasket || !!partyBasket?.timestamps?.deletedAt) {
            return {
              error: {
                code: StatusCode.NotFound,
                message: "Party Basket not found",
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

          if (
            (referral.referrerId as unknown as UserIdpID) === context.userId
          ) {
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
              referral.type === ReferralType_Firestore.viral ||
              referral.type === ReferralType_Firestore.genesis ||
              claim.type === ClaimType_Firestore.referral
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

            if (referral.type === ReferralType_Firestore.one_time) {
              const previousClaimsForReferral =
                await getCompletedClaimsForReferral(
                  referral.id as ReferralID,
                  1
                );
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
            claimerUserId: context.userId as unknown as UserID,
            lootboxID: lootbox.id as LootboxID,
          });

          // Now write the referrers reward claim (type=REWARD)
          const currentAmount = partyBasket?.runningCompletedClaims || 0;
          const maxAmount = partyBasket?.maxClaimsAllowed || 10000;
          const isBonuxWithinLimit = currentAmount + 1 <= maxAmount; // +1 because we will be adding one bonus claim
          if (
            isBonuxWithinLimit &&
            referral.type === ReferralType_Firestore.viral
          ) {
            try {
              await createRewardClaim({
                referralCampaignName: referral.campaignName,
                referralId: claim.referralId as ReferralID,
                tournamentId: claim.tournamentId as TournamentID,
                referralSlug: claim.referralSlug as ReferralSlug,
                rewardFromClaim: claim.id as ClaimID,
                tournamentName: tournament.title,
                chosenPartyBasketId:
                  payload.chosenPartyBasketId as PartyBasketID,
                chosenPartyBasketAddress: partyBasket.address as Address,
                chosenPartyBasketName: partyBasket.name,
                lootboxAddress: lootbox.address || undefined,
                lootboxName: lootbox.name,
                claimerId: referral.referrerId as UserID,
                rewardFromFriendReferred: context.userId as unknown as UserID,
                chosenPartyBasketNFTBountyValue: !!partyBasket.nftBountyValue
                  ? partyBasket.nftBountyValue
                  : undefined,
                isPostCosmic: !!referral.isPostCosmic,
              });
            } catch (err) {
              // If error here, we just make a log... but we dont return an error to client
              console.error("Error writting reward claim", err);
            }
          }

          return {
            claim: convertClaimDBToGQL(updatedClaim),
          };
        }
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
