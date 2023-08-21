const { ApolloServer } = require('apollo-server');

const {resolvers,typeDefs}=require('./resolvers/resolvers')

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});