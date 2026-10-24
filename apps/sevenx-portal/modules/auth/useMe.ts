'use client';

import { useQuery } from '@apollo/client/react';
import { SEVENX_ME } from '@/modules/sevenx/graphql';
import type { SevenxMember } from '@/modules/sevenx/types';

export type MeQueryData = { sevenxMe: SevenxMember | null };

export const useMe = (options?: { skip?: boolean }) => {
  const { data, loading, error, refetch } = useQuery<MeQueryData>(SEVENX_ME, {
    skip: options?.skip,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  return {
    me: data?.sevenxMe ?? null,
    loading: loading && !data,
    error,
    refetch,
  };
};
