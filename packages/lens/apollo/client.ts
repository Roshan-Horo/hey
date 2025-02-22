import type { ApolloLink } from '@apollo/client';
import { ApolloClient, from } from '@apollo/client';

import cache from './cache';
import httpLink from './httpLink';
import retryLink from './retryLink';

const apolloClient = (authLink?: ApolloLink) =>
  new ApolloClient({
    connectToDevTools: true,
    link: authLink
      ? from([authLink, retryLink, httpLink])
      : from([retryLink, httpLink]),
    cache
  });

export default apolloClient;
