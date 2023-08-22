
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { gql } = require('apollo-server');
const { login } = require('../passport.js')


const resolvers = {
  Mutation: {
    register: async (_, { name, email, password }) => {
      try {
        // Validate input data
        if (!name || !email || !password) {
          throw new Error('Name, email, and password are required.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });

        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

        return { token, user }
      } catch (error) {
        return { token: null, user: null, error: error.message };
      }
    },
    login: async (_, { email, password }) => {
      try {
        const { token, user } = await login(email, password);
        return { token, user };
      } catch (error) {
        return { token: null, user: null, error: error.message };
      }
    },
  },
};

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }

  type Query {
    hello: String
  }
`;

module.exports = { resolvers, typeDefs }