'use client';

import { useQuery } from '@apollo/client/react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { formatDate } from '@/modules/sevenx/date';
import { SEVENX_MY_ATTENDANCE, SEVENX_MY_ATTENDANCE_SUMMARY } from '@/modules/sevenx/graphql';
import type {
  SevenxAttendance,
  SevenxAttendanceStatus,
  SevenxAttendanceSummary,
  SevenxClass,
} from '@/modules/sevenx/types';
import { Badge, Card, CardBody, EmptyState, ErrorState, LoadingState } from '@/modules/ui';

const TONE: Record<SevenxAttendanceStatus, 'green' | 'amber' | 'red' | 'blue'> = {
  present: 'green',
  late: 'amber',
  absent: 'red',
  excused: 'blue',
};

export function MyAttendanceTab({ cls }: { cls: SevenxClass }) {
  const t = useT();
  const { locale } = useLocale();
  const summary = useQuery<{ sevenxMyAttendanceSummary: SevenxAttendanceSummary }>(
    SEVENX_MY_ATTENDANCE_SUMMARY,
    { variables: { classId: cls._id }, fetchPolicy: 'cache-and-network' },
  );
  const list = useQuery<{ sevenxMyAttendance: SevenxAttendance[] }>(SEVENX_MY_ATTENDANCE, {
    variables: { classId: cls._id },
    fetchPolicy: 'cache-and-network',
  });

  const s = summary.data?.sevenxMyAttendanceSummary;
  const rows = [...(list.data?.sevenxMyAttendance ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      {summary.loading && !s && <LoadingState />}
      {summary.error && !s && (
        <ErrorState message={summary.error.message} onRetry={() => summary.refetch()} />
      )}
      {s && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Card className="p-4">
            <p className="text-xs text-muted">{t('att.rate')}</p>
            <p className="text-2xl font-semibold">{Math.round(s.rate * (s.rate <= 1 ? 100 : 1))}%</p>
          </Card>
          {(['present', 'late', 'absent', 'excused'] as const).map((k) => (
            <Card key={k} className="p-4">
              <p className="text-xs text-muted">{t(`att.${k}`)}</p>
              <p className="text-2xl font-semibold">
                {s[k]}
                <span className="text-sm font-normal text-muted">/{s.total}</span>
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardBody className="p-0">
          {list.loading && !list.data && <LoadingState />}
          {list.error && !list.data && (
            <ErrorState message={list.error.message} onRetry={() => list.refetch()} />
          )}
          {list.data && rows.length === 0 && <EmptyState title={t('att.noRecords')} />}
          <ul className="divide-y divide-border">
            {rows.map((a) => (
              <li key={`${a.date}-${a._id}`} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{formatDate(a.date, locale)}</p>
                  {a.note && <p className="text-xs text-muted">{a.note}</p>}
                </div>
                <Badge tone={TONE[a.status]}>{t(`att.${a.status}`)}</Badge>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
