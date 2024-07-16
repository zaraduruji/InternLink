import React, { useState, useContext, useEffect } from 'react';
import { gql, useSubscription, useMutation } from '@apollo/client';
import { UserContext } from '../UserContext';
import './Friends.css';
import Sidebar from '../Sidebar/Sidebar';
import SearchModal from '../SearchModal/SearchModal';

const FRIEND_REQUEST_RECEIVED_SUBSCRIPTION = gql`
  subscription FriendRequestReceived($userId: Int!) {
    friendRequestReceived(userId: $userId) {
      id
      content
      createdAt
      friendRequestId
    }
  }
`;

const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
  mutation AcceptFriendRequest($requestId: Int!) {
    acceptFriendRequest(requestId: $requestId) {
      id
      status
    }
  }
`;

const DECLINE_FRIEND_REQUEST_MUTATION = gql`
  mutation DeclineFriendRequest($requestId: Int!) {
    declineFriendRequest(requestId: $requestId) {
      id
      status
    }
  }
`;

const Friends = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('growConnections');
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const { data, loading, error } = useSubscription(FRIEND_REQUEST_RECEIVED_SUBSCRIPTION, {
    variables: { userId: user?.id },
  });

  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND_REQUEST_MUTATION);
  const [declineFriendRequest] = useMutation(DECLINE_FRIEND_REQUEST_MUTATION);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    if (data) {
      setNotifications([...notifications, data.friendRequestReceived]);
    }
  }, [data]);

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/friend-requests/${user.id}`);
      const data = await response.json();
      setFriendRequests(data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest({ variables: { requestId } });
      fetchFriendRequests(); // Refresh the friend requests list
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await declineFriendRequest({ variables: { requestId } });
      fetchFriendRequests(); // Refresh the friend requests list
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  return (
    <div className="friends-page">
      <Sidebar />
      <SearchModal />
      <div className="friends-content">
        <div className="friends-tabs">
          <div className={`tab ${activeTab === 'growConnections' ? 'active' : ''}`} onClick={() => handleTabClick('growConnections')}>
            Grow Connections
          </div>
          <div className={`tab ${activeTab === 'suggestedConnections' ? 'active' : ''}`} onClick={() => handleTabClick('suggestedConnections')}>
            Suggested Connections
          </div>
        </div>
        <div className="friends-details">
          {activeTab === 'growConnections' ? (
            <div className="grow-connections-section">
              <h3>Friend Requests</h3>
              <ul>
                {friendRequests.map((request) => (
                  <li key={request.id}>
                    {request.requester.firstName} {request.requester.lastName}
                    <button onClick={() => handleAcceptRequest(request.id)}>✔</button>
                    <button onClick={() => handleDeclineRequest(request.id)}>✖</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="suggested-connections-section">
              <h3>Suggested Connections</h3>
              {/* Add your code for handling suggested connections here */}
            </div>
          )}
        </div>
        <div className="notifications-section">
          <h3>Notifications</h3>
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id}>
                {notification.content} - {new Date(notification.createdAt).toLocaleString()}
                <button onClick={() => handleAcceptRequest(notification.friendRequestId)}>Accept</button>
                <button onClick={() => handleDeclineRequest(notification.friendRequestId)}>Decline</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Friends;
