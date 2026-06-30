// viewConfigUtils.js

const toNum = (v) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
};

const toTrimmed = (v) => {
    if (v === null || v === undefined) return undefined;
    const s = String(v).trim();
    return s === '' ? undefined : s;
};

const toBoolDefault = (v, def = false) =>
    typeof v === 'boolean' ? v : def;

const toPageSize = (v, def = 200) => {
  const n = toNum(v);
  return [100, 200, 500, 1000].includes(n) ? n : def;
};

export const createViewConfig = ({
    treeConfig = {},
    tableConfig = {},
} = {}) => ({
    table: {
        rowHeight: tableConfig?.rowHeight ?? 45,
        fontSize: tableConfig?.fontSize ?? '13px',
        pageSize: tableConfig?.pageSize ?? 200,
    },

    tree: {
        enabled: treeConfig?.enabled ?? false,
        canDisable: treeConfig?.canDisable ?? true,
        parentField: treeConfig?.parentField ?? 'parent_id',
        idField: treeConfig?.idField ?? 'id',
        rootValue: treeConfig?.rootValue ?? null,
    },
});

export const normalizeViewConfig = (value = {}, defaults = {}) => {
    const base = createViewConfig(defaults);

    return {
        table: {
            rowHeight: toNum(value.table?.rowHeight) ?? base.table.rowHeight,
            fontSize: toTrimmed(value.table?.fontSize) ?? base.table.fontSize,
            pageSize: toPageSize(value.table?.pageSize, base.table.pageSize),
        },

        tree: {
            enabled: toBoolDefault(value.tree?.enabled, base.tree.enabled),
            canDisable: toBoolDefault(value.tree?.canDisable, base.tree.canDisable),
            parentField: toTrimmed(value.tree?.parentField) ?? base.tree.parentField,
            idField: toTrimmed(value.tree?.idField) ?? base.tree.idField,
            rootValue: value.tree?.rootValue ?? base.tree.rootValue,
        },
    };
};
