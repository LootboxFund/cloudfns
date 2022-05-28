import {
  QueryGetUserArgs,
  StatusCode,
  GetUserResponse,
} from "../../generated/types";
import { getUser, getUserWallets } from "../../../api/firestore";

const UserResolvers = {
  Query: {
    getUser: async (_, args: QueryGetUserArgs) => {
      try {
        const user = await getUser(args.id);
        if (!user) {
          return {
            error: {
              code: StatusCode.NotFound,
              message: "User not found",
            },
          };
        }
        return {
          user,
        };
      } catch (err) {
        return {
          error: {
            code: StatusCode.ServerError,
            message: err.message,
          },
        };
      }
    },
  },
  User: {
    wallets: async (user) => {
      return await getUserWallets(user.id);
    },
  },

  GetUserResponse: {
    __resolveType: (obj: GetUserResponse) => {
      if ("user" in obj) {
        return "UserResponseSuccess";
      }
      if ("error" in obj) {
        return "ResponseError";
      }

      return null;
    },
  },
};

export default UserResolvers;
