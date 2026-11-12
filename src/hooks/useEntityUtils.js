/**
 * useEntity hook
 * @param {Object} params
 * @param {string} params.endpoint - base endpoint path, e.g. 'periods_structures_costs' (without leading slash)
 * @param {string} [params.entityName] - optional friendly name for messages
 * @param {Function} [params.processRows] - optional: (rows) => processedRows, called once after fetchRows
 */

/* --- domyślne nazwy endpointów (tylko getEntitySchema domyślnie dostępny) --- */
export const defaultEndpoints = {
    getEntitySchema: 'getEntitySchema.php',
    get: 'get.php',
    getChanges: 'getChanges.php',
};

/* --- UI schema domyślny --- */
// default shape, for safety
export const defaultSchema = {
    addForm: { schema: [], label: '' },
    editForm: { schema: [], label: '' },
    bulkEditForm: { schema: [], label: '' },
    bulkCopyForm: { schema: [], label: '' },
    columns: [],
    filterableFields: [],
    endpoints: {},
    relations: {},
    options: {},      // { [fieldName]: Option[] }
    relatedItems: {},      // { [fieldName]: Item[] }
    importSchema: [],
    heightSpan: 85,
    access: {},
};

function normalizeSelectOptions(options = []) {
    if (!Array.isArray(options)) return [];

    return options.map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
            const value = item.value ?? item.id ?? "";

            return {
                value,
                label: item.label ?? item.val ?? String(value ?? ""),
                title: item.title ?? null,
                disabled: Boolean(item.disabled ?? false),
                group: String(item.group ?? item.groupLabel ?? ""),
                description: String(item.description ?? ""),
                params: normalizeParams(item.params),
            };
        }

        return {
            value: item,
            label: String(item ?? ""),
            title: null,
            disabled: false,
            group: "",
            description: "",
            params: {},
        };
    });
}

function normalizeParams(params) {
    if (params === null || params === undefined) {
        return {};
    }

    if (Array.isArray(params)) {
        return params;
    }

    if (typeof params === "object") {
        return params;
    }

    if (typeof params === "string") {
        try {
            const parsed = JSON.parse(params);

            return parsed !== null && typeof parsed === "object"
                ? parsed
                : {};
        } catch {
            return {};
        }
    }

    return {};
}

function addResolvedColumns(schema) {
    const resolve = schema?.resolve && typeof schema.resolve === "object" ? schema.resolve : null;
    if (!resolve || !Array.isArray(schema.columns)) return schema;

    // Szybki lookup istniejących kolumn (żeby nie dublować)
    const existing = new Set(schema.columns.map(c => c?.field).filter(Boolean));

    // Mapowanie: fkField -> column (żeby odziedziczyć headerName/fieldGroup/width)
    const fkColByField = {};
    schema.columns.forEach(c => {
        if (c && typeof c === "object" && c.field) fkColByField[c.field] = c;
    });

    const newCols = [];

    Object.keys(resolve).forEach((fkField) => {
        const r = resolve[fkField];
        if (!r || typeof r !== "object") return;

        const as = r.as;
        if (!as || typeof as !== "string") return;

        // jeśli FK kolumna nie istnieje (np. access ją wyciął) -> nie dodajemy label
        const fkCol = fkColByField[fkField];
        if (!fkCol) return;

        // jeśli label już istnieje -> skip
        if (existing.has(as)) return;

        // budujemy nową kolumnę label
        newCols.push({
            field: as,
            headerName: (r.resolveAs && typeof r.resolveAs === "string" && r.resolveAs.trim() !== "")
                ? r.resolveAs
                : `${fkCol.headerName} (label)`,
            fieldGroup: fkCol.fieldGroup ?? null,
            type: "string",
            input: "text",
            editable: false,
            width: Math.max(120, (fkCol.width ?? 120)),
            aggregation: "",
            formatterKey: "",
            // pomocniczo: żeby intake processor wiedział skąd brać value
            resolvedFrom: fkField,
        });
    });

    if (newCols.length > 0) {
        schema.columns = [...schema.columns, ...newCols];
    }

    return schema;
}

export function processResolvedFields(schema, rows) {
    if (!schema || !Array.isArray(rows)) return rows;

    const resolve = schema.resolve && typeof schema.resolve === "object" ? schema.resolve : null;
    if (!resolve) return rows;

    // budujemy mapę fkField -> { as, optionsMap }
    const fkColByField = {};
    (schema.columns || []).forEach((c) => {
        if (c && c.field) fkColByField[c.field] = c;
    });

    const rules = [];
    Object.keys(resolve).forEach((fkField) => {
        const r = resolve[fkField];
        if (!r || !r.as) return;

        const fkCol = fkColByField[fkField];
        // prefer optionsMap z kolumny FK (bo organizeSchema już to buduje)
        const optionsMap = fkCol?.optionsMap || null;

        rules.push({
            fkField,
            as: r.as,
            optionsMap,
        });
    });

    if (rules.length === 0) return rows;

    return rows.map((row) => {
        if (!row || typeof row !== "object") return row;

        const out = { ...row };

        for (const rule of rules) {
            const { fkField, as, optionsMap } = rule;

            // jeśli backend już zwrócił label (np. JOIN) - nie nadpisujemy
            if (out[as] != null && out[as] !== "") continue;

            const fkVal = out[fkField];
            if (fkVal == null || fkVal === "") continue;

            if (optionsMap && Object.prototype.hasOwnProperty.call(optionsMap, fkVal)) {
                out[as] = optionsMap[fkVal];
            }
        }

        return out;
    });
}

/**
 * Inject options into add/bulk forms & columns based on your rules.
 * - addForm/bulkForm: if type === 'select' AND selectOptions is an empty array, fill it from options[name].
 * - columns: if input === 'select' AND editable === true, set selectOptions from options[field]
 *            (create selectOptions if it doesn't exist).
 */
export const selectInputs = new Set(['select', 'select-object', 'select-multiple']);

export function organizeSchema(input = defaultSchema) {
    const optionWarnings = [];

    const warnOption = (scope, field, value) => {
        optionWarnings.push({
            scope,
            field,
            value,
        });
    };

    const schema = {
        ...defaultSchema,
        ...input,
        addForm: { ...(defaultSchema.addForm || {}), ...(input.addForm || {}) },
        editForm: { ...(defaultSchema.editForm || {}), ...(input.editForm || {}) },
        bulkEditForm: { ...(defaultSchema.bulkEditForm || {}), ...(input.bulkEditForm || {}) },
        bulkCopyForm: { ...(defaultSchema.bulkCopyForm || {}), ...(input.bulkCopyForm || {}) },
    };

    if(input?.dataGrid?.columns){
        schema.columns = [...input.dataGrid.columns];
    }

    const rawOptionsDict = schema.options && typeof schema.options === "object"
        ? schema.options
        : {};

    const optionsDict = Object.fromEntries(
        Object.entries(rawOptionsDict).map(([key, options]) => [
            key,
            normalizeSelectOptions(options),
        ])
    );

    const getDictOptions = (key, scope = 'unknown') => {
        const opts = optionsDict?.[key];

        if (opts === undefined) {
            return null;
        }

        if (!Array.isArray(opts)) {
            warnOption(scope, key, opts);
            return null;
        }
        return opts;
    };

    function buildOptionsMap(options = []) {
        return Object.fromEntries(
            normalizeSelectOptions(options).map((option) => [
                option.value,
                option.label,
            ])
        );
    }

    const resolveFieldOptions = (item) => {
        if (!item || typeof item !== 'object') return item;

        const name = item.name;
        const input = item.input ?? item.type;

        if (!selectInputs.has(input) || !name) {
            return item;
        }

        // priorytet 1: własne selectOptions z pola
        if (Array.isArray(item.selectOptions) && item.selectOptions.length) {
            return { ...item, selectOptions: normalizeSelectOptions(item.selectOptions) };
        }

        // priorytet 2: własne options z pola
        if (Array.isArray(item.options)) {
            return {
                ...item,
                selectOptions: normalizeSelectOptions(item.options),
            };
        }

        // priorytet 3: słownik schema.options[name], ale tylko array
        const dictOptions = getDictOptions(name);

        if (Array.isArray(dictOptions)) {
            return {
                ...item,
                selectOptions: dictOptions,
            };
        }

        return item;
    };

    const resolveColumnOptions = (col) => {
        if (!col || typeof col !== 'object') return col;

        const field = col.field;
        const input = col.input ?? col.type;

        if (!selectInputs.has(input) || !field) {
            return col;
        }

        let resolvedOptions = null;

        // priorytet 1: własne options z kolumny
        if (Array.isArray(col.options) && col.options.length) {
            resolvedOptions = normalizeSelectOptions(col.options);
        }

        // priorytet 2: własne selectOptions z kolumny
        else if (Array.isArray(col.selectOptions)) {
            resolvedOptions = normalizeSelectOptions(col.selectOptions);
        }

        // priorytet 3: słownik
        else {
            resolvedOptions = getDictOptions(field);
        }

        if (!Array.isArray(resolvedOptions)) {
            return col;
        }

        return {
            ...col,
            options: resolvedOptions,
            optionsMap: buildOptionsMap(resolvedOptions),
        };
    };

    const resolveForm = (form) => {
        if (!Array.isArray(form?.schema)) return form;

        return {
            ...form,
            schema: form.schema.map(resolveFieldOptions),
        };
    };

    schema.addForm = resolveForm(schema.addForm);
    schema.editForm = resolveForm(schema.editForm);
    schema.bulkEditForm = resolveForm(schema.bulkEditForm);
    schema.bulkCopyForm = resolveForm(schema.bulkCopyForm);

    if (Array.isArray(schema.columns)) {
        schema.columns = schema.columns.map(resolveColumnOptions);
    }

    addResolvedColumns(schema);

    return schema;
}

export function toFormData(payload) {
    const formData = new FormData();

    Object.entries(payload || {}).forEach(([key, value]) => {
        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item instanceof File || item instanceof Blob) {
                    formData.append(`${key}[]`, item);
                } else if (item instanceof Date) {
                    formData.append(`${key}[]`, item.toISOString());
                } else if (typeof item === 'object' && item !== null) {
                    formData.append(`${key}[]`, JSON.stringify(item));
                } else {
                    formData.append(`${key}[]`, item != null ? String(item) : '');
                }
            });
            return;
        }

        if (value instanceof Date) {
            formData.append(key, value.toISOString());
            return;
        }

        if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
            return;
        }

        if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
            return;
        }

        formData.append(key, value != null ? String(value) : '');
    });

    return formData;
};

export const mergeEntityChanges = (rows = [], upsert = [], remove = []) => {
    const removeIds = new Set(remove.map(String));
    const upsertById = new Map(upsert.map(row => [String(row.id), row]));
    const existingIds = new Set();

    const merged = [];

    for (const row of rows) {
        const id = String(row.id);

        if (removeIds.has(id)) continue;

        if (upsertById.has(id)) {
            merged.push(upsertById.get(id));
            upsertById.delete(id);
        } else {
            merged.push(row);
        }

        existingIds.add(id);
    }

    return [...upsertById.values(), ...merged];
};
