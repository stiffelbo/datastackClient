const EMPTY_ENTITY_QUERY = {
    filters: [],
};

export const createEntityQueryId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return [
        Date.now(),
        Math.random().toString(36).slice(2),
    ].join("-");
};

export const createEmptyEntityQuery = () => {
    return {
        filters: [],
        sort: [],
        limit: null,
    };
};

export const normalizeEntityQueryFilters = (filters) => {
    if (!Array.isArray(filters)) {
        return [];
    }

    return filters
        .filter((filter) => {
            return filter && typeof filter === "object" && !Array.isArray(filter);
        })
        .map((filter) => {
            return {
                ...filter,
                id: filter.id ?? createEntityQueryId(),
                field: typeof filter.field === "string" ? filter.field.trim() : "",
                op: typeof filter.op === "string" ? filter.op.trim() : "",
                value: filter.value ?? null,
            };
        });
};


export const normalizeEntityQuery = (state) => {
    const source = state && typeof state === "object"
        ? state
        : {};

    return {
        ...createEmptyEntityQuery(),
        ...source,
        filters: Array.isArray(source.filters)
            ? source.filters
            : [],
        sort: Array.isArray(source.sort)
            ? source.sort
            : [],
        limit: source.limit ?? null,
    };
};

export const cloneEntityQuery = (query) => {
    const normalizedQuery = normalizeEntityQuery(query);

    if (typeof structuredClone === "function") {
        return structuredClone(normalizedQuery);
    }

    return JSON.parse(JSON.stringify(normalizedQuery));
};

export const getEntityQueryStats = (query) => {
    const normalizedQuery = normalizeEntityQuery(query);
    const filtersCount = normalizedQuery.filters.length;

    return {
        filtersCount,
        hasFilters: filtersCount > 0,
        isEmpty: filtersCount === 0,
    };
};

export const getPresetEntityQuery = (preset) => {
    return normalizeEntityQuery(
        preset?.query ??
        preset?.state ??
        EMPTY_ENTITY_QUERY
    );
};

export const getPresetFiltersCount = (preset) => {
    const query = getPresetEntityQuery(preset);

    return query.filters.length;
};

export const isEntityQueryEmpty = (query) => {
    return getEntityQueryStats(query).isEmpty;
};

export const areEntityQueriesEqual = (firstQuery, secondQuery) => {
    const firstNormalized = normalizeEntityQuery(firstQuery);
    const secondNormalized = normalizeEntityQuery(secondQuery);

    return JSON.stringify(firstNormalized) === JSON.stringify(secondNormalized);
};

export const updateEntityQuerySection = (query, section, value) => {
    const normalizedQuery = normalizeEntityQuery(query);

    if (section === "filters") {
        return {
            ...normalizedQuery,
            filters: normalizeEntityQueryFilters(value),
        };
    }

    throw new Error(`Nieobsługiwana sekcja zapytania: ${section}`);
};

export const sanitizeEntityQueryFilters = (filters) => {
    return normalizeEntityQueryFilters(filters)
        .filter((filter) => {
            return filter.field !== "" && filter.op !== "";
        })
        .map((filter) => {
            const {
                id,
                ...payloadFilter
            } = filter;

            return payloadFilter;
        });
};

export const createEntityQueryPresetPayload = (preset) => {
    const draft = createEntityQueryPresetDraft({ preset });

    return {
        id: draft.id,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        public: draft.public,
        state: {
            ...draft.query,
            filters: sanitizeEntityQueryFilters(draft.query.filters),
        },
    };
};

export const getFilterableFields = (schema) => {
    if (!Array.isArray(schema?.filterableFields)) {
        return [];
    }

    return schema.filterableFields;
};

export const getOptionFieldNames = (filterableFields = []) => {
    if (!Array.isArray(filterableFields)) {
        return [];
    }

    return filterableFields
        .filter((field) => {
            const type = String(field?.type ?? "").toLowerCase();

            return [
                "fk",
                "string",
            ].includes(type);
        })
        .map((field) => field?.name)
        .filter(Boolean);
};

export const makeFilterOptions = ({options = {}, filterableFields = [], schema = {}}) => {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
        return {};
    }

    const columns = Array.isArray(schema?.columns)
        ? schema.columns
        : [];

    return getOptionFieldNames(filterableFields).reduce((result, fieldName) => {
        const distinctValues = Array.isArray(options[fieldName])
            ? options[fieldName]
            : [];

        const filterableField = filterableFields.find((field) => {
            return field?.name === fieldName;
        });

        const type = String(filterableField?.type ?? "").toLowerCase();

        if (type !== "fk") {
            result[fieldName] = distinctValues.map((value) => {
                return {
                    value,
                    label: String(value),
                };
            });

            return result;
        }

        const column = columns.find((item) => {
            return item?.field === fieldName;
        });

        const optionsMap =
            column?.optionsMap &&
            typeof column.optionsMap === "object" &&
            !Array.isArray(column.optionsMap)
                ? column.optionsMap
                : {};

        result[fieldName] = distinctValues.map((value) => {
            return {
                value,
                label: optionsMap[String(value)] ?? String(value),
            };
        });

        return result;
    }, {});
};

export const ENTITY_PRESET_MODE_ALL = "all";
export const ENTITY_PRESET_MODE_MINE = "mine";
export const ENTITY_PRESET_MODE_OTHER = "other";

export const isOwnedEntityPreset = (preset) => {
    return Boolean(
        preset?.is_owner ??
        preset?.isOwner ??
        false
    );
};

export const isPublicEntityPreset = (preset) => {
    return Boolean(
        preset?.public ??
        preset?.is_public ??
        preset?.isPublic ??
        false
    );
};

export const normalizeEntityPresets = (presets) => {
    if (!Array.isArray(presets)) {
        return [];
    }

    return presets.filter(Boolean);
};

export const getEntityPresetCounters = (presets) => {
    const normalizedPresets =
        normalizeEntityPresets(presets);

    return normalizedPresets.reduce(
        (counters, preset) => {
            counters.all += 1;

            if (isOwnedEntityPreset(preset)) {
                counters.mine += 1;
            } else if (isPublicEntityPreset(preset)) {
                counters.other += 1;
            }

            return counters;
        },
        {
            all: 0,
            mine: 0,
            other: 0,
        }
    );
};

export const filterEntityPresets = ({
    presets,
    mode = ENTITY_PRESET_MODE_ALL,
}) => {
    const normalizedPresets =
        normalizeEntityPresets(presets);

    if (mode === ENTITY_PRESET_MODE_MINE) {
        return normalizedPresets.filter(
            isOwnedEntityPreset
        );
    }

    if (mode === ENTITY_PRESET_MODE_OTHER) {
        return normalizedPresets.filter((preset) => {
            return (
                !isOwnedEntityPreset(preset) &&
                isPublicEntityPreset(preset)
            );
        });
    }

    return normalizedPresets;
};

export const getActivePreset = ({presets, selectedPresetId}) => {
    if (selectedPresetId === null || selectedPresetId === undefined) {
        return null;
    }

    return normalizeEntityPresets(presets).find((preset) => {
        return String(preset.id) === String(selectedPresetId);
    }) ?? null;
};

export const getPresetId = (preset) => {
    return preset?.id ?? preset?.preset_id ?? null;
};

export const getPresetName = (preset) => {
    return String(preset?.name ?? "").trim() || "Preset bez nazwy";
};

export const getPresetDescription = (preset) => {
    return String(preset?.description ?? "").trim();
};

export const getPresetOwnerName = (preset) => {
    if (isOwnedEntityPreset(preset)) {
        return "Mój";
    }

    return String(
        preset?.owner_name ??
        preset?.ownerName ??
        preset?.author_name ??
        preset?.authorName ??
        preset?.user_name ??
        preset?.userName ??
        ""
    ).trim() || "Obcy";
};

export const isSelectedEntityPreset = ({preset, selectedPresetId}) => {
    const presetId = getPresetId(preset);

    if (presetId === null || selectedPresetId === null || selectedPresetId === undefined) {
        return false;
    }

    return String(presetId) === String(selectedPresetId);
};

export const createEmptyEntityQueryPreset = () => {
    return {
        id: null,
        name: "",
        description: "",
        public: false,
        state: {
            filters: [],
        },
    };
};

export const normalizeEntityQueryPreset = (preset) => {
    const source = preset && typeof preset === "object"
        ? preset
        : {};

    return {
        ...source,
        id: source.id ?? null,
        name: String(source.name ?? ""),
        description: String(source.description ?? ""),
        is_public: Boolean(
            source.isPublic ??
            false
        ),
        state: normalizeEntityQuery(
            source.state ??
            source.query
        ),
    };
};

export const createEntityQueryPresetDraft = (preset = null) => {
    return cloneEntityQueryPreset({
        id: null,
        name: "",
        description: "",
        isPublic: false,
        state: createEmptyEntityQuery(),
        ...preset,
    });
};


export const cloneEntityQueryPreset = (preset) => {
    return structuredClone(
        normalizeEntityQueryPreset(preset)
    );
};

export const updateEntityQueryPresetQuerySection = (preset, section, value) => {
    const normalizedPreset = normalizeEntityQueryPreset(preset);

    return {
        ...normalizedPreset,
        state: {
            ...normalizedPreset.state,
            [section]: value,
        },
    };
};