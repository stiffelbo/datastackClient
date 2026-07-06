// calendar.types.ts
import type { Dayjs } from 'dayjs';

export type CalendarViewMode = 'month' | 'week' | 'day';

export type CalendarSelectionMode =
    | 'single'
    | 'multiple'
    | 'week'
    | 'range';

export type CalendarDateValue = string; //YYY-MM-DD

export type CalendarDateInput = Dayjs | Date | string;

export interface CalendarRange {
    from : CalendarDateValue,
    to : CalendarDateValue,
    visibleFrom : CalendarDateValue,
    visibleTo: CalendarDateValue
}

export interface CalendarItem {
  id: string | number;
  date: CalendarDateValue;
  [key: string]: unknown;
}

export interface CalendarDay<TItem = CalendarItem> {
  key: CalendarDateValue;
  date: Dayjs;
  iso: CalendarDateValue;

  dayOfMonth: number;
  dayOfWeek: number;
  weekNumber: number;

  isToday: boolean;
  isCurrentMonth: boolean;
  isCurrentWeek: boolean;
  isSelected: boolean;
  isDisabled: boolean;

  items: TItem[];
}

export interface CalendarWeek<TItem = CalendarItem> {
  key: string;
  weekNumber: number;
  from: CalendarDateValue;
  to: CalendarDateValue;

  isSelected: boolean;
  isCurrentWeek: boolean;

  days: CalendarDay<TItem>[];
}

export interface CalendarTimeSlot<TItem = CalendarItem> {
  key: string;
  date: CalendarDateValue;
  from: string;
  to: string;
  items: TItem[];
  isSelected: boolean;
}

export interface CalendarMonthModel<TItem = CalendarItem> {
  view: 'month';
  activeDate: Dayjs;
  range: CalendarRange;
  weeks: CalendarWeek<TItem>[];
}

export interface CalendarWeekModel<TItem = CalendarItem> {
  view: 'week';
  activeDate: Dayjs;
  range: CalendarRange;
  week: CalendarWeek<TItem>;
}

export interface CalendarDayModel<TItem = CalendarItem> {
  view: 'day';
  activeDate: Dayjs;
  range: CalendarRange;
  day: CalendarDay<TItem>;
  slots: CalendarTimeSlot<TItem>[];
}

export type CalendarModel<TItem = CalendarItem> =
  | CalendarMonthModel<TItem>
  | CalendarWeekModel<TItem>
  | CalendarDayModel<TItem>;


export type CalendarItemAdapter<TItem> = {
  getId: (item: TItem) => string | number;
  getDate: (item: TItem) => CalendarDateInput;

  getLabel?: (item: TItem) => string;
  getDescription?: (item: TItem) => string;
  getColor?: (item: TItem) => string;
  isDisabled?: (item: TItem) => boolean;
};

export type UseCalendarEngineProps<TItem> = {
  // sterowanie kalendarzem
  initialDate?: CalendarDateInput;
  initialView?: CalendarViewMode;
  weekStartsOn?: 0 | 1;

  // selection
  selectedDates?: string[];
  defaultSelectedDates?: string[];
  selectionMode?: CalendarSelectionMode;

  // day view
  startHour?: number;
  endHour?: number;
  slotMinutes?: number;

  // callbacki
  onRangeChange?: (range: CalendarRange) => void;
  onSelectedDatesChange?: (dates: string[]) => void;
  onViewChange?: (view: CalendarViewMode) => void;
  onActiveDateChange?: (date: Dayjs) => void;
};