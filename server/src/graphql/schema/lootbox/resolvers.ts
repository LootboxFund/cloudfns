import {
  GetLootboxByAddressResponse,
  QueryGetLootboxByAddressArgs,
  Resolvers,
  StatusCode,
} from "../../generated/types";
import { getLootboxByAddress } from "../../../api/firestore";

const LootboxResolvers: Resolvers = {
  Query: {
    getLootboxByAddress: async (_, args: QueryGetLootboxByAddressArgs) => {
      try {
        const lootbox = await getLootboxByAddress(args.address);
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
        return {
          error: {
            code: StatusCode.ServerError,
            message: err instanceof Error ? err.message : "",
          },
        };
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
