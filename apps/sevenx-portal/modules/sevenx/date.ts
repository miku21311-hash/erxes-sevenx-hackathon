import type { Locale } from '@/modules/i18n/I18nProvider';

const pad = (n: number): string => String(n).padStart(2, '0');

/** YYYY-MM-DD in local time. */
export const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = (): string => toDateKey(new Date());

export const addDays = (d: Date, days: number): Date => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const parseDate = (value?: string | number | null): Date | null => {
  if (value === null || value === undefined || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const localeTag = (locale: Locale): string => (locale === 'mn' ? 'mn-MN' : 'en-GB');

export const formatDate = (value?: string | number | null, locale: Locale = 'mn'): string => {
  const d = parseDate(value);
  if (!d) return '—';
  return d.toLocaleDateString(localeTag(locale), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (
  value?: string | number | null,
  locale: Locale = 'mn',
): string => {
  const d = parseDate(value);
  if (!d) return '—';
  return d.toLocaleString(localeTag(locale), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** value for <input type="datetime-local"> */
export const toDateTimeLocal = (value?: string | number | null): string => {
  const d = parseDate(value) ?? new Date();
  return `${toDateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const isOverdue = (dueDate?: string | null): boolean => {
  const d = parseDate(dueDate);
  return d ? d.getTime() < Date.now() : false;
};

export const daysUntil = (value?: string | null): number | null => {
  const d = parseDate(value);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
};

export const formatSchedule = (
  schedule: { daysOfWeek: number[]; startTime: string; endTime: string },
  dayLabel: (day: number) => string,
): string =>
  `${[...schedule.daysOfWeek].sort().map(dayLabel).join(', ')} ${schedule.startTime}–${schedule.endTime}`;
