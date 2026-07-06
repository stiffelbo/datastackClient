// productionAllocations.js

export function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

export function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function round2(value) {
    return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

export function round4(value) {
    return Math.round((toNumber(value) + Number.EPSILON) * 10000) / 10000;
}

export function getTaskQuantity(task) {
    return toNumber(task?.report?.quantity);
}

export function getTaskQuantityGood(task) {
    return toNumber(task?.report?.quantityGood);
}

export function getTaskQuantityScrap(task) {
    return toNumber(task?.report?.quantityScrap);
}

export function getTaskDividerFactor(task) {
    return toNumber(task?.report?.dividerFactor);
}

export function getGoodScrapRatios(task) {
    const good = Number(task?.report?.quantityGood || 0);
    const scrap = Number(task?.report?.quantityScrap || 0);
    const total = good + scrap;

    if (!total) {
        return {
            goodRatio: 0,
            scrapRatio: 0,
        };
    }

    return {
        goodRatio: good / total,
        scrapRatio: scrap / total,
    };
}

export function getTaskProductionRatio(task) {
    const good = getTaskQuantityGood(task);
    const scrap = getTaskQuantityScrap(task);
    const total = good + scrap;

    if (total <= 0) {
        return {
            goodRatio: 0,
            scrapRatio: 0,
        };
    }

    return {
        goodRatio: good / total,
        scrapRatio: scrap / total,
    };
}

export function getProductionTaskAllocations(tasks = []) {
    const normalized = safeArray(tasks)
        .map((task) => {
            const quantity = getTaskQuantity(task);
            const quantityGood = getTaskQuantityGood(task);
            const quantityScrap = getTaskQuantityScrap(task);
            const dividerFactor = getTaskDividerFactor(task);

            return {
                task,
                quantity,
                quantityGood,
                quantityScrap,
                dividerFactor,
            };
        })
        .filter((item) => item.dividerFactor > 0);

    const totalDividerFactor = normalized.reduce(
        (sum, item) => sum + item.dividerFactor,
        0
    );

    if (totalDividerFactor <= 0) return [];

    return normalized.map((item) => {
        const ratio = item.dividerFactor / totalDividerFactor;
        const { goodRatio, scrapRatio } = getTaskProductionRatio(item.task);

        return {
            ...item,
            ratio,
            goodRatio,
            scrapRatio,
        };
    });
}

export function timeToMinutes(value) {
    const time = String(value ?? "").padStart(4, "0");

    const hours = Number(time.slice(0, 2));
    const minutes = Number(time.slice(2, 4));

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

    return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}${String(mins).padStart(2, "0")}`;
}

/**
 * Dzieli czas sekwencyjnie po ratio z dividerFactor.
 */
export function splitProductionTimeSequentially(time, allocations = []) {
    const startMinutes = timeToMinutes(time?.start);

    if (startMinutes === null) return [];

    const totalMinutes = Math.round(toNumber(time?.duration) * 60);
    let cursor = startMinutes;

    return safeArray(allocations).map((allocation, index) => {
        const isLast = index === allocations.length - 1;

        const minutes = isLast
            ? startMinutes + totalMinutes - cursor
            : Math.round(totalMinutes * toNumber(allocation.ratio));

        const start = cursor;
        const end = cursor + minutes;

        cursor = end;

        return {
            allocation,
            time: {
                ...time,
                start: minutesToTime(start),
                end: minutesToTime(end),
                duration: round2(minutes / 60),
            },
        };
    });
}

/**
 * Dzieli ilość produkcyjną materiału:
 * materialQty -> task po dividerFactor -> good/scrap.
 */
export function splitProductionMaterialQty(materialQty, allocations = []) {
    const totalQty = toNumber(materialQty);

    return safeArray(allocations).flatMap((allocation) => {
        const taskQty = totalQty * allocation.ratio;

        const goodQty = taskQty * allocation.goodRatio;
        const scrapQty = taskQty * allocation.scrapRatio;

        return [
            {
                task: allocation.task,
                movementType: "produkcja",
                productionType: "good",
                ratio: allocation.ratio,
                productionRatio: allocation.goodRatio,
                qty: round4(goodQty),
            },
            {
                task: allocation.task,
                movementType: "produkcja",
                productionType: "scrap",
                ratio: allocation.ratio,
                productionRatio: allocation.scrapRatio,
                qty: round4(scrapQty),
            },
        ].filter((item) => item.qty > 0);
    });
}

/**
 * Dzieli odpad materiałowy:
 * wasteQty -> task po dividerFactor.
 */
export function splitProductionWasteQty(wasteQty, allocations = []) {
    const totalQty = toNumber(wasteQty);

    return safeArray(allocations)
        .map((allocation) => ({
            task: allocation.task,
            movementType: "odpad",
            productionType: "waste",
            ratio: allocation.ratio,
            productionRatio: null,
            qty: round4(totalQty * allocation.ratio),
        }))
        .filter((item) => item.qty > 0);
}

export function getProductionMaterialAllocations({
    tasks = [],
    materialQty = 0,
    wasteQty = 0,
} = {}) {
    const taskAllocations = getProductionTaskAllocations(tasks);

    return [
        ...splitProductionMaterialQty(materialQty, taskAllocations),
        ...splitProductionWasteQty(wasteQty, taskAllocations),
    ];
}