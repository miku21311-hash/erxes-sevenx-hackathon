import dayjs from 'dayjs';
import {
  formatPercent,
  scheduleLabel,
  startOfWeek,
  timeToMinutes,
  WEEK_DAYS,
} from '../schedule';

describe('schedule helpers', () => {
  it('converts HH:mm to minutes', () => {
    expect(timeToMinutes('18:30')).toBe(18 * 60 + 30);
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('finds the Monday of the week, also on Sunday', () => {
    expect(startOfWeek(dayjs('2026-10-21')).format('YYYY-MM-DD')).toBe('2026-10-19');
    expect(startOfWeek(dayjs('2026-10-25')).format('YYYY-MM-DD')).toBe('2026-10-19');
    expect(startOfWeek(dayjs('2026-10-19')).format('YYYY-MM-DD')).toBe('2026-10-19');
  });

  it('labels a schedule Monday-first', () => {
    const label = scheduleLabel(
      { daysOfWeek: [0, 1, 3], startTime: '18:00', endTime: '19:30' },
      (day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
    );
    expect(label).toBe('Mon, Wed, Sun 18:00–19:30');
    expect(WEEK_DAYS[0]).toBe(1);
    expect(WEEK_DAYS[6]).toBe(0);
  });

  it('formats rates as whole percents', () => {
    expect(formatPercent(0.874)).toBe('87%');
    expect(formatPercent(0)).toBe('0%');
  });
});
