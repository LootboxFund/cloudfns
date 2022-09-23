import {
  GetLootboxByAddressResponse,
  Lootbox,
  QueryGetLootboxByAddressArgs,
  Resolvers,
  StatusCode,
  QueryLootboxFeedArgs,
  LootboxFeedResponse,
  MintWhitelistSignature,
} from "../../generated/types";
import {
  getLootboxByAddress,
  getUserMintSignaturesForLootbox,
  getUserPartyBasketsForLootbox,
  paginateLootboxFeedQuery,
} from "../../../api/firestore";
import { Address } from "@wormgraph/helpers";
import { Context } from "../../server";
import { LootboxID, UserID } from "../../../lib/types";
import {
  convertLootboxDBToGQL,
  convertMintWhitelistSignatureDBToGQL,
} from "../../../lib/lootbox";

const LootboxResolvers: Resolvers = {
  Query: {
    getLootboxByAddress: async (
      _,
      args: QueryGetLootboxByAddressArgs
    ): Promise<GetLootboxByAddressResponse> => {
      try {
        const lootboxDB = await getLootboxByAddress(args.address as Address);
        if (!lootboxDB) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Lootbox not found",
            },
          };
        }
        return {
          lootbox: convertLootboxDBToGQL(lootboxDB),
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
    lootboxFeed: async (
      _,
      { first, after }: QueryLootboxFeedArgs
    ): Promise<LootboxFeedResponse> => {
      const response = await paginateLootboxFeedQuery(
        first,
        after as LootboxID | null | undefined
      );
      return response;
    },
  },

  Mutation: {
    // getWhitelistSignatures: async (
    //   _,
    //   { payload }: MutationGetWhitelistSignaturesArgs
    // ): Promise<GetWhitelistSignaturesResponse> => {
    //   let address: Address;
    //   let nonce: string;
    //   let partyBasketAddress: Address;
    //   try {
    //     const res = await validatePartyBasketSignature(
    //       payload?.message,
    //       payload?.signedMessage
    //     );
    //     address = res.address;
    //     nonce = res.nonce;
    //     partyBasketAddress = res.partyBasket;
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    //   try {
    //     // TODO: add the nonce to the database to avoid reuse
    //     const whitelistSignatures = await getWhitelistSignaturesByAddress(
    //       address,
    //       partyBasketAddress
    //     );
    //     return {
    //       signatures: whitelistSignatures,
    //     };
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
    // bulkWhitelist: async (
    //   _,
    //   { payload }: MutationBulkWhitelistArgs,
    //   context: Context
    // ): Promise<BulkWhitelistResponse> => {
    //   if (!context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `Unauthorized`,
    //       },
    //     };
    //   }
    //   const { partyBasketAddress, whitelistAddresses } = payload;
    //   if (whitelistAddresses.length > 50) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: `Too many addresses. At free tier, you can only whitelist up to 50 addresses at a time.`,
    //       },
    //     };
    //   }
    //   if (!ethers.utils.isAddress(partyBasketAddress)) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: `Invalid party basket address.`,
    //       },
    //     };
    //   }
    //   let partyBasket: PartyBasket;
    //   try {
    //     partyBasket = (await getPartyBasketByAddress(
    //       partyBasketAddress as Address
    //     )) as PartyBasket;
    //     if (!partyBasket) {
    //       throw new Error("Party Basket Not Found");
    //     }
    //   } catch (err) {
    //     console.error(err);
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    //   if (partyBasket.status === PartyBasketStatus.Disabled) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: "Party Basket is disabled",
    //       },
    //     };
    //   }
    //   if (partyBasket.creatorId !== context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `You do not own this Party Basket`,
    //       },
    //     };
    //   }
    //   let whitelisterPrivateKey: string;
    //   try {
    //     whitelisterPrivateKey = await getWhitelisterPrivateKey();
    //   } catch (err) {
    //     console.error(err);
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    //   try {
    //     const signer = new ethers.Wallet(whitelisterPrivateKey);
    //     const res = await Promise.allSettled(
    //       whitelistAddresses.map(async (whitelistAddress: string) => {
    //         if (!ethers.utils.isAddress(whitelistAddress)) {
    //           throw new Error("Invalid Address");
    //         }
    //         const nonce = generateNonce();
    //         const signature = await whitelistPartyBasketSignature(
    //           partyBasket.chainIdHex,
    //           partyBasket.address,
    //           whitelistAddress,
    //           whitelisterPrivateKey,
    //           nonce
    //         );
    //         await createWhitelistSignature({
    //           signature,
    //           signer: signer.address as Address,
    //           whitelistedAddress: whitelistAddress as Address,
    //           partyBasketId: partyBasket.id as PartyBasketID,
    //           partyBasketAddress: partyBasketAddress as Address,
    //           nonce,
    //         });
    //         return signature;
    //       })
    //     );
    //     const signatures: (string | null)[] = [];
    //     const partialErrors: (string | null)[] = [];
    //     res.forEach((result) => {
    //       if (result.status === "fulfilled") {
    //         signatures.push(result.value);
    //         partialErrors.push(null);
    //       } else {
    //         partialErrors.push(result.reason);
    //         signatures.push(null);
    //       }
    //     });
    //     return {
    //       signatures,
    //       errors: partialErrors.every((err) => !!err) ? partialErrors : null,
    //     };
    //   } catch (err) {
    //     console.error(err);
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
    // whitelistAllUnassignedClaims: async (
    //   _,
    //   { payload }: MutationWhitelistAllUnassignedClaimsArgs,
    //   context: Context
    // ): Promise<WhitelistAllUnassignedClaimsResponse> => {
    //   if (!context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `Unauthorized`,
    //       },
    //     };
    //   }
    //   let partyBasket: PartyBasket;
    //   try {
    //     const _partyBasket = await getPartyBasketById(
    //       payload.partyBasketId as PartyBasketID
    //     );
    //     if (!_partyBasket) {
    //       throw new Error("Not found");
    //     }
    //     partyBasket = _partyBasket;
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: "Error fetching Party Basket",
    //       },
    //     };
    //   }
    //   if (partyBasket.status === PartyBasketStatus.Disabled) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: "Party Basket is disabled",
    //       },
    //     };
    //   }
    //   if (partyBasket.creatorId !== context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `You do not own this Party Basket`,
    //       },
    //     };
    //   }
    //   let whitelisterPrivateKey: string;
    //   let claimsWithoutWhitelist: Claim[];
    //   try {
    //     [whitelisterPrivateKey, claimsWithoutWhitelist] = await Promise.all([
    //       getWhitelisterPrivateKey(),
    //       getUnassignedClaims(payload.partyBasketId as PartyBasketID),
    //     ]);
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: "Server error",
    //       },
    //     };
    //   }
    //   const signer = new ethers.Wallet(whitelisterPrivateKey);
    //   const userWalletAddressMap: { [key: UserID]: Address } = {};
    //   const signatures: (string | null)[] = [];
    //   const partialErrors: (string | null)[] = [];
    //   for (const claim of claimsWithoutWhitelist) {
    //     if (!claim.claimerUserId) {
    //       continue;
    //     }
    //     try {
    //       if (!userWalletAddressMap[claim.claimerUserId]) {
    //         const user = await getUser(claim.claimerUserId);
    //         if (!user) {
    //           continue;
    //         }
    //         const wallets = await getUserWallets(user.id as UserID, 1);
    //         const wallet = wallets[0];
    //         if (!wallet) {
    //           continue;
    //         }
    //         userWalletAddressMap[claim.claimerUserId] = wallet.address;
    //       }
    //       const walletAddress = userWalletAddressMap[claim.claimerUserId];
    //       if (!walletAddress) {
    //         continue;
    //       }
    //       // Generate a whitelist
    //       const nonce = generateNonce();
    //       const signature = await whitelistPartyBasketSignature(
    //         partyBasket.chainIdHex,
    //         partyBasket.address,
    //         walletAddress,
    //         whitelisterPrivateKey,
    //         nonce
    //       );
    //       const signatureDocument = await createWhitelistSignature({
    //         signature,
    //         signer: signer.address as Address,
    //         whitelistedAddress: walletAddress,
    //         partyBasketId: partyBasket.id as PartyBasketID,
    //         partyBasketAddress: partyBasket.address as Address,
    //         nonce,
    //       });
    //       // Update the claim document
    //       await attachWhitelistIdToClaim(
    //         claim.referralId as ReferralID,
    //         claim.id as ClaimID,
    //         signatureDocument.id as WhitelistSignatureID
    //       );
    //       signatures.push(
    //         `${claim.claimerUserId} - ${walletAddress} - ${signature}`
    //       );
    //     } catch (err) {
    //       partialErrors.push(
    //         (err as unknown as any)?.message || "Error occured"
    //       );
    //       console.error(err);
    //     }
    //   }
    //   return {
    //     signatures,
    //     errors: partialErrors,
    //   };
    // },
    // redeemSignature: async (
    //   _,
    //   { payload }: MutationRedeemSignatureArgs
    // ): Promise<RedeemSignatureResponse> => {
    //   let address: Address;
    //   let nonce: string;
    //   try {
    //     const res = await validateSignature(
    //       payload?.message,
    //       payload?.signedMessage
    //     );
    //     address = res.address;
    //     nonce = res.nonce;
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    //   try {
    //     const signatureDocument = await getWhitelistSignature(
    //       payload.signatureId as WhitelistSignatureID,
    //       payload.partyBasketId as PartyBasketID
    //     );
    //     if (!signatureDocument) {
    //       return {
    //         error: {
    //           code: StatusCode.NotFound,
    //           message: `Signature not found`,
    //         },
    //       };
    //     }
    //     if (signatureDocument.whitelistedAddress !== address) {
    //       return {
    //         error: {
    //           code: StatusCode.Unauthorized,
    //           message: `You do not own this bounty`,
    //         },
    //       };
    //     }
    //     if (signatureDocument.isRedeemed) {
    //       return {
    //         error: {
    //           code: StatusCode.InvalidOperation,
    //           message: `Bounty already reedeemed`,
    //         },
    //       };
    //     }
    //     const updatedSignature = await redeemSignature(
    //       payload.signatureId as WhitelistSignatureID,
    //       payload.partyBasketId as PartyBasketID
    //     );
    //     return {
    //       signature: updatedSignature,
    //     };
    //   } catch (err) {
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
    // editPartyBasket: async (
    //   _,
    //   { payload }: MutationEditPartyBasketArgs,
    //   context: Context
    // ): Promise<EditPartyBasketResponse> => {
    //   if (!context.userId) {
    //     return {
    //       error: {
    //         code: StatusCode.Unauthorized,
    //         message: `You are not logged in`,
    //       },
    //     };
    //   }
    //   const { id, ...args } = payload;
    //   if (Object.values(args).every((value) => value == undefined)) {
    //     return {
    //       error: {
    //         code: StatusCode.BadRequest,
    //         message: `No arguments provided`,
    //       },
    //     };
    //   }
    //   try {
    //     const partyBasket = await getPartyBasketById(
    //       payload.id as PartyBasketID
    //     );
    //     if (!partyBasket || !!partyBasket?.timestamps?.deletedAt) {
    //       return {
    //         error: {
    //           code: StatusCode.NotFound,
    //           message: `Party Basket not found`,
    //         },
    //       };
    //     }
    //     if (partyBasket.creatorId !== context.userId) {
    //       return {
    //         error: {
    //           code: StatusCode.Unauthorized,
    //           message: `You do not own this Party Basket`,
    //         },
    //       };
    //     }
    //     if (payload?.maxClaimsAllowed != undefined) {
    //       if (payload.maxClaimsAllowed <= 0) {
    //         return {
    //           error: {
    //             code: StatusCode.BadRequest,
    //             message: "Max Claims Allowed must be greater than 0",
    //           },
    //         };
    //       }
    //     }
    //     const updatedPartyBasket = await editPartyBasket({
    //       id: payload.id as PartyBasketID,
    //       name: payload.name,
    //       nftBountyValue: payload.nftBountyValue,
    //       joinCommunityUrl: payload.joinCommunityUrl,
    //       status: payload.status,
    //       maxClaimsAllowed: payload.maxClaimsAllowed,
    //     });
    //     return {
    //       partyBasket: updatedPartyBasket,
    //     };
    //   } catch (err) {
    //     console.error(err);
    //     return {
    //       error: {
    //         code: StatusCode.ServerError,
    //         message: err instanceof Error ? err.message : "",
    //       },
    //     };
    //   }
    // },
  },

  Lootbox: {
    mintWhitelistSignatures: async (
      lootbox: Lootbox,
      _,
      context: Context
    ): Promise<MintWhitelistSignature[]> => {
      if (!context.userId) {
        return [];
      }

      try {
        const mintSignatures = await getUserMintSignaturesForLootbox(
          lootbox.id as LootboxID,
          context.userId
        );

        return mintSignatures.map(convertMintWhitelistSignatureDBToGQL);
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    /** @deprecated will be removed and replaced with cosmic lootbox */
    partyBaskets: async (lootbox: Lootbox, _, context: Context) => {
      if (!context.userId) {
        return [];
      }
      try {
        const baskets = await getUserPartyBasketsForLootbox(
          context.userId as unknown as UserID,
          lootbox.address as Address
        );
        return baskets;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
  },

  LootboxFeedResponse: {
    __resolveType: (obj: LootboxFeedResponse) => {
      if ("edges" in obj) {
        return "LootboxFeedResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },

  GetLootboxByAddressResponse: {
    __resolveType: (obj: GetLootboxByAddressResponse) => {
      if ("lootbox" in obj) {
        return "LootboxResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

export default LootboxResolvers;
