// hooks/useEntity.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import http from '../http';

/**
 * useEntity hook
 * @param {Object} params
 * @param {string} params.endpoint - base endpoint path, e.g. 'periods_structures_costs' (without leading slash)
 * @param {string} [params.entityName] - optional friendly name for messages
 * @param {Function} [params.processRows] - optional: (rows) => processedRows, called once after fetchRows
 */

/* --- domyślne nazwy endpointów (tylko getEntitySchema domyślnie dostępny) --- */
const defaultEndpoints = {
    getEntitySchema: 'getEntitySchema.php',
};

/* --- UI schema domyślny --- */
// default shape, for safety
const defaultSchema = {
    addForm: { schema: [], label: '' },
    editForm: { schema: [], label: '' },
    bulkEditForm: { schema: [], label: '' },
    columns: [],
    endpoints: {},
    relations: {},
    options: {},      // { [fieldName]: Option[] }
    importSchema: [],
    heightSpan: 85,
};

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
function organizeSchema(input = defaultSchema) {
    // shallow clone top-level; we’ll map arrays below
    const schema = {
        ...defaultSchema,
        ...input,
        addForm: { ...(input.addForm || defaultSchema.addForm) },
        editForm: { ...(input.editForm || defaultSchema.addForm) },
        bulkEditForm: { ...(input.bulkEditForm || defaultSchema.bulkEditForm) },
    };

    const optionsDict = schema.options || {};

    //const emptyOption = {value : '', label: '--Brak wartosci--', title: 'pusta wartość', disabled: false};

    const getOpts = (key) => {
        const opts = optionsDict?.[key];
        const result = Array.isArray(opts) && opts.length > 0 ? opts : null;
        return result;
    };

    // -------- addForm block --------
    if (Array.isArray(schema.addForm.schema)) {
        schema.addForm = {
            ...schema.addForm,
            schema: schema.addForm.schema.map((item) => {
                if (!item || typeof item !== 'object') return item;
                const { name, type, selectOptions } = item;

                // Rule: type === 'select' AND selectOptions === [] → fill from options[name]
                if (
                    type === 'select' &&
                    Array.isArray(selectOptions) &&
                    selectOptions.length === 0 &&
                    name
                ) {
                    const opts = getOpts(name);
                    if (opts) {
                        return { ...item, selectOptions: opts };
                    }
                }
                return item;
            }),
        };
    }

    // -------- editForm block --------
    if (Array.isArray(schema.editForm.schema)) {
        schema.editForm = {
            ...schema.editForm,
            schema: schema.editForm.schema.map((item) => {
                if (!item || typeof item !== 'object') return item;
                const { name, type, selectOptions } = item;

                // Rule: type === 'select' AND selectOptions === [] → fill from options[name]
                if (
                    type === 'select' &&
                    Array.isArray(selectOptions) &&
                    selectOptions.length === 0 &&
                    name
                ) {
                    const opts = getOpts(name);
                    if (opts) {
                        return { ...item, selectOptions: opts };
                    }
                }
                return item;
            }),
        };
    }

    // -------- bulkEditForm block --------
    if (Array.isArray(schema.bulkEditForm.schema)) {
        schema.bulkEditForm = {
            ...schema.bulkEditForm,
            schema: schema.bulkEditForm.schema.map((item) => {
                if (!item || typeof item !== 'object') return item;
                const { name, type, selectOptions } = item;

                // Rule: type === 'select' AND selectOptions === [] → fill from options[name]
                if (
                    type === 'select' &&
                    Array.isArray(selectOptions) &&
                    selectOptions.length === 0 &&
                    name
                ) {
                    const opts = getOpts(name);
                    if (opts) {
                        return { ...item, selectOptions: opts };
                    }
                }
                return item;
            }),
        };
    }

    // -------- columns block --------
    if (Array.isArray(schema.columns)) {
        schema.columns = schema.columns.map((col) => {
            if (!col || typeof col !== 'object') return col;
            const { field, input } = col;

            // Rule: input === 'select' AND editable === true → set/create selectOptions from options[field]
            if (input === 'select' && field) {
                const opts = getOpts(field);
                if (opts) {
                    const optMap = {};
                    opts.forEach(option => {
                        if (option.value && option.label) {
                            optMap[option.value] = option.label;
                        }
                    });
                    const finalColumn = {
                        ...col,
                        optionsMap: optMap,
                        options: Array.isArray(col.options) ? col.options : opts,
                        // overwrite if empty or missing
                        ...(Array.isArray(col.options) && col.options.length === 0
                            ? { options: opts }
                            : !Array.isArray(col.options)
                                ? { options: opts }
                                : {}),

                    };
                    return finalColumn;
                }
            }
            return col;
        });
    }
    addResolvedColumns(schema);
    return schema;
}

export default function useEntity({ endpoint, entityName = '', query = null, schemaQuery = null, readOnly = false, schemaOnly = false, processRows = null }) {
    // UI / network state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // schema (merged UI from backend + defaults)
    const [schema, setSchema] = useState(defaultSchema);
    const [schemaVersion, setSchemaVersion] = useState(0);


    // rows (single source of truth; optional frontend processing applied on fetch)
    const [rows, setRows] = useState([]);

    const fetchedRef = useRef(false);

    // Resolve endpoint: returns a full URL/string or null if disabled / not present.
    // NOTE: we do NOT fallback to `${endpoint}/${name}` — endpoint must be provided by backend or defaults.

    const resolveEndpoint = useCallback((name) => {
        // priority:
        // 1) if schema.endpoints explicitly hasOwnProperty(name) => honor it (even if null)
        if (schema && schema.endpoints && Object.prototype.hasOwnProperty.call(schema.endpoints, name)) {
            const file = schema.endpoints[name];
            if (file === null) return null; // explicitly disabled
            if (!file) return null; // missing -> treat as disabled
            if (/^\/|^https?:\/\//.test(file)) return file;
            return `${endpoint.replace(/\/+$/, '')}/${file}`;
        }

        // 2) then check entityEndpoints (merged state)
        if (defaultEndpoints && Object.prototype.hasOwnProperty.call(defaultEndpoints, name)) {
            const file = defaultEndpoints[name];
            if (file === null) return null;
            if (!file) return null;
            if (/^\/|^https?:\/\//.test(file)) return file;
            return `${endpoint.replace(/\/+$/, '')}/${file}`;
        }

        // 3) finally fallback to defaultEndpoints (only getEntitySchema likely)
        const file = defaultEndpoints[name];
        if (!file) return null;
        if (/^\/|^https?:\/\//.test(file)) return file;
        return `${endpoint.replace(/\/+$/, '')}/${file}`;
    }, [endpoint, schema, defaultEndpoints]);

    // fetch schema (getEntitySchema endpoint)
    const fetchSchema = useCallback(async () => {
        setLoading(true);
        try {
            const url = resolveEndpoint('getEntitySchema');
            if (!url) {
                throw new Error('Endpoint getEntitySchema is not available for this entity.');
            }

            // Budujemy obiekt parametrów GET
            const params = {
                readOnly,
            };

            if (schemaQuery && typeof schemaQuery === 'object') {
                Object.assign(params, schemaQuery);
            }

            const res = await http.get(url, { params });
            const payload = res.data ?? defaultSchema;
            const procesedSchema = organizeSchema(payload);
            setSchema(procesedSchema);
            setSchemaVersion(v => v + 1);
            setError(null);
            return payload;
        } catch (err) {
            console.error('fetchSchema error', err);
            toast.error('Błąd pobierania schematu encji');
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, readOnly, schemaQuery]);


    // fetch rows (uses 'get' endpoint if provided). Optionally process rows via provided processRows fn.
    const fetchRows = useCallback(async () => {
        if (!schemaOnly) {
            setLoading(true);
            try {
                const url = resolveEndpoint('get');
                if (!url) {
                    setRows([]);
                    return [];
                }

                // 🔹 budujemy query params:
                let params = {};

                // 1) query przekazane z zewnątrz
                if (query && typeof query === 'object') {
                    params = { ...params, ...query };
                }

                // 2) itemId (na przyszłość, gdy dodasz mapper.itemField)
                if (schema?.mapper?.itemField && itemId != null) {
                    params[schema.mapper.itemField] = itemId;
                }

                // 🔹 wykonujemy GET z params
                const res = await http.get(url, { params });

                const data = res.data ?? [];
                let final = Array.isArray(data) ? processResolvedFields(schema, data) : [];

                if (typeof processRows === 'function') {
                    try {
                        final = processRows(final) ?? final;
                    } catch (procErr) {
                        console.warn('processRows error', procErr);
                    }
                }

                setRows(final);
                setError(null);
                return final;

            } catch (err) {
                console.error('fetchRows error', err);
                toast.error('Błąd pobierania danych encji');
                setError(err);
                setRows([]);
                return [];
            } finally {
                setLoading(false);
            }
        }
    }, [resolveEndpoint, processRows, query, schema, schemaOnly]);


    // refresh: fetch schema then rows
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            await fetchSchema();
            await fetchRows();
            setError(null);
        } catch (err) {
            console.error('refresh error', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [fetchSchema, fetchRows]);

    const queryKey = JSON.stringify(query || {});
    const schemaQueryKey = JSON.stringify(schemaQuery || {});

    useEffect(() => {
        // initial load when endpoint (entity folder) changes
        if (queryKey) {
            setRows([]);
        }

        refresh().catch(e => console.error(e));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, queryKey, schemaQueryKey]);

    useEffect(() => {
        const ep = resolveEndpoint('get');
        if (!ep) {
            // endpoint jawnie wyłączony (null) lub nie ma fallbacku -> nie fetchujemy
            return;
        }

        // jeśli już mamy załadowane wiersze i nie chcemy ponownie pobierać -> skip
        if (fetchedRef.current || (rows && rows.length > 0)) return;

        fetchedRef.current = true;

        fetchRows()
            .catch(err => {
                console.error('fetchRows error', err);
                fetchedRef.current = false; // pozwól na retry jeśli chcesz
            });
    }, [resolveEndpoint, schema, fetchRows, rows]);

    // ---------------- CRUD guards & implementations ----------------
    // Each operation checks resolveEndpoint(name) — if null -> disabled.

    const getOne = useCallback(async (id) => {
        if (id === undefined || id === null || id === '') {
            console.warn('getOne called without id');
            return null;
        }

        setLoading(true);
        try {
            // try resolve endpoint via schema/entity config
            let url = null;
            try {
                url = resolveEndpoint('getOne');
            } catch (e) {
                url = null;
            }

            // fallback: try to guess conventional endpoint
            if (!url) {
                const base = (endpoint || '').replace(/\/+$/, '');
                url = `${base}/getOne.php`;
            }

            // attach id as query param safely (if url already has ?, append with &)
            const sep = url.includes('?') ? '&' : '?';
            const finalUrl = `${url}${sep}id=${encodeURIComponent(id)}`;

            const res = await http.get(finalUrl);
            // backend might return { data: { ... } } or { ... }
            const payload = res?.data ?? null;
            let item = payload?.data ?? payload ?? null;

            // enrich resolved labels
            if (item && typeof item === 'object') {
                const enriched = processResolvedFields(schema, [item]);
                item = Array.isArray(enriched) && enriched[0] ? enriched[0] : item;
            }

            if (item && typeof item === 'object') {
                // merge/replace in rows cache: if exists replace, else prepend
                setRows(prev => {
                    if (!Array.isArray(prev)) return [item];
                    const idx = prev.findIndex(r => String(r.id) === String(item.id));
                    if (idx === -1) {
                        // prepend (most recent)
                        return [item, ...prev];
                    } else {
                        const copy = [...prev];
                        copy[idx] = item;
                        return copy;
                    }
                });
            }

            return item;
        } catch (err) {
            console.error('getOne error', err);
            toast.error('Błąd pobierania rekordu');
            return null;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, endpoint, setRows, setLoading]);


    const create = useCallback(async (data) => {
        const url = resolveEndpoint('create');
        if (!url) {
            toast.warning('Tworzenie rekordów wyłączone dla tej encji.');
            return null;
        }
        setLoading(true);
        try {
            const res = await http.post(url, data);
            const id = res.id ?? null;
            const r = await getOne(id);
            if (id) toast.success(`${entityName || 'Rekord'} utworzony wpis o id: ${id}`);
            return id;
        } catch (err) {
            console.error('create error', err);
            setError(err);
            toast.error('Błąd tworzenia rekordu');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, refresh, entityName]);

    const updateField = useCallback(async ({ id, field, value }) => {
        const url = resolveEndpoint('updateField');
        if (!url) {
            toast.warning('Zapisywanie pól wyłączone dla tej encji.');
            return false;
        }
        setLoading(true);
        try {
            const res = await http.post(url, { id, field, value });
            const ok = !!res.updated;
            if (ok) {
                // update local rows quickly
                const r = await getOne(res.id);
                toast.success('Zapisano');
            } else {
                setError(res)
            }
        } catch (err) {
            console.error('updateField error', err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, refresh]);

    const update = useCallback(async (id, changes) => {
        const url = resolveEndpoint('update');
        if (!url) {
            toast.warning('Aktualizacja wyłączona dla tej encji.');
            return false;
        }

        setLoading(true);
        // clear previous error
        setError(null);

        try {
            const res = await http.post(url, { id, ...changes });
            const ok = !!res.updated;

            if (ok) {
                const r = await getOne(res.id);
                toast.success('Zapisano');
                return true;
            }

            // brak updated = false → zapisz error do stanu (backend może zwrócić info w res.data)
            const serverMsg = res.data?.error ?? res.data?.message ?? 'Aktualizacja nie powiodła się';
            setError(serverMsg);
            return false;

        } catch (err) {
            console.error('update error', err);
            // ustawiamy błąd w stanie; nie robimy toast.error (zgodnie z wytycznymi)
            setError(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, setRows, setLoading, setError]);

    const updateMany = useCallback(async (ids = [], changes = {}) => {
        const url = resolveEndpoint('updateMany');
        if (!url) {
            toast.warning('Masowa aktualizacja wyłączona dla tej encji.');
            return 0;
        }
        if (!Array.isArray(ids) || ids.length === 0) return 0;
        if (!changes || typeof changes !== 'object' || Object.keys(changes).length === 0) return 0;

        setLoading(true);
        setError(null);
        try {
            const res = await http.post(url, { ids, changes });
            const { ok, updated, successIds, failedIds, message } = res?.data ?? {};

            // które id dociągamy z serwera (kanoniczny stan po triggerach, updated_by, updated_at itd.)
            const toFetch = Array.isArray(successIds) && successIds.length ? successIds : ids;

            if (typeof getOne === 'function') {
                // dociągamy kanoniczne rekordy w małych batchach, żeby nie zabić serwera
                const BATCH = 25;
                for (let i = 0; i < toFetch.length; i += BATCH) {
                    const slice = toFetch.slice(i, i + BATCH);
                    await Promise.allSettled(slice.map(id => getOne(id)));
                }
            } else {
                // fallback: bez getOne patchujemy lokalnie tylko successIds (albo wszystkie ids jeśli brak mapy)
                const patchIds = (Array.isArray(successIds) && successIds.length) ? successIds : ids;
                const okSet = new Set(patchIds.map(String));
                setRows(prev => prev.map(r => (okSet.has(String(r.id)) ? { ...r, ...changes } : r)));
            }

            if (Array.isArray(failedIds) && failedIds.length) {
                toast.info(`Nie zaktualizowano ${failedIds.length} rekordów.`);
            }
            if (message && ok === false) {
                setError?.(message);
            }

            return typeof updated === 'number' ? updated : toFetch.length;
        } catch (err) {
            console.error('updateMany error', err);
            toast.error('Błąd masowej aktualizacji');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, http, getOne, setRows, setLoading, setError, toast]);

    const remove = useCallback(async (id) => {
        const url = resolveEndpoint('delete');
        if (!url) {
            toast.warning('Usuwanie wyłączone dla tej encji.');
            return false;
        }
        if (id == null) return false;

        // optimistic: wytnij z listy, ale trzymaj backup do rollbacku
        let backup = null;
        setRows(prev => {
            backup = prev;
            return prev.filter(r => String(r.id) !== String(id));
        });

        setLoading(true);
        try {
            // Preferuj POST JSON (spójnie z innymi endpointami)
            const res = await http.post(url, { id });
            const ok = !!(res?.ok ?? true);
            const deleted = !!(res?.deleted ?? false);

            if (!ok || !deleted) {
                // rollback gdy serwer nie potwierdził
                setRows(backup);
                if (!deleted) toast.info('Rekord nie został usunięty (może nie istnieć).');
                return false;
            }

            // sukces – nic więcej nie robimy, optimistic już wyciął
            return true;
        } catch (err) {
            // rollback on error
            setRows(backup);
            console.error('remove error', err);
            toast.error('Błąd usuwania');
            return false;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, setRows, setLoading]);

    const removeMany = useCallback(async (ids = []) => {
        const url = resolveEndpoint('deleteMany');
        if (!url) {
            toast.warning('Masowe usuwanie wyłączone dla tej encji.');
            return 0;
        }
        if (!Array.isArray(ids) || ids.length === 0) return 0;

        // optimistic: wytnij wszystkie i trzymaj backup mapą
        let backupList = null;
        let backupById = null;

        setRows(prev => {
            backupList = prev;
            backupById = new Map(prev.map(r => [String(r.id), r]));
            const removeSet = new Set(ids.map(String));
            return prev.filter(r => !removeSet.has(String(r.id)));
        });

        setLoading(true);
        try {
            const res = await http.post(url, { ids });
            const { ok, deleted, successIds, failedIds, message } = res?.data ?? {};

            // jeśli są porażki — odtwórz te wiersze z backupu
            if (Array.isArray(failedIds) && failedIds.length) {
                const failedSet = new Set(failedIds.map(String));
                // wstawiamy z powrotem w tej samej kolejności, jak w backupList
                const toRestore = backupList.filter(r => failedSet.has(String(r.id)));
                if (toRestore.length) {
                    setRows(curr => {
                        // curr = prev bez wszystkich ids; chcemy dołożyć porażki na koniec
                        // Jeżeli ważna jest pierwotna pozycja, można zrobić bardziej złożoną rekonstrukcję.
                        return [...curr, ...toRestore];
                    });
                }
                toast.info(`Nie usunięto ${failedIds.length} rekordów.`);
            }

            if (message && ok === false) {
                setError?.(message);
            }

            // zwróć licznik z serwera, a jeśli go brak — liczność successIds
            if (typeof deleted === 'number') return deleted;
            if (Array.isArray(successIds)) return successIds.length;
            return Array.isArray(ids) ? ids.length : 0;
        } catch (err) {
            // pełny rollback
            setRows(backupList);
            console.error('removeMany error', err);
            toast.error('Błąd masowego usuwania');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, setRows, setLoading, setError, toast]);

    const upload = useCallback(async (dataRows = []) => {
        const url = resolveEndpoint('upload');
        if (!url) {
            toast.warning('Upload jest wyłączony dla tej encji.');
            return { inserted: 0, skipped: 0, ids: [], errors: [] };
        }

        setLoading(true);
        setError(null);

        try {
            const res = await http.post(url, { rows: dataRows });
            const payload = res ?? {};

            // backend zwraca: { ok, inserted, skipped, ids, errors }
            const inserted = Number(payload.inserted ?? 0);
            const skipped = Number(payload.skipped ?? payload.skiped ?? 0); // tolerancja literówki
            const ids = Array.isArray(payload.ids) ? payload.ids : [];
            const errors = Array.isArray(payload.errors) ? payload.errors : [];

            // dociągnij “kanoniczne” rekordy po ID (jeśli endpoint dostępny)
            refresh();

            if (errors.length) {
                // delikatna informacja o wierszach z błędami
                toast.info(`Import zakończony z ${errors.length} błędami.`);
            } else {
                toast.success(`Zaimportowano ${inserted} wierszy.`);
            }

            return { inserted, skipped, ids, errors };
        } catch (err) {
            console.error('upload error', err);
            setError(err);  // bez toast.error zgodnie z wytycznymi
            return { inserted: 0, skipped: 0, ids: [], errors: [String(err?.message || err)] };
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, http, getOne, setLoading, setError, toast, fetchRows]);

    const uploadImg = useCallback(async (file, meta = {}) => {
        const url = resolveEndpoint('uploadImg');
        if (!url) {
            toast.warning('Upload obrazków jest wyłączony dla tej encji.');
            return null;
        }
        if (!file) return null;

        const { ref_type, ref_id, ...rest } = meta || {};
        if (!ref_type || !ref_id) {
            throw new Error('uploadImg wymaga meta: { ref_type, ref_id }');
        }

        setLoading(true);
        setError(null);

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('ref_type', String(ref_type));
            fd.append('ref_id', String(ref_id));

            // opcjonalne pola
            Object.keys(rest).forEach((k) => {
                const v = rest[k];
                if (v != null) fd.append(k, String(v));
            });

            console.log('uploadImg to', url, 'meta', meta, fd, file);
            // Nie ustawiaj ręcznie Content-Type – axios sam doda boundary
            const res = await http.upload(url, fd);

            // Ujednolicenie: http może zwracać res albo już res.data
            const payload = res?.data ?? res ?? {};
            const data = payload?.data ?? payload;

            if (!data?.ok || !data?.url) {
                // backend może zwrócić { ok:false, error:"..." } albo { error:"..." }
                const msg =
                    data?.error ||
                    data?.message ||
                    payload?.error ||
                    payload?.message ||
                    'Upload obrazu nieudany';
                throw new Error(msg);
            }

            return data.url; // TinyMCE potrzebuje url
        } catch (err) {
            console.error('uploadImg error', err);
            setError(err);

            // TinyMCE i UI: toast + wyjątek
            toast.error(err?.message ? String(err.message) : 'Błąd uploadu obrazka');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, http, toast]);



    // final return — expose handlers as function or null (so UI can easily check)
    return {
        // state
        loading,
        error,
        clearError: () => setError(null),
        rows,
        schema,
        schemaVersion,

        // handlers (return null for handlers that are disabled)
        create: resolveEndpoint('create') ? create : null,
        updateField: resolveEndpoint('updateField') ? updateField : null,
        update: resolveEndpoint('update') ? update : null,
        updateMany: resolveEndpoint('updateMany') ? updateMany : null,
        remove: resolveEndpoint('delete') ? remove : null,
        removeMany: resolveEndpoint('deleteMany') ? removeMany : null,
        upload: resolveEndpoint('upload') ? upload : null,
        uploadImg: resolveEndpoint('uploadImg') ? uploadImg : null,
        getOne: resolveEndpoint('getOne') ? getOne : null,
        // misc
        refresh,
        fetchSchema,
        fetchRows,
        heightSpan: schema.heightSpan ? schema.heightSpan : defaultSchema.heightSpan
    };
}
