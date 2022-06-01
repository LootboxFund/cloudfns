import { ApolloServer } from "apollo-server";
import identityProvider from "../api/identityProvider";
import { UserIdpID } from "../lib/types";
import { schema } from "./schema";

export interface Context {
  userId: UserIdpID | null;
}

const decodeToken = (token: string) => {
  try {
    const jsonToken = JSON.parse(Buffer.from(token, "base64").toString("utf8"));

    return JSON.parse(jsonToken);
  } catch (error) {
    // TODO replace later with logger
    return null;
  }
};

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
      const decodedToken = decodeToken(token);

      if (
        !decodedToken ||
        !decodedToken.idToken ||
        !decodedToken.refreshToken
      ) {
        return { userId: null };
      }

      const idpId = await identityProvider.verifyIDToken(
        decodedToken.idToken,
        decodedToken.refreshToken
      );

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
