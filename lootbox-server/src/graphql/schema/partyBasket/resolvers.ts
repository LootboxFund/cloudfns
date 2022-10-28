import {
  Resolvers,
  MutationCreatePartyBasketArgs,
  MutationBulkWhitelistArgs,
  BulkWhitelistResponse,
  CreatePartyBasketResponse,
  StatusCode,
  PartyBasket,
  MutationRedeemSignatureArgs,
  GetWhitelistSignaturesResponse,
  RedeemSignatureResponse,
  GetPartyBasketResponse,
  QueryGetPartyBasketArgs,
  LootboxSnapshot,
  MutationGetWhitelistSignaturesArgs,
  EditPartyBasketResponse,
  MutationEditPartyBasketArgs,
  MutationWhitelistAllUnassignedClaimsArgs,
  PartyBasketStatus,
  WhitelistAllUnassignedClaimsResponse,
} from "../../generated/types";
import { Context } from "../../server";
import {
  getPartyBasketByAddress,
  createWhitelistSignature,
  createPartyBasket,
  getWhitelistSignature,
  getWhitelistSignaturesByAddress,
  redeemSignature,
  getLootboxByAddress,
  getPartyBasketById,
  editPartyBasket,
  getUnassignedClaims,
  getUser,
  getUserWallets,
  attachWhitelistIdToClaim,
} from "../../../api/firestore";
import {
  validatePartyBasketSignature,
  validateSignature,
  whitelistPartyBasketSignature,
} from "../../../lib/whitelist";
import {
  Address,
  ClaimID,
  ReferralID,
  UserID,
  Claim_Firestore,
  LootboxMintWhitelistID,
} from "@wormgraph/helpers";
import { generateNonceV1 } from "../../../lib/whitelist";
import { errors, ethers } from "ethers";
import { PartyBasketID, WhitelistSignatureID } from "@wormgraph/helpers";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { convertLootboxToSnapshot } from "../../../lib/lootbox";
import { getWhitelisterPrivateKey } from "../../../api/secrets";

const PartyBasketResolvers: Resolvers = {
  Query: {
    getPartyBasket: async (
      _,
      args: QueryGetPartyBasketArgs
    ): Promise<GetPartyBasketResponse> => {
      try {
        const partyBasket = await getPartyBasketByAddress(
          args.address as Address
        );
        if (!partyBasket) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Party Basket not found`,
            },
          };
        }
        return {
          partyBasket,
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

  PartyBasket: {
    lootboxSnapshot: async (
      partyBasket: PartyBasket
    ): Promise<LootboxSnapshot | null> => {
      try {
        const lootbox = await getLootboxByAddress(
          partyBasket.lootboxAddress as Address
        );
        if (!lootbox) {
          return null;
        }
        return convertLootboxToSnapshot(lootbox);
      } catch (err) {
        console.error(err);
        return null;
      }
    },
  },

  Mutation: {
    /**
     * Gets the party basket whitelist signatures, authenticated by a simple signature.
     *
     * This is a Mutation, because TODO: we need to add the Nonce to the database to avoid reuse
     */
    getWhitelistSignatures: async (
      _,
      { payload }: MutationGetWhitelistSignaturesArgs
    ): Promise<GetWhitelistSignaturesResponse> => {
      let address: Address;
      let nonce: string;
      let partyBasketAddress: Address;

      try {
        const res = await validatePartyBasketSignature(
          payload?.message,
          payload?.signedMessage
        );

        address = res.address;
        nonce = res.nonce;
        partyBasketAddress = res.partyBasket;
      } catch (err) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      try {
        // TODO: add the nonce to the database to avoid reuse
        const whitelistSignatures = await getWhitelistSignaturesByAddress(
          address,
          partyBasketAddress
        );
        return {
          signatures: whitelistSignatures,
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
    createPartyBasket: async (
      _,
      { payload }: MutationCreatePartyBasketArgs,
      context: Context
    ): Promise<CreatePartyBasketResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      if (!ethers.utils.isAddress(payload.address)) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: `Invalid Party Basket address`,
          },
        };
      }

      if (
        payload?.maxClaimsAllowed != undefined &&
        payload.maxClaimsAllowed <= 0
      ) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Max Claims Allowed must be greater than 0",
          },
        };
      }

      const [lootbox, partyBasket] = await Promise.all([
        getLootboxByAddress(payload.lootboxAddress as Address),
        getPartyBasketByAddress(payload.address as Address),
      ]);

      if (!lootbox) {
        return {
          error: {
            code: StatusCode.NotFound,
            message: `The Lootbox does not exist`,
          },
        };
      }
      if (!!partyBasket) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "The Party Basket already exists!",
          },
        };
      }

      try {
        const partyBasket = await createPartyBasket({
          address: payload.address as Address,
          factory: payload.factory as Address,
          name: payload.name,
          chainIdHex: payload.chainIdHex,
          creatorId: context.userId,
          lootboxAddress: payload.lootboxAddress as Address,
          creatorAddress: payload.creatorAddress as Address,
          nftBountyValue: payload.nftBountyValue || undefined,
          joinCommunityUrl: payload.joinCommunityUrl || undefined,
          maxClaimsAllowed: payload.maxClaimsAllowed || 5000,
        });

        return {
          partyBasket,
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
    bulkWhitelist: async (
      _,
      { payload }: MutationBulkWhitelistArgs,
      context: Context
    ): Promise<BulkWhitelistResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      const { partyBasketAddress, whitelistAddresses } = payload;

      if (whitelistAddresses.length > 50) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: `Too many addresses. At free tier, you can only whitelist up to 50 addresses at a time.`,
          },
        };
      }

      if (!ethers.utils.isAddress(partyBasketAddress)) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: `Invalid party basket address.`,
          },
        };
      }

      let partyBasket: PartyBasket;

      try {
        partyBasket = (await getPartyBasketByAddress(
          partyBasketAddress as Address
        )) as PartyBasket;
        if (!partyBasket) {
          throw new Error("Party Basket Not Found");
        }
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      if (partyBasket.status === PartyBasketStatus.Disabled) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Party Basket is disabled",
          },
        };
      }

      if (partyBasket.creatorId !== context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `You do not own this Party Basket`,
          },
        };
      }

      let whitelisterPrivateKey: string;
      try {
        whitelisterPrivateKey = await getWhitelisterPrivateKey();
      } catch (err) {
        console.error(err);
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      try {
        const signer = new ethers.Wallet(whitelisterPrivateKey);

        const res = await Promise.allSettled(
          whitelistAddresses.map(async (whitelistAddress: string) => {
            if (!ethers.utils.isAddress(whitelistAddress)) {
              throw new Error("Invalid Address");
            }
            const nonce = generateNonceV1();

            const signature = await whitelistPartyBasketSignature(
              partyBasket.chainIdHex,
              partyBasket.address,
              whitelistAddress,
              whitelisterPrivateKey,
              nonce
            );

            await createWhitelistSignature({
              signature,
              signer: signer.address as Address,
              whitelistedAddress: whitelistAddress as Address,
              partyBasketId: partyBasket.id as PartyBasketID,
              partyBasketAddress: partyBasketAddress as Address,
              nonce,
            });

            return signature;
          })
        );

        const signatures: (string | null)[] = [];
        const partialErrors: (string | null)[] = [];
        res.forEach((result) => {
          if (result.status === "fulfilled") {
            signatures.push(result.value);
            partialErrors.push(null);
          } else {
            partialErrors.push(result.reason);
            signatures.push(null);
          }
        });

        return {
          signatures,
          errors: partialErrors.every((err) => !!err) ? partialErrors : null,
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
    whitelistAllUnassignedClaims: async (
      _,
      { payload }: MutationWhitelistAllUnassignedClaimsArgs,
      context: Context
    ): Promise<WhitelistAllUnassignedClaimsResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `Unauthorized`,
          },
        };
      }

      let partyBasket: PartyBasket;
      try {
        const _partyBasket = await getPartyBasketById(
          payload.partyBasketId as PartyBasketID
        );
        if (!_partyBasket) {
          throw new Error("Not found");
        }
        partyBasket = _partyBasket;
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: "Error fetching Party Basket",
          },
        };
      }

      if (partyBasket.status === PartyBasketStatus.Disabled) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: "Party Basket is disabled",
          },
        };
      }

      if (partyBasket.creatorId !== context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `You do not own this Party Basket`,
          },
        };
      }

      let whitelisterPrivateKey: string;
      let claimsWithoutWhitelist: Claim_Firestore[];
      try {
        [whitelisterPrivateKey, claimsWithoutWhitelist] = await Promise.all([
          getWhitelisterPrivateKey(),
          getUnassignedClaims(payload.partyBasketId as PartyBasketID),
        ]);
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: "Server error",
          },
        };
      }

      const signer = new ethers.Wallet(whitelisterPrivateKey);
      const userWalletAddressMap: { [key: UserID]: Address } = {};
      const signatures: (string | null)[] = [];
      const partialErrors: (string | null)[] = [];
      for (const claim of claimsWithoutWhitelist) {
        if (!claim.claimerUserId) {
          continue;
        }
        try {
          if (!userWalletAddressMap[claim.claimerUserId]) {
            const user = await getUser(claim.claimerUserId);
            if (!user) {
              continue;
            }
            const wallets = await getUserWallets(user.id as UserID, 1);
            const wallet = wallets[0];
            if (!wallet) {
              continue;
            }
            userWalletAddressMap[claim.claimerUserId] =
              wallet.address as Address;
          }

          const walletAddress = userWalletAddressMap[claim.claimerUserId];

          if (!walletAddress) {
            continue;
          }

          // Generate a whitelist
          const nonce = generateNonceV1();

          const signature = await whitelistPartyBasketSignature(
            partyBasket.chainIdHex,
            partyBasket.address,
            walletAddress,
            whitelisterPrivateKey,
            nonce
          );

          const signatureDocument = await createWhitelistSignature({
            signature,
            signer: signer.address as Address,
            whitelistedAddress: walletAddress,
            partyBasketId: partyBasket.id as PartyBasketID,
            partyBasketAddress: partyBasket.address as Address,
            nonce,
          });

          // Update the claim document
          await attachWhitelistIdToClaim(
            claim.referralId as ReferralID,
            claim.id as ClaimID,
            signatureDocument.id as LootboxMintWhitelistID
          );
          signatures.push(
            `${claim.claimerUserId} - ${walletAddress} - ${signature}`
          );
        } catch (err) {
          partialErrors.push(
            (err as unknown as any)?.message || "Error occured"
          );
          console.error(err);
        }
      }

      return {
        signatures,
        errors: partialErrors,
      };
    },
    redeemSignature: async (
      _,
      { payload }: MutationRedeemSignatureArgs
    ): Promise<RedeemSignatureResponse> => {
      let address: Address;
      let nonce: string;

      try {
        const res = await validateSignature(
          payload?.message,
          payload?.signedMessage
        );

        address = res.address;
        nonce = res.nonce;
      } catch (err) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: err instanceof Error ? err.message : "",
          },
        };
      }

      try {
        const signatureDocument = await getWhitelistSignature(
          payload.signatureId as WhitelistSignatureID,
          payload.partyBasketId as PartyBasketID
        );

        if (!signatureDocument) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Signature not found`,
            },
          };
        }

        if (signatureDocument.whitelistedAddress !== address) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: `You do not own this bounty`,
            },
          };
        }

        if (signatureDocument.isRedeemed) {
          return {
            error: {
              code: StatusCode.InvalidOperation,
              message: `Bounty already reedeemed`,
            },
          };
        }

        const updatedSignature = await redeemSignature(
          payload.signatureId as WhitelistSignatureID,
          payload.partyBasketId as PartyBasketID
        );

        return {
          signature: updatedSignature,
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
    editPartyBasket: async (
      _,
      { payload }: MutationEditPartyBasketArgs,
      context: Context
    ): Promise<EditPartyBasketResponse> => {
      if (!context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `You are not logged in`,
          },
        };
      }

      const { id, ...args } = payload;

      if (Object.values(args).every((value) => value == undefined)) {
        return {
          error: {
            code: StatusCode.BadRequest,
            message: `No arguments provided`,
          },
        };
      }

      try {
        const partyBasket = await getPartyBasketById(
          payload.id as PartyBasketID
        );

        if (!partyBasket || !!partyBasket?.timestamps?.deletedAt) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `Party Basket not found`,
            },
          };
        }
        if (partyBasket.creatorId !== context.userId) {
          return {
            error: {
              code: StatusCode.Unauthorized,
              message: `You do not own this Party Basket`,
            },
          };
        }
        if (payload?.maxClaimsAllowed != undefined) {
          if (payload.maxClaimsAllowed <= 0) {
            return {
              error: {
                code: StatusCode.BadRequest,
                message: "Max Claims Allowed must be greater than 0",
              },
            };
          }
        }

        const updatedPartyBasket = await editPartyBasket({
          id: payload.id as PartyBasketID,
          name: payload.name,
          nftBountyValue: payload.nftBountyValue,
          joinCommunityUrl: payload.joinCommunityUrl,
          status: payload.status,
          maxClaimsAllowed: payload.maxClaimsAllowed,
        });

        return {
          partyBasket: updatedPartyBasket,
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

  EditPartyBasketResponse: {
    __resolveType: (obj: EditPartyBasketResponse) => {
      if ("partyBasket" in obj) {
        return "EditPartyBasketResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  GetPartyBasketResponse: {
    __resolveType: (obj: GetPartyBasketResponse) => {
      if ("partyBasket" in obj) {
        return "GetPartyBasketResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  CreatePartyBasketResponse: {
    __resolveType: (obj: CreatePartyBasketResponse) => {
      if ("partyBasket" in obj) {
        return "CreatePartyBasketResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  BulkWhitelistResponse: {
    __resolveType: (obj: BulkWhitelistResponse) => {
      if ("signatures" in obj) {
        return "BulkWhitelistResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  GetWhitelistSignaturesResponse: {
    __resolveType: (obj: GetWhitelistSignaturesResponse) => {
      if ("signatures" in obj) {
        return "GetWhitelistSignaturesResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  RedeemSignatureResponse: {
    __resolveType: (obj: RedeemSignatureResponse) => {
      if ("signature" in obj) {
        return "RedeemSignatureResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  WhitelistAllUnassignedClaimsResponse: {
    __resolveType: (obj: WhitelistAllUnassignedClaimsResponse) => {
      if ("signatures" in obj) {
        return "WhitelistAllUnassignedClaimsResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

const partyBasketResolverComposition = {
  "Mutation.createPartyBasket": [isAuthenticated()],
  "Mutation.bulkWhitelist": [isAuthenticated()],
  "Mutation.editPartyBasket": [isAuthenticated()],
  "Mutation.whitelistAllUnassignedClaims": [isAuthenticated()],
};

const resolvers = composeResolvers(
  PartyBasketResolvers,
  partyBasketResolverComposition
);

export default resolvers;
