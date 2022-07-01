import {
  Resolvers,
  QueryGetWhitelistSignaturesArgs,
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
} from "../../generated/types";
import { Context } from "../../server";
import {
  getPartyBasketByAddress,
  createWhitelistSignature,
  createPartyBasket,
  getWhitelistSignature,
  getWhitelistSignaturesByAddress,
  redeemSignature,
  getPartyBasketById,
  getLootboxByAddress,
} from "../../../api/firestore";
import { getSecret } from "../../../api/secrets";
import { manifest } from "../../../manifest";
import {
  validateSignature,
  whitelistPartyBasketSignature,
} from "../../../api/ethers";
import { Address } from "@wormgraph/helpers";
import { generateNonce } from "../../../lib/whitelist";
import { ethers } from "ethers";
import { PartyBasketID, WhitelistSignatureID } from "../../../lib/types";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "../../../lib/permissionGuard";
import { convertLootboxToSnapshot } from "../../../lib/lootbox";

const PartyBasketResolvers: Resolvers = {
  Query: {
    getWhitelistSignatures: async (
      _,
      args: QueryGetWhitelistSignaturesArgs
    ): Promise<GetWhitelistSignaturesResponse> => {
      let address: Address;
      let nonce: string;

      try {
        const res = await validateSignature(args?.message, args?.signedMessage);

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
        const partyBasket = await getPartyBasketByAddress(address as Address);
        if (!partyBasket) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: `PartyBasket not found`,
            },
          };
        }
        const whitelistSignature = await getWhitelistSignaturesByAddress(
          address
        );
        return {
          signatures: whitelistSignature,
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

      try {
        const partyBasket = await createPartyBasket({
          address: payload.address as Address,
          factory: payload.factory as Address,
          name: payload.name,
          chainIdHex: payload.chainIdHex,
          creatorId: context.userId,
          lootboxAddress: payload.lootboxAddress as Address,
          creatorAddress: payload.creatorAddress as Address,
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

      if (partyBasket.creatorId !== context.userId) {
        return {
          error: {
            code: StatusCode.Unauthorized,
            message: `You do not own this Party Basket`,
          },
        };
      }

      const secretConfig = manifest.secretManager.secrets.find((secret) => {
        secret.name === "PARTY_BASKET_WHITELISTER_PRIVATE_KEY";
      });

      if (!secretConfig) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: `Secret Not Found`,
          },
        };
      }

      let whitelisterPrivateKey: string;
      try {
        whitelisterPrivateKey = await getSecret(
          secretConfig.name,
          secretConfig.version
        );
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
            const nonce = generateNonce();

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

        if (signatureDocument.signer !== address) {
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
      if ("signature" in obj) {
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
};

const partyBasketResolverComposition = {
  "Mutation.createPartyBasket": [isAuthenticated()],
  "Mutation.bulkWhitelist": [isAuthenticated()],
};

const resolvers = composeResolvers(
  PartyBasketResolvers,
  partyBasketResolverComposition
);

export default resolvers;
