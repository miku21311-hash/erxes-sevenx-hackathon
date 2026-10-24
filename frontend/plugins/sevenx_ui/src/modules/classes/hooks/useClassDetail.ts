import { useQuery } from '@apollo/client';
import { SEVENX_CLASS_DETAIL } from '../graphql/queries';
import { ISevenxClass } from '~/modules/shared/types';

interface ClassDetailResponse {
  sevenxClassDetail: ISevenxClass | null;
}

export const useClassDetail = (_id: string | undefined) => {
  const { data, loading, error, refetch } = useQuery<ClassDetailResponse>(
    SEVENX_CLASS_DETAIL,
    { variables: { _id }, skip: !_id },
  );

  return {
    classItem: data?.sevenxClassDetail ?? null,
    loading,
    error,
    refetch,
  };
};
