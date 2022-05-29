import { StatusCode } from "../graphql/generated/types";
import { Context } from "../graphql/server";

export const isAuthenticated =
  () =>
  (next: any) =>
  async (root: any, args: any, context: Context, info: any) => {
    if (!context.userId) {
      return {
        error: {
          code: StatusCode.Unauthorized,
          message: "You are not authenticated!",
        },
      };
    }

    return next(root, args, context, info);
  };
