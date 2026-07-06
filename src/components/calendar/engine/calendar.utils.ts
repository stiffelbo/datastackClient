// calendar.utils.ts
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

export function toIsoDate(date: Dayjs): string {
  return date.format('YYYY-MM-DD');
}

export function isSameDate(a: Dayjs, b: Dayjs): boolean {
  return a.isSame(b, 'day');
}

export function getWeekNumber(date: Dayjs): number {
  return date.isoWeek();
}

export function getStartOfWeek(date: Dayjs, weekStartsOn: 0 | 1): Dayjs {
  const day = date.day();
  const diff = (day - weekStartsOn + 7) % 7;
  return date.subtract(diff, 'day').startOf('day');
}

export function getEndOfWeek(date: Dayjs, weekStartsOn: 0 | 1): Dayjs {
  return getStartOfWeek(date, weekStartsOn).add(6, 'day').endOf('day');
}