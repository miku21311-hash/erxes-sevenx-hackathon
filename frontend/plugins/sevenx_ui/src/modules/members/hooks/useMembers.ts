import { useQuery } from '@apollo/client';
import { SEVENX_MEMBERS } from '../graphql/queries';
import { ISevenxMember, SevenxRole } from '~/modules/shared/types';

interface MembersQueryResponse {
  sevenxMembers: ISevenxMember[];
}

export const useMembers = (variables: {
  role?: SevenxRole;
  searchValue?: string;
  classId?: string;
}) => {
  const { data, loading, error, refetch } = useQuery<MembersQueryResponse>(
    SEVENX_MEMBERS,
    { variables },
  );

  return {
    members: data?.sevenxMembers ?? [],
    loading,
    error,
    refetch,
  };
};
