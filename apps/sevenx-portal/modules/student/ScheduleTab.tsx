'use client';

import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { addDays, formatDate, toDateKey } from '@/modules/sevenx/date';
import type { SevenxClass } from '@/modules/sevenx/types';
import { useSessions } from '@/modules/sevenx/useSessions';
import { Badge, Card, CardBody, EmptyState, ErrorState, LoadingState, cn } from '@/modules/ui';

export function ScheduleTab({ cls }: { cls: SevenxClass }) {
  const t = useT();
  const { locale } = useLocale();
  const from = toDateKey(addDays(new Date(), -30));
  const to = toDateKey(addDays(new Date(), 60));
  const { sessions, loading, error, refetch } = useSessions(cls._id, from, to);

  if (loading) return <LoadingState />;
  if (error && sessions.length === 0) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (sessions.length === 0) return <EmptyState title={t('sess.none')} />;

  return (
    <Card>
      <CardBody className="p-0">
        <ul className="divide-y divide-border">
          {sessions.map((s) => {
            const day = new Date(`${s.date}T00:00:00`).getDay();
            return (
              <li
                key={`${s.date}-${s.startTime}`}
                className={cn(
                  'flex items-center justify-between px-4 py-3',
                  s.isToday && 'bg-indigo-50',
                  s.isPast && 'text-muted',
                )}
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatDate(s.date, locale)} · {t(`day.${day}`)}
                  </p>
                  <p className="text-xs text-muted">
                    {s.startTime}–{s.endTime}
                    {cls.location ? ` · ${cls.location.name}` : ''}
                    {cls.room ? ` · ${cls.room}` : ''}
                  </p>
                </div>
                <Badge tone={s.isToday ? 'indigo' : s.isPast ? 'gray' : 'green'}>
                  {s.isToday ? t('sess.today') : s.isPast ? t('sess.past') : t('sess.upcoming')}
                </Badge>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
