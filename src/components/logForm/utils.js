export function normalizeTimeValue(value = null) {
    return {
        date: value?.date ?? "",
        start: value?.start ?? "",
        end: value?.end ?? "",
        duration: value?.duration ?? "",
    };
}

export function isSameTime(a = {}, b = {}) {
    return (
        (a?.date ?? "") === (b?.date ?? "") &&
        (a?.start ?? "") === (b?.start ?? "") &&
        (a?.end ?? "") === (b?.end ?? "") &&
        String(a?.duration ?? "") === String(b?.duration ?? "")
    );
}

//make initial time

export function defaultTime() {
    const now = new Date();

    // zaokrąglenie do pełnej godziny (w dół)
    const end = new Date(now);
    end.setMinutes(0, 0, 0);

    // godzina wcześniej
    const start = new Date(end);
    start.setHours(end.getHours() - 1);

    const date = end.toISOString().slice(0, 10);

    function formatHHMM(date) {
        const h = String(date.getHours()).padStart(2, "0");
        const m = String(date.getMinutes()).padStart(2, "0");
        return `${h}${m}`;
    }

    return {
        date,
        start: formatHHMM(start), // "1000"
        end: formatHHMM(end),     // "1100"
        duration: 1,              // godziny dziesiętne
    };
}

export function toNumberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
}

export function toIntOrNull(value) {
    const n = toNumberOrNull(value);
    return n === null ? null : parseInt(n, 10);
}

export function toBool01(value) {
    return value ? 1 : 0;
}

export function toStringOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    return String(value);
}

export function buildDateTimeFromTimeValue(time) {
    const date = time?.date;
    const start = time?.start;
    const end = time?.end;

    function toDateTime(d, hhmm) {
        if (!d || !hhmm || String(hhmm).length !== 4) return null;
        const h = String(hhmm).slice(0, 2);
        const m = String(hhmm).slice(2, 4);
        return `${d} ${h}:${m}:00`;
    }

    return {
        work_date: date ?? null,
        start_time: toDateTime(date, start),
        end_time: toDateTime(date, end),
        duration_decimal: toNumberOrNull(time?.duration),
    };
}