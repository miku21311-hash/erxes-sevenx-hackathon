import { useQuery } from '@apollo/client';
import { SEVENX_LOCATIONS } from '../graphql/queries';
import { ISevenxLocation } from '~/modules/shared/types';

interface LocationsQueryResponse {
  sevenxLocations: ISevenxLocation[];
}

export const useLocations = () => {
  const { data, loading, error, refetch } =
    useQuery<LocationsQueryResponse>(SEVENX_LOCATIONS);

  return {
    locations: data?.sevenxLocations ?? [],
    loading,
    error,
    refetch,
  };
};
