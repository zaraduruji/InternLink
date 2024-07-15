import { createYoga, createSchema } from 'graphql-yoga';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';

const prisma = new PrismaClient();
const pubsub = new PubSub();

const typeDefs = `
  type Notification {
    id: Int!
    message: String!
    read: Boolean!
    deleted: Boolean!
    createdAt: String!
  }

  type Query {
    notifications: [Notification!]!
  }

  type Mutation {
    createNotification(message: String!): Notification!
    markAsRead(id: Int!): Notification!
    deleteNotification(id: Int!): Notification!
  }

  type Subscription {
    newNotification: Notification!
  }
`;

const resolvers = {
  Query: {
    notifications: () => prisma.notification.findMany(),
  },
  Mutation: {
    createNotification: async (_, { message }) => {
      const newNotification = await prisma.notification.create({ data: { message } });
      pubsub.publish('NEW_NOTIFICATION', { newNotification });
      return newNotification;
    },
    markAsRead: (_, { id }) => {
      return prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    },
    deleteNotification: (_, { id }) => {
      return prisma.notification.update({
        where: { id },
        data: { deleted: true },
      });
    },
  },
  Subscription: {
    newNotification: {
      subscribe: () => pubsub.asyncIterator('NEW_NOTIFICATION'),
    },
  },
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  context: { prisma, pubsub },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
