'use client';

import { useQuery } from '@apollo/client/react';
import { SEVENX_CLASS_DETAIL } from '@/modules/sevenx/graphql';
import type { SevenxClass } from '@/modules/sevenx/types';

export type ClassDetailData = { sevenxClassDetail: SevenxClass | null };

export const useClassDetail = (id: string) => {
  const { data, loading, error, refetch } = useQuery<ClassDetailData>(SEVENX_CLASS_DETAIL, {
    variables: { _id: id },
    fetchPolicy: 'cache-and-network',
  });
  return {
    cls: data?.sevenxClassDetail ?? null,
    loading: loading && !data,
    error,
    refetch,
  };
};
