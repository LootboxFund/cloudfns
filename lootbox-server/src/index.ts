require("dotenv").config();

import server from "./graphql/server";

const port = process.env.PORT || 8080;

// The `listen` method launches a web server.
server.listen(port).then(({ url }) => {
  console.log(
    `🚀  GraphQL server is ready at ${url} on environment "${process.env.NODE_ENV}"`
  );
});
