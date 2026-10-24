'use client';

import { useQuery } from '@apollo/client/react';
import { SEVENX_MY_CLASSES } from '@/modules/sevenx/graphql';
import type { SevenxClass } from '@/modules/sevenx/types';

export type MyClassesData = { sevenxMyClasses: SevenxClass[] };

export const useMyClasses = () => {
  const { data, loading, error, refetch } = useQuery<MyClassesData>(SEVENX_MY_CLASSES, {
    fetchPolicy: 'cache-and-network',
  });
  return {
    classes: data?.sevenxMyClasses ?? [],
    loading: loading && !data,
    error,
    refetch,
  };
};
