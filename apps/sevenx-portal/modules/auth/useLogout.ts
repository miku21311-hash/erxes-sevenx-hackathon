'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { CP_LOGOUT } from '@/modules/sevenx/graphql';
import { clearSession } from './session';

export const useLogout = () => {
  const router = useRouter();
  const client = useApolloClient();
  const [logoutMutation] = useMutation<{ clientPortalLogout: string | null }>(CP_LOGOUT);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(
    async (redirectTo = '/login') => {
      setLoading(true);
      try {
        await logoutMutation();
      } catch {
        // the server cookie may already be gone; clear local state regardless
      }
      clearSession();
      await client.clearStore();
      setLoading(false);
      router.replace(redirectTo);
    },
    [client, logoutMutation, router],
  );

  return { logout, loading };
};
