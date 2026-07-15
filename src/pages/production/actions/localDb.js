const DATABASE_PREFIX = "production-sandbox";

export const TABLES = {
    tasks: "jira_issue_production_tasks",
    relations: "j_i_p_t_relations",
    layouts: "j_i_p_t_flow_layout",
};

const getStorageKey = tableName =>
    `${DATABASE_PREFIX}:${tableName}`;

export const nowIso = () => new Date().toISOString();

export const readTable = tableName => {
    const key = getStorageKey(tableName);
    const raw = localStorage.getItem(key);

    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`Nie udało się odczytać tabeli ${tableName}`, error);
        return [];
    }
};

export const writeTable = (tableName, rows) => {
    const key = getStorageKey(tableName);
    localStorage.setItem(key, JSON.stringify(rows));
};

export const getNextId = rows => {
    if (!rows.length) {
        return 1;
    }

    return Math.max(...rows.map(row => Number(row.id) || 0)) + 1;
};