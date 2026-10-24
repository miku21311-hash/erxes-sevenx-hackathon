import { useQuery } from '@apollo/client';
import { SEVENX_CLASSES } from '../graphql/queries';
import { ISevenxClass } from '~/modules/shared/types';

export interface ClassesFilter {
  locationId?: string;
  teacherId?: string;
  searchValue?: string;
  status?: string;
}

interface ClassesQueryResponse {
  sevenxClasses: ISevenxClass[];
}

export const useClasses = (variables: ClassesFilter = {}) => {
  const { data, loading, error, refetch } = useQuery<ClassesQueryResponse>(
    SEVENX_CLASSES,
    { variables },
  );

  return {
    classes: data?.sevenxClasses ?? [],
    loading,
    error,
    refetch,
  };
};
