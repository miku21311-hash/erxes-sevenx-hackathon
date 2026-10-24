import { useQuery } from '@apollo/client';
import { SEVENX_DASHBOARD_STATS } from '../graphql/queries';
import { ISevenxDashboardStats } from '~/modules/shared/types';

interface DashboardStatsResponse {
  sevenxDashboardStats: ISevenxDashboardStats;
}

export const useDashboardStats = () => {
  const { data, loading, error, refetch } = useQuery<DashboardStatsResponse>(
    SEVENX_DASHBOARD_STATS,
  );

  return {
    stats: data?.sevenxDashboardStats ?? null,
    loading,
    error,
    refetch,
  };
};
