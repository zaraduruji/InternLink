import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import React from 'react';

// Create an HTTP link to connect to the GraphQL endpoint
const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql',
});

// Create a WebSocket link to connect to the GraphQL endpoint for subscriptions
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/graphql',
  options: {
    reconnect: true,
  },
});

// Use split to send data to each link depending on the operation kind
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Create the Apollo Client with the split link and in-memory cache
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export { ApolloProvider, client };
