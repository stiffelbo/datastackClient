import React from "react";
import { Box, Stack, TextField, Button } from "@mui/material";

// --- utils

function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

function nowHHMM() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
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

function validateTimeValue(value) {
    const errors = {};

    if (!value.date) {
        errors.date = "Data jest wymagana";
    }

    if (value.start !== "" && parseHHMM(value.start) === null) {
        errors.start = "Nieprawidłowy format godziny startu";
    }

    if (value.end !== "" && parseHHMM(value.end) === null) {
        errors.end = "Nieprawidłowy format godziny końca";
    }

    if (
        value.duration !== "" &&
        value.duration !== null &&
        value.duration !== undefined
    ) {
        const durationNumber = Number(value.duration);

        if (!Number.isFinite(durationNumber) || durationNumber < 0) {
            errors.duration = "Nieprawidłowy czas";
        }
    }

    const parsedStart = parseHHMM(value.start);
    const parsedEnd = parseHHMM(value.end);

    if (
        parsedStart !== null &&
        parsedEnd !== null &&
        parsedEnd < parsedStart
    ) {
        errors.end = "Godzina końca nie może być wcześniejsza niż start";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

// --- component

const TimeForm = ({
    value = {},
    onChange,
    dense = true,
    disabled = false,
    showStartStop = false,
    sx = {},
}) => {
    const date = value?.date ?? todayISO();
    const start = value?.start ?? "";
    const end = value?.end ?? "";
    const duration = normalizeDuration(value?.duration);
    const valid = value?.valid;
    const errors = value?.errors || {};

    const size = dense ? "small" : "medium";
    const borderColor = duration ? "divider" : "error.main";

    const emit = (patch) => {
        if (typeof onChange !== "function") return;

        const nextValue = {
            date,
            start,
            end,
            duration,
            ...patch,
        };

        const normalizedValue = {
            ...nextValue,
            duration: toPayloadDuration(nextValue.duration),
        };

        const validation = validateTimeValue(nextValue);

        onChange({
            ...normalizedValue,
            valid: validation.valid,
            errors: validation.errors,
        });
    };

    const handleDate = (v) => {
        emit({ date: v });
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

    const handleStartNow = () => {
        emit({
            date: todayISO(),
            start: nowHHMM(),
            end: "",
            duration: "",
        });
    };

    const handleStopNow = () => {
        const nextEnd = nowHHMM();
        const nextDuration =
            start.length === 4
                ? calcDuration(start, nextEnd)
                : "";

        emit({
            end: nextEnd,
            duration: nextDuration,
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
            <Stack spacing={1.5}>
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
                        inputProps={{
                            maxLength: 4,
                            inputMode: "numeric",
                        }}
                        onChange={(e) => handleStart(e.target.value)}
                        placeholder="0800"
                        error={Boolean(errors.start)}
                        helperText={errors.start ?? " "}
                        fullWidth
                        disabled={disabled}
                    />

                    <TextField
                        label="Koniec"
                        value={end}
                        size={size}
                        inputProps={{
                            maxLength: 4,
                            inputMode: "numeric",
                        }}
                        onChange={(e) => handleEnd(e.target.value)}
                        placeholder="1630"
                        error={Boolean(errors.end)}
                        helperText={errors.end ?? " "}
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
                        error={Boolean(errors.duration)}
                        helperText={errors.duration ?? " "}
                        fullWidth
                        disabled={disabled}
                    />
                </Stack>

                {showStartStop && (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            onClick={handleStartNow}
                            disabled={disabled}
                        >
                            Start
                        </Button>

                        <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={handleStopNow}
                            disabled={disabled || !start}
                        >
                            Stop
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Box>
    );
};

export default TimeForm;