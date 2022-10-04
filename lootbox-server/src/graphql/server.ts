import { ApolloServer } from "apollo-server";
import identityProvider from "../api/identityProvider";
import { UserIdpID } from "@wormgraph/helpers";
import { schema } from "./schema";

export interface Context {
  userId: UserIdpID | null;
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  introspection: process.env.NODE_ENV === "dev",
  cors: {
    origin:
      process.env.NODE_ENV === "dev"
        ? "*"
        : process.env.NODE_ENV === "staging"
        ? [
            "https://lootbox.fund",
            "https://www.lootbox.fund",
            "https://staging.go.lootbox.fund", // Viral onboarding
            "https://staging.advertiser.lootbox.fund",
            "https://staging.affiliate.lootbox.fund",
            "https://staging.marketing.lootbox.fund",
            "https://staging.promoter.lootbox.fund",
          ]
        : [
            "https://lootbox.fund",
            "https://www.lootbox.fund",
            "https://go.lootbox.fund", // Viral onboarding
          ],
  },
  context: async ({ req }): Promise<Context> => {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        return { userId: null };
      }

      const token = authorization.split(" ")[1];

      if (!token) {
        return { userId: null };
      }

      const idpId = await identityProvider.verifyIDToken(token);

      if (!idpId) {
        return { userId: null };
      } else {
        return { userId: idpId };
      }
    } catch (_err) {
      return { userId: null };
    }
  },
});

export default server;
