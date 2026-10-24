import { IconCalendarWeek, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Button, Skeleton } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ISevenxClass, memberFullName } from '~/modules/shared/types';
import { SevenxEmpty } from '~/modules/shared/components';
import { startOfWeek, timeToMinutes, WEEK_DAYS } from '~/modules/shared/utils/schedule';

const HOUR_HEIGHT = 56;
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 21;

const COLORS = [
  'bg-primary/15 border-primary/40 text-primary',
  'bg-success/15 border-success/40 text-success',
  'bg-warning/15 border-warning/40 text-warning',
  'bg-info/15 border-info/40 text-info',
  'bg-destructive/15 border-destructive/40 text-destructive',
];

interface WeeklyScheduleProps {
  classes: ISevenxClass[];
  loading: boolean;
}

export const WeeklySchedule = ({ classes, loading }: WeeklyScheduleProps) => {
  const { t } = useTranslation('sevenx');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(dayjs()));
  const weekEnd = weekStart.add(6, 'day').endOf('day');

  const weekClasses = useMemo(
    () =>
      classes.filter(
        (c) =>
          c.status !== 'archived' &&
          !dayjs(c.schedule.startDate).isAfter(weekEnd) &&
          !dayjs(c.schedule.endDate).isBefore(weekStart),
      ),
    [classes, weekStart, weekEnd],
  );

  const { startHour, endHour } = useMemo(() => {
    let start = DEFAULT_START_HOUR;
    let end = DEFAULT_END_HOUR;
    weekClasses.forEach((c) => {
      start = Math.min(start, Math.floor(timeToMinutes(c.schedule.startTime) / 60));
      end = Math.max(end, Math.ceil(timeToMinutes(c.schedule.endTime) / 60));
    });
    return { startHour: start, endHour: end };
  }, [weekClasses]);

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const today = dayjs().format('YYYY-MM-DD');
  const colorFor = (classId: string) => {
    const index = classes.findIndex((c) => c._id === classId);
    return COLORS[(index < 0 ? 0 : index) % COLORS.length];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b">
        <Button
          variant="outline"
          size="icon"
          aria-label={t('prev-week')}
          onClick={() => setWeekStart((w) => w.subtract(7, 'day'))}
        >
          <IconChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('next-week')}
          onClick={() => setWeekStart((w) => w.add(7, 'day'))}
        >
          <IconChevronRight />
        </Button>
        <Button variant="ghost" onClick={() => setWeekStart(startOfWeek(dayjs()))}>
          {t('today')}
        </Button>
        <span className="text-sm font-medium ml-2">
          {weekStart.format('YYYY-MM-DD')} – {weekEnd.format('YYYY-MM-DD')}
        </span>
      </div>
      {loading ? (
        <div className="p-4 flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : weekClasses.length === 0 ? (
        <SevenxEmpty icon={IconCalendarWeek} title={t('no-classes-week')} className="h-full" />
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] sticky top-0 bg-background z-10 border-b">
              <div />
              {WEEK_DAYS.map((day, index) => {
                const date = weekStart.add(index, 'day');
                const isToday = date.format('YYYY-MM-DD') === today;
                return (
                  <div
                    key={day}
                    className={`px-2 py-2 text-center text-sm border-l ${
                      isToday ? 'font-semibold text-primary' : ''
                    }`}
                  >
                    {t(`day-${day}`)}{' '}
                    <span className="text-muted-foreground text-xs">{date.format('MM/DD')}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
              <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
                {hours.map((hour, i) => (
                  <div
                    key={hour}
                    className="absolute right-2 text-xs text-muted-foreground -translate-y-1/2"
                    style={{ top: i * HOUR_HEIGHT }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              {WEEK_DAYS.map((day, index) => {
                const date = weekStart.add(index, 'day');
                const dayClasses = weekClasses.filter(
                  (c) =>
                    c.schedule.daysOfWeek.includes(day) &&
                    !date.isBefore(dayjs(c.schedule.startDate), 'day') &&
                    !date.isAfter(dayjs(c.schedule.endDate), 'day'),
                );
                return (
                  <div
                    key={day}
                    className="relative border-l"
                    style={{ height: hours.length * HOUR_HEIGHT }}
                  >
                    {hours.map((hour, i) => (
                      <div
                        key={hour}
                        className="absolute inset-x-0 border-t border-dashed border-border/60"
                        style={{ top: i * HOUR_HEIGHT }}
                      />
                    ))}
                    {dayClasses.map((c) => {
                      const top =
                        ((timeToMinutes(c.schedule.startTime) - startHour * 60) / 60) *
                        HOUR_HEIGHT;
                      const height =
                        ((timeToMinutes(c.schedule.endTime) -
                          timeToMinutes(c.schedule.startTime)) /
                          60) *
                        HOUR_HEIGHT;
                      return (
                        <Link
                          key={c._id}
                          to={`/sevenx/classes/${c._id}`}
                          className={`absolute inset-x-1 rounded border px-2 py-1 text-xs overflow-hidden hover:opacity-90 ${colorFor(
                            c._id,
                          )}`}
                          style={{ top, height: Math.max(height, 24) }}
                          title={`${c.name} ${c.schedule.startTime}–${c.schedule.endTime}`}
                        >
                          <div className="font-semibold truncate">{c.name}</div>
                          <div className="truncate opacity-80">
                            {c.schedule.startTime}–{c.schedule.endTime}
                          </div>
                          <div className="truncate opacity-80">
                            {[memberFullName(c.teacher), c.room].filter(Boolean).join(' · ')}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
