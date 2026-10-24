import { useQuery } from '@apollo/client';
import { SEVENX_INVITES } from '../graphql/queries';
import { ISevenxInvite, SevenxRole } from '~/modules/shared/types';

interface InvitesQueryResponse {
  sevenxInvites: ISevenxInvite[];
}

export const useInvites = (variables: { role?: SevenxRole; classId?: string }) => {
  const { data, loading, error, refetch } = useQuery<InvitesQueryResponse>(
    SEVENX_INVITES,
    { variables },
  );

  return {
    invites: (data?.sevenxInvites ?? []).filter((invite) => !invite.acceptedAt),
    loading,
    error,
    refetch,
  };
};
