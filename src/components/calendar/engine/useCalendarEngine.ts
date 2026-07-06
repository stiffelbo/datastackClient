// useCalendarEngine.ts
import { useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import type {
  CalendarItem,
  CalendarModel,
  CalendarViewMode,
  UseCalendarEngineProps
} from './calendar.types';
import {
  calendarConfigSchema,
  type CalendarConfig,
} from './calendar.schema';
import { buildCalendarModel } from './calendar.builders';
import { toIsoDate } from './calendar.utils';

export function useCalendarEngine<TItem extends CalendarItem = CalendarItem>(
  params: UseCalendarEngineProps<TItem> = {},
) {
  const config: CalendarConfig = calendarConfigSchema.parse({
    initialView: params.initialView,
    selectionMode: params.selectionMode,
    weekStartsOn: params.weekStartsOn,
    startHour: params.startHour,
    endHour: params.endHour,
    slotMinutes: params.slotMinutes,
  });

  const [activeDate, setActiveDateState] = useState(() =>
    dayjs(params.initialDate ?? new Date()),
  );

  const [view, setViewState] = useState<CalendarViewMode>(
    config.initialView,
  );

  const isSelectionControlled = params.selectedDates !== undefined;

  const [internalSelectedDates, setInternalSelectedDates] = useState<string[]>(
    params.defaultSelectedDates ?? [],
  );

  const selectedDates = isSelectionControlled
    ? params.selectedDates ?? []
    : internalSelectedDates;

  const items = params.items ?? [];

  const model: CalendarModel<TItem> = useMemo(() => {
    return buildCalendarModel<TItem>({
      view,
      activeDate,
      selectedDates,
      items,
      weekStartsOn: config.weekStartsOn,
      startHour: config.startHour,
      endHour: config.endHour,
      slotMinutes: config.slotMinutes,
    });
  }, [
    view,
    activeDate,
    selectedDates,
    items,
    config.weekStartsOn,
    config.startHour,
    config.endHour,
    config.slotMinutes,
  ]);

  useEffect(() => {
    params.onRangeChange?.(model.range);
  }, [model.range]);

  function commitSelectedDates(nextDates: string[]) {
    if (!isSelectionControlled) {
      setInternalSelectedDates(nextDates);
    }

    params.onSelectedDatesChange?.(nextDates);
  }

  function setView(nextView: CalendarViewMode) {
    setViewState(nextView);
    params.onViewChange?.(nextView);
  }

  function setActiveDate(nextDate: Dayjs | string | Date) {
    const parsed = dayjs(nextDate);

    setActiveDateState(parsed);
    params.onActiveDateChange?.(parsed);
  }

  function goNext() {
    if (view === 'month') setActiveDate(activeDate.add(1, 'month'));
    if (view === 'week') setActiveDate(activeDate.add(1, 'week'));
    if (view === 'day') setActiveDate(activeDate.add(1, 'day'));
  }

  function goPrev() {
    if (view === 'month') setActiveDate(activeDate.subtract(1, 'month'));
    if (view === 'week') setActiveDate(activeDate.subtract(1, 'week'));
    if (view === 'day') setActiveDate(activeDate.subtract(1, 'day'));
  }

  function goToday() {
    setActiveDate(dayjs());
  }

  function toggleDay(date: Dayjs | string | Date) {
    const iso = toIsoDate(dayjs(date));

    const nextDates = selectedDates.includes(iso)
      ? selectedDates.filter((item) => item !== iso)
      : [...selectedDates, iso];

    commitSelectedDates(nextDates);
  }

  function selectDay(date: Dayjs | string | Date) {
    const iso = toIsoDate(dayjs(date));

    if (config.selectionMode === 'single') {
      commitSelectedDates([iso]);
      return;
    }

    commitSelectedDates([...new Set([...selectedDates, iso])]);
  }

  function clearSelection() {
    commitSelectedDates([]);
  }

  function selectVisible() {
    if (model.view === 'month') {
      const dates = model.weeks.flatMap((week) =>
        week.days.map((day) => day.iso),
      );

      commitSelectedDates([...new Set(dates)]);
    }

    if (model.view === 'week') {
      commitSelectedDates(model.week.days.map((day) => day.iso));
    }

    if (model.view === 'day') {
      commitSelectedDates([model.day.iso]);
    }
  }

  function selectWeek(weekDates: string[]) {
    commitSelectedDates([...new Set(weekDates)]);
    setView('week');
    setActiveDate(weekDates[0]);
  }

  function openDay(date: Dayjs | string | Date) {
    setActiveDate(date);
    setView('day');
  }

  function openWeek(date: Dayjs | string | Date) {
    setActiveDate(date);
    setView('week');
  }

  return {
    view,
    activeDate,
    model,

    range: model.range,

    items,
    loading: params.loading ?? false,
    error: params.error ?? null,

    selectedDates,

    actions: {
      setView,
      setActiveDate,

      goNext,
      goPrev,
      goToday,

      selectDay,
      toggleDay,
      selectWeek,
      selectVisible,
      clearSelection,

      openDay,
      openWeek,
    },
  };
}