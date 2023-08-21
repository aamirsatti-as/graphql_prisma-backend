
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {  gql } = require('apollo-server');


const resolvers = {
    Mutation: {
      register: async (_, { name, email, password }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });
  
        const token = jwt.sign({ userId: user.id }, 'mysecretkey');
  
        return { token, user };
      },
      login: async (_, { email, password }) => {
        const user = await prisma.user.findUnique({ where: { email } });
  
        if (!user) {
          throw new Error('Invalid login credentials');
        }
  
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (!passwordMatch) {
          throw new Error('Invalid login credentials');
        }
  
        const token = jwt.sign({ userId: user.id }, 'mysecretkey');
  
        return { token, user };
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

  module.exports ={resolvers,typeDefs}