import React from "react";
import { Box, Stack, TextField } from "@mui/material";

// --- utils

function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

function parseHHMM(value) {
    if (!value || value.length !== 4) return null;

    const h = Number(value.slice(0, 2));
    const m = Number(value.slice(2, 4));

    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    if (h > 23 || m > 59) return null;

    return h + m / 60;
}

function formatHHMM(decimal) {
    if (decimal == null) return "";

    const h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);

    return `${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}`;
}

function calcDuration(start, end) {
    const s = parseHHMM(start);
    const e = parseHHMM(end);

    if (s == null || e == null) return "";

    const diff = e - s;
    if (diff < 0) return "";

    return Number(diff.toFixed(2));
}

function normalizeDuration(value) {
    if (value === "" || value === null || value === undefined) {
        return "";
    }

    return value;
}

function toPayloadDuration(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    return Number(value);
}

// --- component

const TimeForm = ({
    value = {},
    onChange,
    label = "Czas",
    dense = true,
    disabled = false,
    sx = {},
}) => {
    const date = value?.date ?? todayISO();
    const start = value?.start ?? "";
    const end = value?.end ?? "";
    const duration = normalizeDuration(value?.duration);

    const size = dense ? "small" : "medium";
    const borderColor = duration ? "divider" : "error.main";

    console.count('Time Form render');

    const emit = (patch) => {
        if (typeof onChange !== "function") return;

        const nextValue = {
            date,
            start,
            end,
            duration,
            ...patch,
        };

        onChange({
            ...nextValue,
            duration: toPayloadDuration(nextValue.duration),
        });
    };

    const handleDate = (v) => {
        emit({
            date: v,
        });
    };

    const handleStart = (v) => {
        const nextDuration =
            v.length === 4 && end.length === 4
                ? calcDuration(v, end)
                : duration;

        emit({
            start: v,
            duration: nextDuration,
        });
    };

    const handleEnd = (v) => {
        const nextDuration =
            start.length === 4 && v.length === 4
                ? calcDuration(start, v)
                : duration;

        emit({
            end: v,
            duration: nextDuration,
        });
    };

    const handleDuration = (v) => {
        const s = parseHHMM(start);

        const nextEnd =
            s != null && v !== ""
                ? formatHHMM(s + Number(v))
                : end;

        emit({
            duration: v,
            end: nextEnd,
        });
    };

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor,
                borderRadius: 2,
                p: 2,
                ...sx,
            }}
        >
            <Stack spacing={2} direction="row">
                <TextField
                    type="date"
                    size={size}
                    value={date}
                    onChange={(e) => handleDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled={disabled}
                />

                <TextField
                    label="Start"
                    value={start}
                    size={size}
                    inputProps={{ maxLength: 4 }}
                    onChange={(e) => handleStart(e.target.value)}
                    placeholder="0800"
                    fullWidth
                    disabled={disabled}
                />

                <TextField
                    label="Koniec"
                    value={end}
                    size={size}
                    inputProps={{ maxLength: 4 }}
                    onChange={(e) => handleEnd(e.target.value)}
                    placeholder="1630"
                    fullWidth
                    disabled={disabled}
                />

                <TextField
                    label="Czas (h)"
                    type="number"
                    size={size}
                    value={duration}
                    onChange={(e) => handleDuration(e.target.value)}
                    inputProps={{ step: 0.25, min: 0 }}
                    fullWidth
                    disabled={disabled}
                />
            </Stack>
        </Box>
    );
};

export default TimeForm;