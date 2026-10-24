import dayjs from 'dayjs';

/** Monday-first order of `daysOfWeek` values (0 = Sunday … 6 = Saturday). */
export const WEEK_DAYS: number[] = [1, 2, 3, 4, 5, 6, 0];

export const DATE_FORMAT = 'YYYY-MM-DD';

export const formatDate = (value?: string | Date | null): string =>
  value ? dayjs(value).format(DATE_FORMAT) : '';

export const formatDateTime = (value?: string | null): string =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '';

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const formatPercent = (rate: number): string =>
  `${Math.round(rate * 100)}%`;

/** Monday of the week containing `date`. */
export const startOfWeek = (date: dayjs.Dayjs): dayjs.Dayjs => {
  const day = date.day();
  const diff = day === 0 ? 6 : day - 1;
  return date.subtract(diff, 'day').startOf('day');
};

export const scheduleLabel = (
  schedule: { daysOfWeek: number[]; startTime: string; endTime: string },
  dayLabel: (day: number) => string,
): string => {
  const days = WEEK_DAYS.filter((d) => schedule.daysOfWeek.includes(d))
    .map(dayLabel)
    .join(', ');
  return `${days} ${schedule.startTime}–${schedule.endTime}`;
};
