// calendar.builders.ts
import dayjs, { Dayjs } from 'dayjs';
import type {
  CalendarDay,
  CalendarItem,
  CalendarModel,
  CalendarRange,
  CalendarTimeSlot,
  CalendarWeek,
  CalendarViewMode,
} from './calendar.types';
import {
  getEndOfWeek,
  getStartOfWeek,
  getWeekNumber,
  isSameDate,
  toIsoDate,
} from './calendar.utils';

interface BuildCalendarModelParams<TItem> {
  view: CalendarViewMode;
  activeDate: Dayjs;
  selectedDates: string[];
  items: TItem[];
  weekStartsOn: 0 | 1;
  startHour: number;
  endHour: number;
  slotMinutes: number;
}

export function buildCalendarModel<TItem extends CalendarItem>(
  params: BuildCalendarModelParams<TItem>,
): CalendarModel<TItem> {
  if (params.view === 'month') {
    return buildMonthModel(params);
  }

  if (params.view === 'week') {
    return buildWeekModel(params);
  }

  return buildDayModel(params);
}

function buildDay<TItem extends CalendarItem>(
  date: Dayjs,
  activeDate: Dayjs,
  selectedDates: string[],
  items: TItem[],
): CalendarDay<TItem> {
  const iso = toIsoDate(date);
  const today = dayjs();

  return {
    key: iso,
    date,
    iso,

    dayOfMonth: date.date(),
    dayOfWeek: date.day(),
    weekNumber: getWeekNumber(date),

    isToday: isSameDate(date, today),
    isCurrentMonth: date.isSame(activeDate, 'month'),
    isCurrentWeek: date.isSame(activeDate, 'week'),
    isSelected: selectedDates.includes(iso),
    isDisabled: false,

    items: items.filter((item) => item.date === iso),
  };
}

function buildWeek<TItem extends CalendarItem>(
  date: Dayjs,
  activeDate: Dayjs,
  selectedDates: string[],
  items: TItem[],
  weekStartsOn: 0 | 1,
): CalendarWeek<TItem> {
  const start = getStartOfWeek(date, weekStartsOn);

  const days = Array.from({ length: 7 }, (_, index) =>
    buildDay(start.add(index, 'day'), activeDate, selectedDates, items),
  );

  return {
    key: `${start.year()}-W${getWeekNumber(start)}`,
    weekNumber: getWeekNumber(start),
    from: toIsoDate(days[0].date),
    to: toIsoDate(days[6].date),
    isSelected: days.every((day) => day.isSelected),
    isCurrentWeek: days.some((day) => day.isToday),
    days,
  };
}

function buildMonthModel<TItem extends CalendarItem>(
  params: BuildCalendarModelParams<TItem>,
) {
  const startOfMonth = params.activeDate.startOf('month');
  const endOfMonth = params.activeDate.endOf('month');

  const gridStart = getStartOfWeek(startOfMonth, params.weekStartsOn);

  const weeks = Array.from({ length: 6 }, (_, weekIndex) =>
    buildWeek(
      gridStart.add(weekIndex * 7, 'day'),
      params.activeDate,
      params.selectedDates,
      params.items,
      params.weekStartsOn,
    ),
  );

  const range: CalendarRange = {
    from: toIsoDate(startOfMonth),
    to: toIsoDate(endOfMonth),
    visibleFrom: weeks[0].from,
    visibleTo: weeks[5].to,
  };

  return {
    view: 'month' as const,
    activeDate: params.activeDate,
    range,
    weeks,
  };
}

function buildWeekModel<TItem extends CalendarItem>(
  params: BuildCalendarModelParams<TItem>,
) {
  const week = buildWeek(
    params.activeDate,
    params.activeDate,
    params.selectedDates,
    params.items,
    params.weekStartsOn,
  );

  return {
    view: 'week' as const,
    activeDate: params.activeDate,
    range: {
      from: week.from,
      to: week.to,
      visibleFrom: week.from,
      visibleTo: week.to,
    },
    week,
  };
}

function buildDayModel<TItem extends CalendarItem>(
  params: BuildCalendarModelParams<TItem>,
) {
  const day = buildDay(
    params.activeDate,
    params.activeDate,
    params.selectedDates,
    params.items,
  );

  const slots = buildTimeSlots({
    date: params.activeDate,
    items: params.items,
    selectedDates: params.selectedDates,
    startHour: params.startHour,
    endHour: params.endHour,
    slotMinutes: params.slotMinutes,
  });

  return {
    view: 'day' as const,
    activeDate: params.activeDate,
    range: {
      from: day.iso,
      to: day.iso,
      visibleFrom: day.iso,
      visibleTo: day.iso,
    },
    day,
    slots,
  };
}

function buildTimeSlots<TItem extends CalendarItem>({
  date,
  items,
  selectedDates,
  startHour,
  endHour,
  slotMinutes,
}: {
  date: Dayjs;
  items: TItem[];
  selectedDates: string[];
  startHour: number;
  endHour: number;
  slotMinutes: number;
}): CalendarTimeSlot<TItem>[] {
  const iso = toIsoDate(date);
  const start = date.hour(startHour).minute(0).second(0);
  const end = date.hour(endHour).minute(0).second(0);

  const slots: CalendarTimeSlot<TItem>[] = [];

  let cursor = start;

  while (cursor.isBefore(end)) {
    const next = cursor.add(slotMinutes, 'minute');

    slots.push({
      key: cursor.format('YYYY-MM-DDTHH:mm'),
      date: iso,
      from: cursor.format('HH:mm'),
      to: next.format('HH:mm'),
      items: items.filter((item) => item.date === iso),
      isSelected: selectedDates.includes(iso),
    });

    cursor = next;
  }

  return slots;
}