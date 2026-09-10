import { useCallback, useMemo, useState } from 'react';

type UseMonthsResult = {
  currentMonth: string;
  startDate: string;
  endDate: string;
  prev: () => void;
  next: () => void;
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatMonth(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${year}`;
}

function normalizeMonth(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

export function useMonths(
  initialDate: Date = new Date()
): UseMonthsResult {
  const [date, setDate] = useState(() =>
    normalizeMonth(initialDate)
  );

  const currentMonth = useMemo(
    () => formatMonth(date),
    [date]
  );

  const startDate = useMemo(
    () => formatDate(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      )
    ),
    [date]
  );

  const endDate = useMemo(
    () => formatDate(
      new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      )
    ),
    [date]
  );

  const prev = useCallback(() => {
    setDate(current =>
      new Date(
        current.getFullYear(),
        current.getMonth() - 1,
        1
      )
    );
  }, []);

  const next = useCallback(() => {
    setDate(current =>
      new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        1
      )
    );
  }, []);

  return {
    currentMonth,
    startDate,
    endDate,
    prev,
    next,
  };
}