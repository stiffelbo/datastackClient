const DAY_MS = 24 * 60 * 60 * 1000;

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const parseDate = (value) => {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
};

export const addDays = (value, days) => {
    const date = typeof value === 'string'
        ? parseDate(value)
        : new Date(value);

    date.setDate(date.getDate() + days);

    return formatDate(date);
};

export const getToday = () => {
    return formatDate(new Date());
};

/**
 * Buduje kolejny zakres synchronizacji.
 *
 * Np:
 * start = 2026-01-01
 * intervalDays = 7
 *
 * => 2026-01-01 - 2026-01-07
 */
export const getNextDateRange = ({
    startDate,
    lastDateTo,
    intervalDays,
    today = getToday(),
}) => {
    let dateFrom = startDate;

    if (lastDateTo) {
        dateFrom = addDays(lastDateTo, 1);
    }

    if (dateFrom > today) {
        return null;
    }

    let dateTo = addDays(
        dateFrom,
        intervalDays - 1
    );

    if (dateTo > today) {
        dateTo = today;
    }

    return {
        dateFrom,
        dateTo,
    };
};

/**
 * Czy dany projekt został zsynchronizowany do dzisiaj.
 */
export const isProjectComplete = (
    projectState,
    today = getToday()
) => {
    if (!projectState?.lastDateTo) {
        return false;
    }

    return projectState.lastDateTo >= today;
};

/**
 * Domyślny rekord projektu w localStorage.
 */
export const createProjectState = (
    projectKey
) => ({
    projectKey,
    lastDateTo: null,

    status: 'pending',

    requests: 0,

    totals: {
        found: 0,
        existing: 0,
        created: 0,
        failed: 0,
        linksUpdated: 0,
        linksFailed: 0,
    },

    lastResult: null,
    lastError: null,

    updatedAt: null,
});

/**
 * Tworzy / uzupełnia stan wszystkich projektów.
 */
export const createSyncState = (
    projects,
    currentState = []
) => {
    return projects.map((projectKey) => {
        const existing = currentState.find(
            (item) => item.projectKey === projectKey
        );

        return existing ?? createProjectState(
            projectKey
        );
    });
};

/**
 * Sumuje wynik kolejnego requestu.
 */
export const applySyncResult = (
    projectState,
    result
) => {
    return {
        ...projectState,

        lastDateTo: result.date_to,

        status: 'running',

        requests: (projectState.requests ?? 0) + 1,

        totals: {
            found:
                (projectState.totals?.found ?? 0)
                + (result.found ?? 0),

            existing:
                (projectState.totals?.existing ?? 0)
                + (result.existing ?? 0),

            created:
                (projectState.totals?.created ?? 0)
                + (result.created ?? 0),

            failed:
                (projectState.totals?.failed ?? 0)
                + (result.failed ?? 0),

            linksUpdated:
                (projectState.totals?.linksUpdated ?? 0)
                + (result.links_updated ?? 0),

            linksFailed:
                (projectState.totals?.linksFailed ?? 0)
                + (result.links_failed ?? 0),
        },

        lastResult: result,
        lastError: null,

        updatedAt: new Date().toISOString(),
    };
};