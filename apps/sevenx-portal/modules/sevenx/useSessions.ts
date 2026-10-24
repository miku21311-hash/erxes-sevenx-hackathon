'use client';

import { useQuery } from '@apollo/client/react';
import { SEVENX_CLASS_SESSIONS } from '@/modules/sevenx/graphql';
import type { SevenxSession } from '@/modules/sevenx/types';

export type SessionsData = { sevenxClassSessions: SevenxSession[] };

export const useSessions = (classId: string, from?: string, to?: string) => {
  const { data, loading, error, refetch } = useQuery<SessionsData>(SEVENX_CLASS_SESSIONS, {
    variables: { classId, from, to },
    fetchPolicy: 'cache-and-network',
  });
  return {
    sessions: data?.sevenxClassSessions ?? [],
    loading: loading && !data,
    error,
    refetch,
  };
};
