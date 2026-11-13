import { useState, useEffect, useCallback, useRef, use } from 'react';
import { toast } from 'react-toastify';
import http from '../http';
import { EntityContext } from '../context/EntityContext';
import {
    defaultSchema,
    defaultEndpoints,
    organizeSchema,
    processResolvedFields,
    toFormData,
    mergeEntityChanges
} from './useEntityUtils';

const EntityLoadAction = Object.freeze({
    INIT: 'INIT',
    REFRESH: 'REFRESH',
    SCHEMA: 'SCHEMA',
});

export default function useEntity({
    endpoint,
    entityName = '',
    query = null,
    schemaQuery = null,
    readOnly = false,
    schemaOnly = false,
    processRows = null,
    itemId = null,
    initialId = null,
    reload = null,
    cacheHardKey = null,
}) {
    const initialIdRef = useRef(initialId);
    const { getEntityData, setEntityData } = use(EntityContext);

    // Generowanie unikalnego klucza cache (upewnij się, że masz do niego dostęp w tym miejscu)
    const queryKey = JSON.stringify(query || {});
    const schemaQueryKey = JSON.stringify(schemaQuery || {});
    const cacheKey = cacheHardKey ? cacheHardKey : `${entityName}_${endpoint}_${itemId || ''}_${queryKey}_${schemaQueryKey}`;

    // 1. ODCZYT AKTUALNYCH WARTOŚCI Z KONTEKSTU (Odpowiednik zmiennych stanowych)
    const entityState = getEntityData(cacheKey);
    const rows = entityState.rows;
    const schema = entityState.schema || defaultSchema;
    const allowed = entityState.allowed;
    const schemaVersion = entityState.schemaVersion;

    // 2. FUNKCJE ADAPTUJĄCE (Odpowiedniki funkcji modyfikujących set...)
    const setRows = useCallback((updater) => {
        setEntityData(cacheKey, (prev) => {
            const currentRows = prev.rows ?? [];
            const nextRows = typeof updater === 'function' ? updater(currentRows) : updater;
            return {
                ...prev,
                rows: nextRows,
            };
        });
    }, [cacheKey, setEntityData]);

    const setSchema = useCallback((updater) => {
        setEntityData(cacheKey, (prev) => {
            const currentSchema = prev.schema || defaultSchema;
            const nextSchema = typeof updater === 'function' ? updater(currentSchema) : updater;
            return {
                ...prev,
                schema: nextSchema
            };
        });
    }, [cacheKey, setEntityData]);

    const setAllowed = useCallback((updater) => {
        setEntityData(cacheKey, (prev) => {
            const currentAllowed = prev.allowed;
            const nextAllowed = typeof updater === 'function' ? updater(currentAllowed) : updater;
            return {
                ...prev,
                allowed: nextAllowed
            };
        });
    }, [cacheKey, setEntityData]);

    const setSchemaVersion = useCallback((updater) => {
        setEntityData(cacheKey, (prev) => {
            const currentVersion = prev.schemaVersion;
            const nextVersion = typeof updater === 'function' ? updater(currentVersion) : updater;
            return {
                ...prev,
                schemaVersion: nextVersion
            };
        });
    }, [cacheKey, setEntityData]);

    // Lokalne stany dla operacji sieciowych UI (one pozostają lokalne, bo dotyczą tylko danego widoku w danej chwili)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Resolve endpoint: returns a full URL/string or null if disabled / not present.
    // NOTE: we do NOT fallback to `${endpoint}/${name}` — endpoint must be provided by backend or defaults.

    const resolveEndpoint = useCallback((name, activeSchema = schema) => {
        const endpoints = activeSchema?.endpoints;

        if (endpoints && Object.prototype.hasOwnProperty.call(endpoints, name)) {
            const file = endpoints[name];
            if (!file) return null;
            if (/^(\/|https?:\/\/)/i.test(file)) return file;
            return `${endpoint.replace(/\/+$/, '')}/${file}`;
        }

        const file = defaultEndpoints?.[name];
        if (!file) return null;
        if (/^(\/|https?:\/\/)/i.test(file)) return file;

        return `${endpoint.replace(/\/+$/, '')}/${file}`;
    }, [endpoint, schema]);

    const resolveChangesEndpoint = useCallback((activeSchema = schema) => {
        const file = activeSchema?.endpoints?.getChanges;

        if (typeof file !== 'string' || !file.trim()) return null;

        if (/^(\/|https?:\/\/)/i.test(file)) return file;

        return `${endpoint.replace(/\/+$/, '')}/${file}`;
    }, [endpoint, schema]);

    // fetch schema (getEntitySchema endpoint)
    const fetchSchema = useCallback(async () => {
        setLoading(true);
        try {
            const url = resolveEndpoint('getEntitySchema');
            if (!url) {
                throw new Error('Endpoint getEntitySchema is not available for this entity.');
            }

            const params = {
                readOnly,
            };

            if (schemaQuery && typeof schemaQuery === 'object') {
                Object.assign(params, schemaQuery);
            }

            const res = await http.get(url, { params });
            const payload = res.data ?? defaultSchema;
            const processedSchema = organizeSchema(payload);

            setSchema(processedSchema);
            setSchemaVersion(v => v + 1);
            setAllowed(true);
            setError(null);
            setLoading(false);

            return processedSchema;
        } catch (err) {
            setError(err);
            if (err.status === 403) {
                setAllowed(false);
                return null;
            }
            toast.error('Błąd pobierania schematu encji');
            return null;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, readOnly, schemaQuery]);

    // fetch rows (uses 'get' endpoint if provided). Optionally process rows via provided processRows fn.
    const fetchRows = useCallback(async (schemaOverride = null) => {
        if (schemaOnly) return [];

        setLoading(true);

        try {
            const activeSchema = schemaOverride || schema;
            const url = resolveEndpoint('get', activeSchema);

            if (!url) return [];

            const params = { ...(query || {}) };

            if (activeSchema?.mapper?.itemField && itemId != null) {
                params[activeSchema.mapper.itemField] = itemId;
            }

            const requestStartedAt = Date.now();
            const res = await http.get(url, { params });
            const payload = res?.data ?? res;

            const data = payload?.data ?? payload ?? [];

            const normalizedData = Array.isArray(data)
                ? data
                : data !== null && typeof data === 'object'
                    ? [data]
                    : [];

            let final = processResolvedFields(activeSchema, normalizedData);

            if (typeof processRows === 'function') {
                try {
                    final = processRows(final) ?? final;
                } catch (procErr) {
                    console.warn('processRows error', procErr);
                }
            }

            const fallbackCursor = new Date(requestStartedAt - 60000).toISOString();
            const syncCursor = payload?.syncCursor || fallbackCursor;

            setEntityData(cacheKey, prev => ({
                ...prev,
                rows: final,
                syncCursor,
                initialized: true,
                lastFetchedAt: Date.now(),
                timestamp: Date.now(),
            }));

            setError(null);
            return final;

        } catch (err) {
            console.error('fetchRows error', err);
            toast.error('Błąd pobierania danych encji');
            setError(err);

            // Nie czyścimy istniejącego cache po błędzie.
            return getEntityData(cacheKey).rows ?? [];

        } finally {
            setLoading(false);
        }
    }, [
        schemaOnly,
        schema,
        resolveEndpoint,
        queryKey,
        itemId,
        processRows,
        cacheKey,
        setEntityData,
        getEntityData
    ]);

    const fetchChanges = useCallback(async (schemaOverride = null) => {
        if (schemaOnly) return [];

        const current = getEntityData(cacheKey);
        const activeSchema = schemaOverride || current.schema || schema;
        const url = resolveChangesEndpoint(activeSchema);

        // Brak obsługi delty lub brak poprawnej synchronizacji początkowej.
        if (!url || !current.initialized || !current.syncCursor) {
            return fetchRows(activeSchema);
        }

        setLoading(true);

        try {
            const params = {
                ...(query || {}),
                since: current.syncCursor
            };

            if (activeSchema?.mapper?.itemField && itemId != null) {
                params[activeSchema.mapper.itemField] = itemId;
            }

            const res = await http.get(url, { params });
            const payload = res?.data ?? res;

            if (
                !payload ||
                !Array.isArray(payload.upsert) ||
                !Array.isArray(payload.remove) ||
                !payload.syncCursor
            ) {
                throw new Error('Nieprawidłowy format odpowiedzi getChanges.php');
            }

            let upsert = processResolvedFields(activeSchema, payload.upsert);

            if (typeof processRows === 'function') {
                try {
                    upsert = processRows(upsert) ?? upsert;
                } catch (procErr) {
                    console.warn('processRows error', procErr);
                }
            }

            if (!Array.isArray(upsert)) {
                throw new Error('processRows musi zwracać tablicę rekordów.');
            }

            const fetchedAt = Date.now();

            setEntityData(cacheKey, prev => ({
                ...prev,
                rows: mergeEntityChanges(prev.rows ?? [], upsert, payload.remove),
                syncCursor: payload.syncCursor,
                initialized: true,
                lastFetchedAt: fetchedAt,
                timestamp: fetchedAt
            }));

            setError(null);

            return {
                upsert,
                remove: payload.remove,
                syncCursor: payload.syncCursor
            };

        } catch (err) {
            console.error('fetchChanges error', err);
            toast.error('Błąd synchronizacji danych encji');
            setError(err);

            // Zachowujemy dane i kursor, żeby można było ponowić synchronizację.
            return null;

        } finally {
            setLoading(false);
        }
    }, [
        schemaOnly,
        schema,
        resolveChangesEndpoint,
        fetchRows,
        queryKey,
        itemId,
        processRows,
        cacheKey,
        getEntityData,
        setEntityData
    ]);

    // ---------------- CRUD guards & implementations ----------------
    // Each operation checks resolveEndpoint(name) — if null -> disabled.

    const getOne = useCallback(async (id, schemaOverride = null, markInitial = false) => {
        if (id === undefined || id === null || id === '') return null;

        setLoading(true);

        try {
            const activeSchema = schemaOverride || schema;
            const url = resolveEndpoint('getOne', activeSchema);
            if (!url) {
                throw new Error('Endpoint getOne nie jest dostępny.');
            }

            const res = await http.get(url, { params: { id } });
            const payload = res?.data ?? res;
            let item = payload?.data ?? payload ?? null;

            if (!item || typeof item !== 'object' || Array.isArray(item)) {
                throw new Error('Nieprawidłowa odpowiedź getOne.');
            }

            const enriched = processResolvedFields(activeSchema, [item]);
            item = enriched?.[0] ?? item;

            setEntityData(cacheKey, prev => {
                const rows = prev.rows ?? [];
                const index = rows.findIndex(r => String(r.id) === String(item.id));

                const nextRows = index === -1
                    ? [item, ...rows]
                    : rows.map(r => String(r.id) === String(item.id) ? item : r);

                return {
                    ...prev,
                    rows: nextRows,
                    ...(markInitial ? {
                        initialItemId: id,
                        initialItemLoaded: true,
                    } : {}),
                };
            });

            setError(null);
            return item;

        } catch (err) {
            console.error('getOne error', err);
            setError(err);

            if (markInitial) {
                setEntityData(cacheKey, prev => ({
                    ...prev,
                    initialItemId: id,
                    initialItemLoaded: false,
                }));
            }

            return null;

        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, schema, cacheKey, setEntityData]);


    const dispatchLoad = useCallback(async (action, id = initialIdRef.current) => {
        const current = getEntityData(cacheKey);

        const hasSchema = current.schemaVersion > 0 && !!current.schema;
        const hasCollection = current.initialized === true;
        const hasQuery = query != null && Object.keys(query).length > 0;
        const shouldReload = reload ?? hasQuery;

        const hasRow = id != null && (current.rows ?? []).some(
            row => String(row.id) === String(id)
        );

        const getSchema = async (force = false) => {
            if (!force && hasSchema) return current.schema;
            return await fetchSchema();
        };

        // Wymuszone pobranie schematu
        if (action === EntityLoadAction.SCHEMA) {
            return await getSchema(true);
        }

        const activeSchema = await getSchema();
        if (!activeSchema) return null;

        // Encja używana wyłącznie do schematu
        if (schemaOnly) return activeSchema;

        // Ręczne odświeżenie zawsze pobiera pełną kolekcję
        if (action === EntityLoadAction.REFRESH) {
            return await fetchRows(activeSchema);
        }

        if (action !== EntityLoadAction.INIT) return null;

        // Encja zależna z query
        if (hasQuery) {
            if (!hasCollection || shouldReload) {
                return await fetchRows(activeSchema);
            }

            return null;
        }

        // Wejście bezpośrednio na rekord
        if (id != null) {
            if (!hasRow) {
                return await getOne(id, activeSchema, true);
            }

            // Mamy pełną kolekcję i kursor — synchronizujemy
            if (hasCollection && current.syncCursor) {
                if (resolveChangesEndpoint(activeSchema)) {
                    return await fetchChanges(activeSchema);
                }
            }

            // Nie pobieramy automatycznie całej kolekcji
            return null;
        }

        // Pierwsze wejście do listy
        if (!hasCollection) {
            return await fetchRows(activeSchema);
        }

        // Ponowne wejście — synchronizacja przyrostowa
        if (current.syncCursor && resolveChangesEndpoint(activeSchema)) {
            return await fetchChanges(activeSchema);
        }

        // Brak możliwości synchronizacji — pełne pobranie
        return await fetchRows(activeSchema);

    }, [
        cacheKey,
        queryKey,
        reload,
        schemaOnly,
        getEntityData,
        fetchSchema,
        fetchRows,
        fetchChanges,
        getOne,
        resolveChangesEndpoint,
    ]);

    const refresh = useCallback(() => {
        return dispatchLoad(EntityLoadAction.REFRESH);
    }, [dispatchLoad]);

    const refreshFull = refresh;

    useEffect(() => {
        if (schemaOnly) {
            const current = getEntityData(cacheKey);

            if (!current.schemaVersion) {
                dispatchLoad(EntityLoadAction.SCHEMA);
            }

            return;
        }

        dispatchLoad(EntityLoadAction.INIT, initialIdRef.current);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey, schemaOnly, reload]);

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

    const updateFD = useCallback(async (id, changes) => {
        const url = resolveEndpoint('update');
        if (!url) {
            toast.warning('Aktualizacja wyłączona dla tej encji.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = toFormData({ id, ...changes });
            const res = await http.post(url, payload);
            const ok = !!res.updated;

            if (ok) {
                await getOne(res.id);
                toast.success('Zapisano');
                return true;
            }

            const serverMsg = res?.error ?? res?.message ?? 'Aktualizacja nie powiodła się';
            setError(serverMsg);
            return false;

        } catch (err) {
            console.error('updateFD error', err);
            setError(err?.response?.data?.error || err?.message || 'Błąd aktualizacji');
            return false;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, getOne, setLoading, setError]);

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

    const copyMany = useCallback(async (ids = [], changes = {}) => {
        const url = resolveEndpoint('copyMany');
        if (!url) {
            toast.warning('Kopiowanie wyłączone dla tej encji.');
            return 0;
        }
        if (!Array.isArray(ids) || ids.length === 0) return 0;
        if (!changes || typeof changes !== 'object' || Object.keys(changes).length === 0) return 0;

        setLoading(true);
        setError(null);
        try {
            const res = await http.post(url, { ids, changes });
            const { ok, copied, successIds, failedIds, message } = res?.data ?? {};

            if (Array.isArray(failedIds) && failedIds.length) {
                toast.info(`Nie skopiowano ${failedIds.length} rekordów.`);
            }
            if (message && ok === false) {
                setError?.(message);
            }

            return typeof copied === 'number' ? copied : successIds.length;
        } catch (err) {
            console.error('copyMany error', err);
            toast.error('Błąd masowego kopiowania');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [resolveEndpoint, http, setLoading, setError, toast]);

    const remove = useCallback(async (id, data = {}) => {
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
            const res = await http.post(url, { id, ...data });
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
        rows,
        allowed,
        schema,
        heightSpan: schema.heightSpan ? schema.heightSpan : defaultSchema.heightSpan,
        schemaVersion,

        // handlers (return null for handlers that are disabled)
        clearError: () => setError(null),
        create: resolveEndpoint('create') ? create : null,
        updateField: resolveEndpoint('updateField') ? updateField : null,
        update: resolveEndpoint('update') ? update : null,
        updateFD: resolveEndpoint('update') ? updateFD : null,
        updateMany: resolveEndpoint('updateMany') ? updateMany : null,
        copyMany: resolveEndpoint('copyMany') ? copyMany : null,
        remove: resolveEndpoint('delete') ? remove : null,
        removeMany: resolveEndpoint('deleteMany') ? removeMany : null,
        upload: resolveEndpoint('upload') ? upload : null,
        uploadImg: resolveEndpoint('uploadImg') ? uploadImg : null,
        getOne: resolveEndpoint('getOne') ? getOne : null,
        // Synchronizacja
        refresh,
        refreshFull,
        fetchSchema,
        fetchRows,
        fetchChanges,

        // Metadane synchronizacji
        syncCursor: entityState.syncCursor,
        initialized: entityState.initialized,
        lastFetchedAt: entityState.lastFetchedAt,

    };
}
