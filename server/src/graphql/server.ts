import { ApolloServer } from "apollo-server";
import { schema } from "./schema";

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  introspection: true,
  //   context: async ({req}) => {}
});

export default server;
