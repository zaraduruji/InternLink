import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
let notificationIdCounter = 1;
let notifications = [];

const resolvers = {
  Query: {
    userNotifications: (_, { userId }) => {
      return notifications.filter(notification => notification.userId === userId);
    },
    friendRequests: async (_, { userId }, { prisma }) => {
      return await prisma.friendRequest.findMany({
        where: {
          recipientId: userId,
          status: 'PENDING',
        },
        include: {
          requester: true,
        },
      });
    },
  },
  Mutation: {
    createFriendRequest: async (_, { userId, targetUserId }, { prisma }) => {
      const friendRequest = await prisma.friendRequest.create({
        data: {
          requesterId: parseInt(userId, 10),
          recipientId: parseInt(targetUserId, 10),
          status: 'PENDING',
        },
      });

      const notification = {
        id: notificationIdCounter++,
        friendRequestId: friendRequest.id,
        userId: targetUserId,
        content: `You have received a friend request from user ${userId}`,
        createdAt: new Date().toISOString(),
        read: false,
        deleted: false,
        type: 'FRIEND_REQUEST',
      };

      notifications.push(notification);
      pubsub.publish('FRIEND_REQUEST_RECEIVED', { friendRequestReceived: notification });

      return friendRequest;
    },
    acceptFriendRequest: async (_, { requestId }, { prisma }) => {
      const friendRequest = await prisma.friendRequest.update({
        where: { id: parseInt(requestId, 10) },
        data: { status: 'ACCEPTED' },
      });
      await prisma.connection.create({
        data: {
          userId: friendRequest.requesterId,
          friendId: friendRequest.recipientId,
          status: 'CONNECTED',
        },
      });

      const notification = {
        id: notificationIdCounter++,
        userId: friendRequest.requesterId,
        friendRequestId: friendRequest.id,
        content: `Your friend request has been accepted by user ${friendRequest.recipientId}`,
        createdAt: new Date().toISOString(),
        read: false,
        deleted: false,
        type: 'FRIEND_REQUEST_ANSWERED',
      };

      notifications.push(notification);
      pubsub.publish('FRIEND_REQUEST_ANSWERED', { friendRequestAnswered: notification });

      return friendRequest;
    },
    declineFriendRequest: async (_, { requestId }, { prisma }) => {
      const friendRequest = await prisma.friendRequest.update({
        where: { id: parseInt(requestId, 10) },
        data: { status: 'DECLINED' },
      });

      const notification = {
        id: notificationIdCounter++,
        userId: friendRequest.requesterId,
        friendRequestId: friendRequest.id,
        content: `Your friend request has been declined by user ${friendRequest.recipientId}`,
        createdAt: new Date().toISOString(),
        read: false,
        deleted: false,
        type: 'FRIEND_REQUEST_ANSWERED',
      };

      notifications.push(notification);
      pubsub.publish('FRIEND_REQUEST_ANSWERED', { friendRequestAnswered: notification });

      return friendRequest;
    },
  },
  Subscription: {
    friendRequestReceived: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator('FRIEND_REQUEST_RECEIVED');
      },
    },
    friendRequestAnswered: {
      subscribe: (_, { userId }) => {
        return pubsub.asyncIterator('FRIEND_REQUEST_ANSWERED');
      },
    },
  },
};

export default resolvers;
