const { ApolloServer } = require("apollo-server-express");
const { resolvers, typeDefs } = require("./resolvers/resolvers");
const express = require("express");
const { authenticate } = require("./passport.js");
const passport = require("passport");
const app = express();
// app.use(passport.initialize());
// passport.use(authenticate);
const server = new ApolloServer({ typeDefs, resolvers });
async function startApolloServer() {
  await server.start();

  server.applyMiddleware({ app });
  app.get("/protected", authenticate, (req, res) => {
    res.send("Protected route accessed");
  });

  app.listen({ port: 4000 }, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  });
}
startApolloServer().catch((error) => {
  console.error("Error starting Apollo Server:", error);
});
