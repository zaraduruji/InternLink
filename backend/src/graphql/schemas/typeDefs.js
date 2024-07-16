import { gql } from 'graphql-tag';

const typeDefs = gql`
  type Query {
    userNotifications(userId: Int!): [FriendRequestNotification!]
    friendRequests(userId: Int!): [FriendRequest!]
  }

  type Mutation {
    createFriendRequest(userId: Int!, targetUserId: Int!): FriendRequest
    acceptFriendRequest(requestId: Int!): FriendRequest
    declineFriendRequest(requestId: Int!): FriendRequest
  }

  type Subscription {
    friendRequestReceived(userId: Int!): FriendRequestNotification!
    friendRequestAnswered(notificationId: Int!, userId: Int!): FriendRequestNotification!
  }

  type FriendRequestNotification {
    id: Int!
    friendRequestId: Int!
    userId: Int!
    content: String!
    createdAt: String!
    read: Boolean!
    deleted: Boolean!
    type: String!
  }

  type FriendRequest {
    id: Int!
    requesterId: Int!
    recipientId: Int!
    status: String!
    requester: User
  }

  type User {
    id: Int!
    firstName: String!
    lastName: String!
    friendRequests: [FriendRequest!]
    notifications: [FriendRequestNotification!]
  }
`;

export default typeDefs;
