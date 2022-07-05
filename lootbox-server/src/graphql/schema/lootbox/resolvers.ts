import {
  GetLootboxByAddressResponse,
  Lootbox,
  QueryGetLootboxByAddressArgs,
  Resolvers,
  StatusCode,
} from "../../generated/types";
import {
  getLootboxByAddress,
  getUserPartyBasketsForLootbox,
} from "../../../api/firestore";
import { Address } from "@wormgraph/helpers";
import { Context } from "../../server";
import { UserID } from "../../../lib/types";

const LootboxResolvers: Resolvers = {
  Query: {
    getLootboxByAddress: async (_, args: QueryGetLootboxByAddressArgs) => {
      try {
        const lootbox = await getLootboxByAddress(args.address as Address);
        if (!lootbox) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "Lootbox not found",
            },
          };
        }
        return {
          lootbox,
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

  Lootbox: {
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
