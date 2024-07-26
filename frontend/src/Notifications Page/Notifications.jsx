import React, { useContext, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { UserContext } from '../UserContext';
import StoryViewer from '../StoryDisplays/StoryViewer';
import './Notifications.css';

const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: Int!) {
    getNotifications(userId: $userId) {
      id
      type
      content
      isRead
      createdAt
      friendRequestId
      storyId
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

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: Int!) {
    deleteNotification(notificationId: $notificationId)
  }
`;

function Notifications({ onClose }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage', error);
      return null;
    }
  });

  const updateUser = (newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const [activeTab, setActiveTab] = useState('unread');
  const [viewingStories, setViewingStories] = useState(null);
  const { loading, error, data, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId: user.id },
  });
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST);
  const [declineFriendRequest] = useMutation(DECLINE_FRIEND_REQUEST);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);
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
      refetchUser();
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

  const handleViewStory = async (notificationId, storyId) => {
    try {
      await handleMarkAsRead(notificationId);
      const response = await fetch(`http://localhost:3000/api/stories/${storyId}`);
      if (response.ok) {
        const story = await response.json();
        setViewingStories([{
          id: story.user.id,
          firstName: story.user.firstName,
          lastName: story.user.lastName,
          profilePicture: story.user.profilePicture,
          stories: [story]
        }]);
      } else {
        console.error('Failed to fetch story');
      }
    } catch (error) {
      console.error('Error viewing story:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification({ variables: { notificationId } });
      refetch();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>Error loading notifications: {error.message}</p>;

  return (
    <div className="notifications-modal">
      <div className="notifications-content">
        <h2>Notifications</h2>
        <button className="close-buttonn" onClick={onClose}>×</button>

        <div className="notifications-tabs">
          <div
            className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread
          </div>
          <div
            className={`tab ${activeTab === 'read' ? 'active' : ''}`}
            onClick={() => setActiveTab('read')}
          >
            Read
          </div>
        </div>

        {activeTab === 'unread' && (
          <div className="notifications-section">
            {data.getNotifications.filter(n => !n.isRead).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onAccept={handleAcceptFriendRequest}
                onDecline={handleDeclineFriendRequest}
                onViewStory={handleViewStory}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>
        )}

        {activeTab === 'read' && (
          <div className="notifications-section">
            {data.getNotifications.filter(n => n.isRead).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isRead={true}
                onViewStory={handleViewStory}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>
        )}
      </div>
      {viewingStories && (
        <StoryViewer
          stories={viewingStories}
          onClose={() => setViewingStories(null)}
          currentUser={user}
          onDeleteStory={() => {}}
        />
      )}
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead, onAccept, onDecline, onViewStory, onDelete, isRead }) {
  return (
    <div className={`notification ${isRead ? 'read' : 'unread'}`}>
      <p className="notification-content">{notification.content}</p>
      <div className="notification-actions">
        {!isRead && (
          <>
            <div className="read-indicator" onClick={() => onMarkAsRead(notification.id)}></div>
            {notification.type === 'FRIEND_REQUEST' && (
              <div className="friend-request-actions">
                <button className="accept-button" onClick={() => onAccept(notification.id, notification.friendRequestId)}>Accept</button>
                <button className="decline-button" onClick={() => onDecline(notification.id, notification.friendRequestId)}>Decline</button>
              </div>
            )}
            {notification.type === 'STORY_UPLOAD' && (
              <button className="view-button" onClick={() => onViewStory(notification.id, notification.storyId)}>View Story</button>
            )}
          </>
        )}
        <button className="delete-button" onClick={() => onDelete(notification.id)}>Delete 🗑️</button>
      </div>
    </div>
  );
}

export default Notifications;
