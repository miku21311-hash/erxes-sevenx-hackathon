import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { CP_TOKEN, GRAPHQL_URL } from './env';

/** Server-side Apollo client (RSC). The portal renders data on the client, this
 * is kept for server components that need public queries such as invite checks. */
export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const authLink = new SetContextLink(({ headers }) => ({
    headers: {
      ...headers,
      ...(CP_TOKEN ? { 'x-app-token': CP_TOKEN } : {}),
    },
  }));

  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    fetchOptions: { credentials: 'include' },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});
