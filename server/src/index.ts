require("dotenv").config();

import server from "./graphql/server";

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  GraphQL server is ready at ${url}`);
});
