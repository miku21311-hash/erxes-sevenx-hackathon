import { ISevenxSchedule } from './types';

export interface ISevenxSession {
  date: string;
  startTime: string;
  endTime: string;
  isToday: boolean;
  isPast: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateString = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayString = (): string => toDateString(new Date());

export const parseDateString = (value: string): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const isValidTime = (time: string): boolean =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

export const validateSchedule = (schedule: ISevenxSchedule): string | null => {
  if (!schedule.daysOfWeek?.length) {
    return 'At least one weekday is required';
  }
  if (schedule.daysOfWeek.some((d) => d < 0 || d > 6)) {
    return 'daysOfWeek must be between 0 and 6';
  }
  if (!isValidTime(schedule.startTime) || !isValidTime(schedule.endTime)) {
    return 'Time must be in HH:mm format';
  }
  if (timeToMinutes(schedule.startTime) >= timeToMinutes(schedule.endTime)) {
    return 'startTime must be before endTime';
  }
  if (new Date(schedule.startDate) > new Date(schedule.endDate)) {
    return 'startDate must be before endDate';
  }
  return null;
};

/**
 * Expands a weekly recurring schedule into concrete sessions between
 * `from` and `to` (inclusive, YYYY-MM-DD). Defaults to the schedule range.
 */
export const generateSessions = (
  schedule: ISevenxSchedule,
  from?: string,
  to?: string,
): ISevenxSession[] => {
  const rangeStart = new Date(schedule.startDate);
  const rangeEnd = new Date(schedule.endDate);
  const start = from ? parseDateString(from) : rangeStart;
  const end = to ? parseDateString(to) : rangeEnd;

  const cursor = new Date(Math.max(start.getTime(), rangeStart.getTime()));
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(Math.min(end.getTime(), rangeEnd.getTime()));
  last.setHours(0, 0, 0, 0);

  const today = todayString();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const days = new Set(schedule.daysOfWeek);
  const sessions: ISevenxSession[] = [];

  while (cursor <= last) {
    if (days.has(cursor.getDay())) {
      const date = toDateString(cursor);
      const isToday = date === today;
      const isPast =
        date < today ||
        (isToday && timeToMinutes(schedule.endTime) < nowMinutes);
      sessions.push({
        date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isToday,
        isPast,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return sessions;
};

export const isSessionDate = (schedule: ISevenxSchedule, date: string): boolean =>
  generateSessions(schedule, date, date).length > 0;

export const nextSessionDate = (schedule: ISevenxSchedule): Date | null => {
  const today = todayString();
  const horizon = new Date(schedule.endDate);
  const upcoming = generateSessions(schedule, today, toDateString(horizon)).find(
    (s) => !s.isPast,
  );
  if (!upcoming) {
    return null;
  }
  const d = parseDateString(upcoming.date);
  const [h, m] = upcoming.startTime.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};

export const pastSessionDates = (schedule: ISevenxSchedule): string[] =>
  generateSessions(schedule).filter((s) => s.isPast).map((s) => s.date);

const dateRangesOverlap = (a: ISevenxSchedule, b: ISevenxSchedule): boolean =>
  new Date(a.startDate) <= new Date(b.endDate) &&
  new Date(b.startDate) <= new Date(a.endDate);

const timesOverlap = (a: ISevenxSchedule, b: ISevenxSchedule): boolean =>
  timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
  timeToMinutes(b.startTime) < timeToMinutes(a.endTime);

export const schedulesOverlap = (a: ISevenxSchedule, b: ISevenxSchedule): boolean => {
  if (!dateRangesOverlap(a, b) || !timesOverlap(a, b)) {
    return false;
  }
  return a.daysOfWeek.some((d) => b.daysOfWeek.includes(d));
};
