import React, { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { UserContext } from '../UserContext';

const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: Int!) {
    getNotifications(userId: $userId) {
      id
      type
      content
      isRead
      createdAt
      friendRequestId
    }
  }
`;

const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: Int!) {
    markNotificationAsRead(notificationId: $notificationId) {
      id
      isRead
    }
  }
`;

const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($requestId: Int!) {
    acceptFriendRequest(requestId: $requestId) {
      id
      status
    }
  }
`;

const DECLINE_FRIEND_REQUEST = gql`
  mutation DeclineFriendRequest($requestId: Int!) {
    declineFriendRequest(requestId: $requestId) {
      id
      status
    }
  }
`;

function Notifications() {
  const { user, updateUser } = useContext(UserContext);
  const { loading, error, data, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId: user.id },
  });
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST);
  const [declineFriendRequest] = useMutation(DECLINE_FRIEND_REQUEST);
  const [processedRequests, setProcessedRequests] = useState(new Set());

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ variables: { notificationId } });
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const refetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`);
      const data = await response.json();
      updateUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleAcceptFriendRequest = async (notificationId, friendRequestId) => {
    if (processedRequests.has(friendRequestId)) return;
    try {
      await acceptFriendRequest({ variables: { requestId: friendRequestId } });
      setProcessedRequests((prev) => new Set(prev).add(friendRequestId));
      await handleMarkAsRead(notificationId);
      refetch();
      refetchUser();  // Refetch user data to update connection count
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineFriendRequest = async (notificationId, friendRequestId) => {
    if (processedRequests.has(friendRequestId)) return;
    try {
      await declineFriendRequest({ variables: { requestId: friendRequestId } });
      setProcessedRequests((prev) => new Set(prev).add(friendRequestId));
      await handleMarkAsRead(notificationId);
      refetch();
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>Error loading notifications: {error.message}</p>;

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {data.getNotifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        data.getNotifications.map((notification) => (
          <div key={notification.id} className={`notification ${notification.isRead ? 'read' : 'unread'}`}>
            <p className="notification-content">{notification.content}</p>
            {notification.type === 'FRIEND_REQUEST' && !notification.isRead && !processedRequests.has(notification.friendRequestId) && (
              <div className="friend-request-actions">
                <button onClick={() => handleAcceptFriendRequest(notification.id, notification.friendRequestId)}>Accept</button>
                <button onClick={() => handleDeclineFriendRequest(notification.id, notification.friendRequestId)}>Decline</button>
              </div>
            )}
            {!notification.isRead && (
              <button onClick={() => handleMarkAsRead(notification.id)}>Mark as Read</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;
