import { useQuery } from '@apollo/client';
import { SEVENX_ANNOUNCEMENTS } from '../graphql/queries';
import { ISevenxAnnouncement } from '~/modules/shared/types';

interface AnnouncementsResponse {
  sevenxAnnouncements: ISevenxAnnouncement[];
}

export const useAnnouncements = (variables: { classId?: string; limit?: number }) => {
  const { data, loading, error, refetch } = useQuery<AnnouncementsResponse>(
    SEVENX_ANNOUNCEMENTS,
    { variables },
  );

  return {
    announcements: data?.sevenxAnnouncements ?? [],
    loading,
    error,
    refetch,
  };
};
