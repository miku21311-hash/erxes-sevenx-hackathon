'use client';

import Link from 'next/link';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { useCurrentMember } from '@/modules/auth/MeContext';
import { AnnouncementsCard } from '@/modules/sevenx/components/AnnouncementsPanel';
import { formatDateTime, formatSchedule, parseDate } from '@/modules/sevenx/date';
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
import { useStudentOverview } from './useStudentOverview';

export function StudentDashboard() {
  const t = useT();
  const { locale } = useLocale();
  const me = useCurrentMember();
  const { classes, loading, error, refetch } = useMyClasses();
  const overview = useStudentOverview(classes);

  const upcoming = classes
    .filter((c) => parseDate(c.nextSession))
    .sort(
      (a, b) => (parseDate(a.nextSession)?.getTime() ?? 0) - (parseDate(b.nextSession)?.getTime() ?? 0),
    );
  const next = upcoming[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('dash.welcome', { name: memberFullName(me) })}</h1>

      {loading && <LoadingState />}
      {error && !loading && <ErrorState message={error.message} onRetry={() => refetch()} />}

      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title={t('dash.nextSession')} />
              <CardBody>
                {!next ? (
                  <EmptyState title={t('dash.noUpcoming')} />
                ) : (
                  <div>
                    <Link href={`/s/classes/${next._id}`} className="text-lg font-semibold hover:underline">
                      {next.name}
                    </Link>
                    <p className="mt-1 text-sm">{formatDateTime(next.nextSession, locale)}</p>
                    <p className="mt-1 text-xs text-muted">
                      {next.location?.name}
                      {next.room ? ` · ${t('common.room')} ${next.room}` : ''}
                      {next.teacher ? ` · ${memberFullName(next.teacher)}` : ''}
                    </p>
                    {upcoming.length > 1 && (
                      <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                        {upcoming.slice(1, 4).map((c) => (
                          <li key={c._id} className="flex justify-between">
                            <Link href={`/s/classes/${c._id}`} className="hover:underline">
                              {c.name}
                            </Link>
                            <span className="text-muted">{formatDateTime(c.nextSession, locale)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={t('dash.dueSoon')} />
              <CardBody>
                {overview.loading && <LoadingState />}
                {overview.error && <ErrorState message={overview.error} />}
                {!overview.loading && !overview.error && overview.dueSoon.length === 0 && (
                  <EmptyState title={t('dash.noDueSoon')} />
                )}
                <ul className="divide-y divide-border">
                  {overview.dueSoon.map(({ cls, assignment, days }) => (
                    <li key={assignment._id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <Link
                          href={`/s/classes/${cls._id}?tab=assignments`}
                          className="block truncate font-medium hover:underline"
                        >
                          {assignment.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {cls.name} · {formatDateTime(assignment.dueDate, locale)}
                        </p>
                      </div>
                      <Badge tone={days < 0 ? 'red' : days <= 2 ? 'amber' : 'gray'}>
                        {days < 0 ? t('asg.overdue') : `${days}d`}
                      </Badge>
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
                      href={`/s/classes/${cls._id}`}
                      className="block rounded-lg border border-border p-4 transition-colors hover:bg-gray-50"
                    >
                      <p className="font-medium">{cls.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatSchedule(cls.schedule, (d) => t(`day.${d}`))}
                      </p>
                      {cls.teacher && (
                        <p className="mt-2 text-xs text-muted">
                          {t('common.teacher')}: {memberFullName(cls.teacher)}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <AnnouncementsCard markReadOnOpen />
        </>
      )}
    </div>
  );
}
