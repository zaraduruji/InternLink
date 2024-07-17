import React, { useContext } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { UserContext } from '../UserContext';


// GraphQL queries and mutations
const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: Int!) {
    getNotifications(userId: $userId) {
      id
      type
      content
      isRead
      createdAt
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
  const { user } = useContext(UserContext);
  const { loading, error, data, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId: user.id },
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST);
  const [declineFriendRequest] = useMutation(DECLINE_FRIEND_REQUEST);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ variables: { notificationId } });
      refetch(); // Refetch notifications to update the UI
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await acceptFriendRequest({ variables: { requestId } });
      refetch(); // Refetch notifications to update the UI
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    try {
      await declineFriendRequest({ variables: { requestId } });
      refetch(); // Refetch notifications to update the UI
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
            <p className="notification-type">Type: {notification.type}</p>
            <p className="notification-date">
              Date: {new Date(notification.createdAt).toLocaleDateString()}
            </p>
            {notification.type === 'FRIEND_REQUEST' && !notification.isRead && (
              <div className="friend-request-actions">
                <button onClick={() => handleAcceptFriendRequest(notification.id)}>Accept</button>
                <button onClick={() => handleDeclineFriendRequest(notification.id)}>Decline</button>
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
