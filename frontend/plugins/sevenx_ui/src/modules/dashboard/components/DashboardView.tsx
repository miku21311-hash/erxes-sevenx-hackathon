import {
  IconBook2,
  IconCalendarEvent,
  IconChalkboard,
  IconMailForward,
  IconMapPin,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';
import { Card, Skeleton } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AnnouncementsList } from '~/modules/announcements/components/AnnouncementsList';
import { QueryError } from '~/modules/shared/components';
import { memberFullName } from '~/modules/shared/types';
import { formatPercent } from '~/modules/shared/utils/schedule';
import { useDashboardStats } from '../hooks/useDashboardStats';

const StatCard = ({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: React.ElementType;
  label: string;
  value: ReactNode;
  to?: string;
}) => {
  const content = (
    <Card className="h-full hover:bg-accent/40 transition-colors">
      <Card.Header className="flex flex-row items-center justify-between p-4 pb-1">
        <Card.Description className="text-xs uppercase tracking-wide">{label}</Card.Description>
        <Icon className="size-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content className="p-4 pt-0">
        <div className="text-2xl font-semibold">{value}</div>
      </Card.Content>
    </Card>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

export const DashboardView = () => {
  const { t } = useTranslation('sevenx');
  const { stats, loading, error, refetch } = useDashboardStats();

  if (error) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  const value = (v?: number) => (loading || !stats ? <Skeleton className="h-8 w-16" /> : v ?? 0);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          icon={IconChalkboard}
          label={t('teacher-count')}
          value={value(stats?.teacherCount)}
          to="/sevenx/teachers"
        />
        <StatCard
          icon={IconUsers}
          label={t('student-count')}
          value={value(stats?.studentCount)}
          to="/sevenx/students"
        />
        <StatCard
          icon={IconBook2}
          label={t('class-count')}
          value={value(stats?.classCount)}
          to="/sevenx/classes"
        />
        <StatCard
          icon={IconMapPin}
          label={t('location-count')}
          value={value(stats?.locationCount)}
          to="/sevenx/locations"
        />
        <StatCard
          icon={IconUserCheck}
          label={t('weekly-attendance')}
          value={
            loading || !stats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              formatPercent(stats.weeklyAttendanceRate)
            )
          }
        />
        <StatCard
          icon={IconMailForward}
          label={t('pending-invites')}
          value={value(stats?.pendingInvites)}
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <Card.Header className="p-4 pb-2">
            <Card.Title className="text-base flex items-center gap-2">
              <IconCalendarEvent className="size-4" />
              {t('today-sessions')}
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-4 pt-0">
            {loading || !stats ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : stats.todaySessions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('no-sessions-today')}
              </p>
            ) : (
              <ul className="divide-y">
                {stats.todaySessions.map((session) => (
                  <li key={session._id} className="py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/sevenx/classes/${session._id}`}
                        className="font-medium text-primary hover:underline truncate block"
                      >
                        {session.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {[
                          memberFullName(session.teacher),
                          session.location?.name,
                          session.room,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <span className="text-sm font-mono shrink-0">
                      {session.schedule.startTime}–{session.schedule.endTime}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card.Content>
        </Card>
        <Card>
          <Card.Header className="p-4 pb-0">
            <Card.Title className="text-base">{t('recent-announcements')}</Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <AnnouncementsList limit={5} compact />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};
