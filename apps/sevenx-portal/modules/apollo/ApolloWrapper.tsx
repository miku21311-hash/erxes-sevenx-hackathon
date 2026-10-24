'use client';

import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import type { ReactNode } from 'react';
import { readToken } from '@/modules/auth/session';
import { CP_TOKEN, GRAPHQL_URL } from './env';

function makeClient() {
  const authLink = new SetContextLink(({ headers }) => {
    const token = readToken();

    return {
      headers: {
        ...headers,
        ...(CP_TOKEN ? { 'x-app-token': CP_TOKEN } : {}),
        ...(token ? { 'client-auth-token': token } : {}),
      },
    };
  });

  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    // the login mutation sets the `client-auth-token` cookie; send it back
    fetchOptions: { credentials: 'include' },
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        SevenxAttendance: { keyFields: false },
        SevenxSession: { keyFields: false },
        SevenxAttendanceSummary: { keyFields: false },
      },
    }),
    link: authLink.concat(httpLink),
  });
}

export function ApolloWrapper({ children }: { children: ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
