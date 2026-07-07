import React, { useMemo } from "react";
import { Box, Tooltip, Typography } from "@mui/material";

const parseDate = (value) => new Date(value.replace(" ", "T"));

const diffMinutes = (start, end) => {
  return Math.max(0, (end.getTime() - start.getTime()) / 60000);
};

const formatTime = (value) => {
  return parseDate(value).toLocaleTimeString("pl-PL", {
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
    if (!data.length) return [];

    const sorted = [...data].sort(
      (a, b) => parseDate(a.start_time) - parseDate(b.start_time)
    );

    const timelineStart = dayStart
      ? parseDate(dayStart)
      : parseDate(sorted[0].start_time);

    const totalMinutes = hours * 60;

    const result = [];
    let cursor = timelineStart;

    sorted.forEach((entry) => {
      const start = parseDate(entry.start_time);
      const end = parseDate(entry.end_time);

      const gap = diffMinutes(cursor, start);

      if (gap > 0) {
        result.push({
          type: "gap",
          minutes: gap,
        });
      }

      result.push({
        type: "entry",
        entry,
        minutes: diffMinutes(start, end),
      });

      cursor = end;
    });

    return result.map((item) => ({
      ...item,
      width: `${(item.minutes / totalMinutes) * 100}%`,
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
              }}
            />
          );
        }

        const { entry } = item;

        return (
          <Tooltip
            key={entry.id}
            arrow
            placement="top"
            title={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {entry.processName} {entry.task ? ' - ' : ''} {entry.task}
                </Typography>

                <Typography variant="caption" display="block">
                  {formatTime(entry.start_time)}–{formatTime(entry.end_time)}
                </Typography>

                <Typography variant="caption" display="block">
                  Czas: {entry.duration_decimal}h
                </Typography>

                <Typography variant="caption" display="block">
                  Ilość: {entry.qty}
                </Typography>

                {entry.remarks && (
                  <Typography variant="caption" display="block">
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
                backgroundColor: entry.is_repair ? "warning.main" : "primary.main",
                borderRight: "1px solid rgba(255,255,255,0.55)",
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