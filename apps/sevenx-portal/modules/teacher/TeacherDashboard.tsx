'use client';

import Link from 'next/link';
import { useT } from '@/modules/i18n/I18nProvider';
import { useCurrentMember } from '@/modules/auth/MeContext';
import { AnnouncementsCard } from '@/modules/sevenx/components/AnnouncementsPanel';
import { formatSchedule } from '@/modules/sevenx/date';
import { useMyClasses } from '@/modules/sevenx/useMyClasses';
import { memberFullName } from '@/modules/sevenx/types';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/modules/ui';
import { useTeacherOverview } from './useTeacherOverview';

export function TeacherDashboard() {
  const t = useT();
  const me = useCurrentMember();
  const { classes, loading, error, refetch } = useMyClasses();
  const overview = useTeacherOverview(classes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('dash.welcome', { name: memberFullName(me) })}</h1>
      </div>

      {loading && <LoadingState />}
      {error && !loading && <ErrorState message={error.message} onRetry={() => refetch()} />}

      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title={t('dash.todaySessions')} />
              <CardBody>
                {overview.loading && <LoadingState />}
                {overview.error && <ErrorState message={overview.error} />}
                {!overview.loading && !overview.error && overview.today.length === 0 && (
                  <EmptyState title={t('dash.noSessionsToday')} />
                )}
                <ul className="divide-y divide-border">
                  {overview.today.map(({ cls, session }) => (
                    <li key={`${cls._id}-${session.startTime}`} className="flex items-center justify-between py-2.5">
                      <div>
                        <Link href={`/t/classes/${cls._id}`} className="font-medium hover:underline">
                          {cls.name}
                        </Link>
                        <p className="text-xs text-muted">
                          {cls.location?.name}
                          {cls.room ? ` · ${cls.room}` : ''}
                        </p>
                      </div>
                      <Badge tone={session.isPast ? 'gray' : 'green'}>
                        {session.startTime}–{session.endTime}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={t('dash.ungraded')}
                description={`${overview.ungraded.reduce((n, u) => n + u.pending, 0)} ${t('dash.ungradedHint')}`}
              />
              <CardBody>
                {overview.loading && <LoadingState />}
                {!overview.loading && overview.ungraded.length === 0 && <EmptyState />}
                <ul className="divide-y divide-border">
                  {overview.ungraded.map(({ cls, assignment, pending }) => (
                    <li key={assignment._id} className="flex items-center justify-between py-2.5">
                      <div className="min-w-0">
                        <Link
                          href={`/t/classes/${cls._id}?tab=assignments`}
                          className="block truncate font-medium hover:underline"
                        >
                          {assignment.title}
                        </Link>
                        <p className="text-xs text-muted">{cls.name}</p>
                      </div>
                      <Badge tone="amber">{pending}</Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title={t('common.myClasses')} />
            <CardBody>
              {classes.length === 0 && <EmptyState title={t('common.noClasses')} />}
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <li key={cls._id}>
                    <Link
                      href={`/t/classes/${cls._id}`}
                      className="block rounded-lg border border-border p-4 transition-colors hover:bg-gray-50"
                    >
                      <p className="font-medium">{cls.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatSchedule(cls.schedule, (d) => t(`day.${d}`))}
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        {t('dash.studentsCount', { count: cls.studentIds.length })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <AnnouncementsCard />
        </>
      )}
    </div>
  );
}
