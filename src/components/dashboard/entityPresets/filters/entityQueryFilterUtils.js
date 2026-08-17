export const FILTER_OPERATOR_MULTI_SELECT = "multiSelect";
export const FILTER_OPERATOR_BETWEEN = "between";

export const FILTER_OPERATORS_WITHOUT_VALUE = [
    "isEmpty",
    "notEmpty",
    "isTrue",
    "isFalse",
    "isPast",
    "isFuture",
];

export const operatorsByType = {
    string: [
        "multiSelect",
        "contains",
        "equals",
        "notEquals",
        "startsWith",
        "endsWith",
        "isEmpty",
        "notEmpty",
    ],

    number: [
        "equals",
        "notEquals",
        "gt",
        "gte",
        "lt",
        "lte",
        "between",
        "isEmpty",
        "notEmpty",
    ],

    date: [
        "between",
        "isPast",
        "isFuture",
        "isEmpty",
        "notEmpty",
    ],

    boolean: [
        "isTrue",
        "isFalse",
        "isEmpty",
        "notEmpty",
    ],

    fk: [
        "multiSelect",
    ],
};

export const normalizeFilterFieldType = (type) => {
    const normalizedType = String(type ?? "string").trim().toLowerCase();

    if (["int", "integer", "float", "double", "decimal"].includes(normalizedType)) {
        return "number";
    }

    if (["datetime", "timestamp"].includes(normalizedType)) {
        return "date";
    }

    if (["bool"].includes(normalizedType)) {
        return "boolean";
    }

    if (["foreignkey", "foreign_key", "relation"].includes(normalizedType)) {
        return "fk";
    }

    if (operatorsByType[normalizedType]) {
        return normalizedType;
    }

    return "string";
};

export const normalizeFilterOperator = (operator) => {
    if (typeof operator === "string") {
        return operator.trim();
    }

    return String(
        operator?.value ??
        operator?.name ??
        operator?.operator ??
        ""
    ).trim();
};

export const getFilterOperatorLabel = (operator) => {
    if (typeof operator === "string") {
        return operator;
    }

    return String(
        operator?.label ??
        operator?.title ??
        operator?.value ??
        operator?.name ??
        operator?.operator ??
        ""
    ).trim();
};

export const getFilterFieldName = (field) => {
    return String(field?.name ?? "").trim();
};

export const getFilterFieldLabel = (field) => {
    return String(
        field?.label ??
        field?.title ??
        field?.name ??
        ""
    ).trim();
};

export const normalizeFilterableFields = (fields) => {
    if (!Array.isArray(fields)) {
        return [];
    }

    return fields.filter((field) => getFilterFieldName(field) !== "");
};

export const getFilterField = (fields, fieldName) => {
    const normalizedFieldName = String(fieldName ?? "").trim();

    return normalizeFilterableFields(fields).find((field) => {
        return getFilterFieldName(field) === normalizedFieldName;
    }) ?? null;
};

export const getFilterFieldOperators = (field) => {
    if (!field) {
        return [];
    }

    if (Array.isArray(field.operators)) {
        return field.operators
            .map(normalizeFilterOperator)
            .filter((operator) => operator !== "");
    }

    const fieldType = normalizeFilterFieldType(field.type);

    return operatorsByType[fieldType] ?? operatorsByType.string;
};

export const getDefaultFilterValue = (operator) => {
    const normalizedOperator = normalizeFilterOperator(operator);

    if (normalizedOperator === FILTER_OPERATOR_BETWEEN) {
        return {
            from: "",
            to: "",
        };
    }

    if (normalizedOperator === FILTER_OPERATOR_MULTI_SELECT) {
        return {
            include: [],
            exclude: [],
        };
    }

    if (FILTER_OPERATORS_WITHOUT_VALUE.includes(normalizedOperator)) {
        return null;
    }

    return "";
};

export const createEntityFilterId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const createEntityFilter = (field) => {
    const operators = getFilterFieldOperators(field);
    const operator = operators[0] ?? "";

    return {
        id: createEntityFilterId(),
        field: getFilterFieldName(field),
        op: operator,
        value: getDefaultFilterValue(operator),
    };
};

export const normalizeBetweenFilterValue = (value) => {
    if (Array.isArray(value)) {
        return {
            from: value[0] ?? "",
            to: value[1] ?? "",
        };
    }

    if (value && typeof value === "object") {
        return {
            from: value.from ?? value.min ?? "",
            to: value.to ?? value.max ?? "",
        };
    }

    return {
        from: "",
        to: "",
    };
};

export const normalizeMultiSelectFilterValue = (value) => {
    const include = Array.isArray(value?.include)
        ? Array.from(new Set(value.include))
        : [];

    const exclude = Array.isArray(value?.exclude)
        ? Array.from(new Set(value.exclude)).filter((item) => !include.includes(item))
        : [];

    return {
        include,
        exclude,
    };
};

export const normalizeEntityFilterValue = (operator, value) => {
    const normalizedOperator = normalizeFilterOperator(operator);

    if (normalizedOperator === FILTER_OPERATOR_BETWEEN) {
        return normalizeBetweenFilterValue(value);
    }

    if (normalizedOperator === FILTER_OPERATOR_MULTI_SELECT) {
        return normalizeMultiSelectFilterValue(value);
    }

    if (FILTER_OPERATORS_WITHOUT_VALUE.includes(normalizedOperator)) {
        return null;
    }

    return value ?? "";
};

export const normalizeEntityFilter = (filter, fields = []) => {
    if (!filter || typeof filter !== "object") {
        return null;
    }

    const field = getFilterField(fields, filter.field);
    const fieldName = getFilterFieldName(field) || String(filter.field ?? "").trim();
    const availableOperators = field ? getFilterFieldOperators(field) : [];
    const requestedOperator = normalizeFilterOperator(filter.op);

    const operator = availableOperators.includes(requestedOperator)
        ? requestedOperator
        : availableOperators[0] ?? requestedOperator;

    return {
        id: filter.id ?? createEntityFilterId(),
        field: fieldName,
        op: operator,
        value: normalizeEntityFilterValue(operator, filter.value),
    };
};

export const normalizeEntityFilters = (filters, fields = []) => {
    if (!Array.isArray(filters)) {
        return [];
    }

    return filters
        .map((filter) => normalizeEntityFilter(filter, fields))
        .filter(Boolean);
};

export const changeEntityFilterField = (filter, field) => {
    const nextFilter = createEntityFilter(field);

    return {
        ...nextFilter,
        id: filter?.id ?? nextFilter.id,
    };
};

export const changeEntityFilterOperator = (filter, operator) => {
    const normalizedOperator = normalizeFilterOperator(operator);

    return {
        ...filter,
        op: normalizedOperator,
        value: getDefaultFilterValue(normalizedOperator),
    };
};

export const changeEntityFilterValue = (filter, value) => {
    return {
        ...filter,
        value: normalizeEntityFilterValue(filter?.op, value),
    };
};

export const getFilterId = (filter) => {
    return filter?.id ?? null;
};

export const replaceEntityFilter = (filters, filterId, nextFilter) => {
    return filters.map((filter) => {
        if (String(getFilterId(filter)) !== String(filterId)) {
            return filter;
        }

        return nextFilter;
    });
};

export const removeEntityFilter = (filters, filterId) => {
    return filters.filter((filter) => {
        return String(getFilterId(filter)) !== String(filterId);
    });
};