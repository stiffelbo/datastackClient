import React, { useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";

const parseDate = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match.map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  );

  // Zabezpieczenie przed automatyczną normalizacją JS,
  // np. 2026-02-31 -> marzec
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return null;
  }

  return date;
};

const diffMinutes = (start, end) => {
  if (!start || !end) {
    return 0;
  }

  return Math.max(
    0,
    (end.getTime() - start.getTime()) / 60000
  );
};

const formatTime = (value) => {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LogsTodayProgress = ({
  data = [],
  hours = 8,
  height = 28,
  dayStart = null,
}) => {
  const items = useMemo(() => {
    if (!Array.isArray(data) || !data.length) {
      return [];
    }

    if (!Number.isFinite(hours) || hours <= 0) {
      return [];
    }

    const parsedEntries = data
      .map((entry) => {
        const start = parseDate(entry?.start_time);
        const end = parseDate(entry?.end_time);

        return {
          entry,
          start,
          end,
        };
      })
      .filter(({ start, end }) => {
        return start && end && end >= start;
      })
      .sort((a, b) => {
        return a.start.getTime() - b.start.getTime();
      });

    if (!parsedEntries.length) {
      return [];
    }

    const parsedDayStart = dayStart
      ? parseDate(dayStart)
      : null;

    const timelineStart =
      parsedDayStart ?? parsedEntries[0].start;

    const totalMinutes = hours * 60;

    const result = [];

    let cursor = timelineStart;

    parsedEntries.forEach(({ entry, start, end }) => {
      /*
       * Jeśli wpis zaczyna się przed początkiem osi,
       * nie dodajemy ujemnej przerwy.
       */
      const visibleStart =
        start < timelineStart
          ? timelineStart
          : start;

      const gap = diffMinutes(cursor, visibleStart);

      if (gap > 0) {
        result.push({
          type: "gap",
          minutes: gap,
        });
      }

      const entryMinutes = diffMinutes(
        visibleStart,
        end
      );

      if (entryMinutes > 0) {
        result.push({
          type: "entry",
          entry,
          minutes: entryMinutes,
        });
      }

      /*
       * Nie cofamy kursora przy nachodzących
       * na siebie wpisach.
       */
      if (end > cursor) {
        cursor = end;
      }
    });

    return result.map((item) => ({
      ...item,
      width: `${Math.min(
        100,
        (item.minutes / totalMinutes) * 100
      )}%`,
    }));
  }, [data, hours, dayStart]);

  return (
    <Box
      sx={{
        width: "100%",
        height,
        display: "flex",
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "grey.200",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {items.map((item, index) => {
        if (item.type === "gap") {
          return (
            <Box
              key={`gap-${index}`}
              sx={{
                width: item.width,
                height: "100%",
                backgroundColor: "grey.100",
                flexShrink: 0,
              }}
            />
          );
        }

        const { entry } = item;

        return (
          <Tooltip
            key={entry.id ?? `entry-${index}`}
            arrow
            placement="top"
            title={
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  {entry.processName}
                  {entry.task ? ` - ${entry.task}` : ""}
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                >
                  {formatTime(entry.start_time)}
                  {"–"}
                  {formatTime(entry.end_time)}
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                >
                  Czas: {entry.duration_decimal ?? "—"}h
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                >
                  Ilość: {entry.qty ?? "—"}
                </Typography>

                {entry.remarks && (
                  <Typography
                    variant="caption"
                    display="block"
                  >
                    Uwagi: {entry.remarks}
                  </Typography>
                )}
              </Box>
            }
          >
            <Box
              sx={{
                width: item.width,
                height: "100%",
                minWidth: 4,
                flexShrink: 0,

                backgroundColor: entry.is_repair
                  ? "warning.main"
                  : "primary.main",

                borderRight:
                  "1px solid rgba(255,255,255,0.55)",

                cursor: "pointer",

                transition: "filter 120ms ease",

                "&:hover": {
                  filter: "brightness(0.9)",
                },
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default LogsTodayProgress;