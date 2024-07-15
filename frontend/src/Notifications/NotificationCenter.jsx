import React from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import gql from 'graphql-tag';

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      message
      read
      deleted
      createdAt
    }
  }
`;

const NEW_NOTIFICATION = gql`
  subscription OnNewNotification {
    newNotification {
      id
      message
      read
      deleted
      createdAt
    }
  }
`;

const MARK_AS_READ = gql`
  mutation MarkAsRead($id: Int!) {
    markAsRead(id: $id) {
      id
      read
    }
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: Int!) {
    deleteNotification(id: $id) {
      id
      deleted
    }
  }
`;

const NotificationCenter = () => {
  const { data, loading, error } = useQuery(GET_NOTIFICATIONS);
  const [markAsRead] = useMutation(MARK_AS_READ);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);
  useSubscription(NEW_NOTIFICATION, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      const newNotification = subscriptionData.data.newNotification;
      client.cache.modify({
        fields: {
          notifications(existingNotifications = []) {
            const newNotificationRef = client.cache.writeFragment({
              data: newNotification,
              fragment: gql`
                fragment NewNotification on Notification {
                  id
                  message
                  read
                  deleted
                  createdAt
                }
              `
            });
            return [...existingNotifications, newNotificationRef];
          }
        }
      });
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {data.notifications.map(notification => (
          <li key={notification.id}>
            {notification.message}
            <button onClick={() => markAsRead({ variables: { id: notification.id } })}>
              Mark as Read
            </button>
            <button onClick={() => deleteNotification({ variables: { id: notification.id } })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationCenter;
