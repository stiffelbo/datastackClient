import { getTimeFromLastEntry } from "../utils";

function toMinutes(time) {
    if (!time || typeof time !== "string") return null;

    const [h, m, s = "0"] = time.split(":");
    const hours = Number(h);
    const minutes = Number(m);
    const seconds = Number(s);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes) ||
        !Number.isFinite(seconds)
    ) {
        return null;
    }

    return hours * 60 + minutes + Math.round(seconds / 60);
}

function fromMinutes(totalMinutes) {
    if (!Number.isFinite(totalMinutes)) return null;

    const minutesInDay = 24 * 60;
    const normalized = ((Math.round(totalMinutes) % minutesInDay) + minutesInDay) % minutesInDay;

    const h = Math.floor(normalized / 60);
    const m = normalized % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getValidRcp(rcp = []) {
    if (!Array.isArray(rcp)) return [];

    return rcp
        .filter((item) => Number(item?.pomin ?? 0) === 0)
        .filter((item) => toMinutes(item?.godzina) !== null)
        .sort((a, b) => toMinutes(a.godzina) - toMinutes(b.godzina));
}

function getRcpStart(rcp = []) {
    const rows = getValidRcp(rcp);
    return rows.length ? rows[0].godzina : null;
}

function getRcpEnd(rcp = []) {
    const rows = getValidRcp(rcp);
    return rows.length >= 2 ? rows[rows.length - 1].godzina : null;
}

function getFTEEnd(rcp = [], fte = 1) {
    const start = getRcpStart(rcp);
    const startMinutes = toMinutes(start);

    if (startMinutes === null) return null;

    const fteNumber = Number(fte);

    if (!Number.isFinite(fteNumber) || fteNumber <= 0) return null;

    const workMinutes = 8 * 60 * Math.min(fteNumber, 1);

    return fromMinutes(startMinutes + workMinutes);
}

export function brigadeEmployeesDto(data) {
    if (!Array.isArray(data)) return [];

    return data.map((item) => {
        const details = item?.details ?? {};
        return {
            id: details.id ?? item?.employee_id ?? null,
            brigadeId: item?.brigade_id ?? null,
            structureId: details?.structure_id ?? null,
            firstName: details?.first_name ?? "",
            lastName: details?.last_name ?? "",
            fullName: `${details?.first_name ?? ""} ${details?.last_name ?? ""}`.trim(),
            email: details?.email ?? "",
            active: details?.is_active === 1 || details?.is_active === "1" || details?.is_active === true,
            //placeholders for reporting
            time: getTimeFromLastEntry(details?.lastEntryToday),
            isSelected: data.length === 1,
            rcpStart: getRcpStart(details.rcp),
            rcpEnd: getRcpEnd(details.rcp),
            rcpConn: details.rcpConn,
            fteEnd: getFTEEnd(details.rcp, details.fte),
        };
    }).filter((item) => item.id);
}