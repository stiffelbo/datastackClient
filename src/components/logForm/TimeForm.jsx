import React, { useEffect, useState, useRef } from "react";
import { Box, Stack, TextField, Typography } from "@mui/material";

// --- utils

function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

function parseHHMM(value) {
    if (!value || value.length !== 4) return null;

    const h = Number(value.slice(0, 2));
    const m = Number(value.slice(2, 4));

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

// --- component

const TimeForm = ({
    value = {},
    onChange,
    label = "Czas",
    dense = true,
}) => {
    const [date, setDate] = useState(value.date ?? todayISO());
    const [start, setStart] = useState(value.start ?? "");
    const [end, setEnd] = useState(value.end ?? "");
    const [duration, setDuration] = useState(value.duration ?? "");


    const lastValueRef = useRef(null);

    //Props Value effect
    useEffect(() => {
        const nextDate = value?.date ?? todayISO();
        const nextStart = value?.start ?? "";
        const nextEnd = value?.end ?? "";
        const nextDuration = value?.duration ?? "";

        setDate((prev) => (prev === nextDate ? prev : nextDate));
        setStart((prev) => (prev === nextStart ? prev : nextStart));
        setEnd((prev) => (prev === nextEnd ? prev : nextEnd));
        setDuration((prev) => {
            const prevNormalized = prev === null || prev === undefined ? "" : String(prev);
            const nextNormalized =
                nextDuration === null || nextDuration === undefined ? "" : String(nextDuration);

            return prevNormalized === nextNormalized ? prev : nextDuration;
        });
    }, [value?.date, value?.start, value?.end, value?.duration]);

    //Converter
    useEffect(() => {
        if (typeof onChange !== "function") return;

        const nextValue = {
            date,
            start,
            end,
            duration: duration === "" ? null : Number(duration),
        };

        const prevValue = lastValueRef.current;

        const isSame =
            prevValue &&
            prevValue.date === nextValue.date &&
            prevValue.start === nextValue.start &&
            prevValue.end === nextValue.end &&
            prevValue.duration === nextValue.duration;

        if (isSame) return;

        lastValueRef.current = nextValue;

        onChange(nextValue);
    }, [date, start, end, duration, onChange]);

    // handlers

    const handleStart = (v) => {
        setStart(v);

        if (v.length === 4 && end.length === 4) {
            setDuration(calcDuration(v, end));
        }
    };

    const handleEnd = (v) => {
        setEnd(v);

        if (start.length === 4 && v.length === 4) {
            setDuration(calcDuration(start, v));
        }
    };

    const handleDuration = (v) => {
        setDuration(v);

        const s = parseHHMM(start);
        if (s != null && v !== "") {
            const e = s + Number(v);
            setEnd(formatHHMM(e));
        }
    };

    const size = dense ? "small" : "medium";

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
            }}
        >
            <Stack spacing={2} direction={"row"}>
                {/* DATA */}
                <TextField
                    type="date"
                    size={size}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />


                <TextField
                    label="Start"
                    value={start}
                    size={size}
                    inputProps={{ maxLength: 4 }}
                    onChange={(e) => handleStart(e.target.value)}
                    placeholder="0800"
                    fullWidth
                />

                <TextField
                    label="Koniec"
                    value={end}
                    size={size}
                    inputProps={{ maxLength: 4 }}
                    onChange={(e) => handleEnd(e.target.value)}
                    placeholder="1630"
                    fullWidth
                />


                {/* DURATION */}
                <TextField
                    label="Czas (h)"
                    type="number"
                    size={size}
                    value={duration}
                    onChange={(e) => handleDuration(e.target.value)}
                    inputProps={{ step: 0.25, min: 0 }}
                    fullWidth
                />
            </Stack>
        </Box>
    );
};

export default TimeForm;