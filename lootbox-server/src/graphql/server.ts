import { ApolloServer } from "apollo-server";
import identityProvider from "../api/identityProvider";
import { UserIdpID } from "../lib/types";
import { schema } from "./schema";

export interface Context {
  userId: UserIdpID | null;
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  introspection: true,
  cors: {
    // TODO replace with prod addresses
    origin: "*",
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