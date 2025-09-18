import React, { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react';

/**
 * @typedef {{ name: string, data: any, id?: number, pageId?: number, userId?: number,
 *   updatedAt?: number, staleAt?: number, dirty?: boolean, loading?: boolean, error?: any }} PresetState
 * State bucket per entity: { [entity:string]: PresetState }
 */
const PresetsContext = createContext(null);

const NOW = () => Date.now();
const isStale = (p) => !p?.staleAt || p.staleAt < NOW();

/** Reducer keeps updates atomic */
function reducer(state, action) {
  const { entity } = action;
  const cur = state[entity] || null;

  switch (action.type) {
    case 'SET':
      return { ...state, [entity]: { ...action.payload, dirty: !!action.payload?.dirty } };

    case 'PATCH':
      return {
        ...state,
        [entity]: { ...(cur || {}), ...action.patch, updatedAt: NOW() },
      };

    case 'LOAD_START':
      return { ...state, [entity]: { ...(cur || {}), loading: true, error: null } };

    case 'LOAD_OK':
      return {
        ...state,
        [entity]: {
          ...(cur || {}),
          ...action.payload,
          loading: false,
          error: null,
          staleAt: NOW() + (action.ttlMs ?? 60000),
          dirty: false,
        },
      };

    case 'LOAD_ERR':
      return { ...state, [entity]: { ...(cur || {}), loading: false, error: action.error } };

    case 'SAVE_OK':
      return { ...state, [entity]: { ...(cur || {}), dirty: false, error: null } };

    default:
      return state;
  }
}

export const PresetsProvider = ({ children, defaultTtlMs = 60_000 }) => {
  const [state, dispatch] = useReducer(reducer, {});
  const inflight = useRef(new Map());      // key: entity → Promise
  const debouncers = useRef(new Map());    // key: entity → timeout id

  const setPreset = useCallback((entity, name, data, meta = {}) => {
    dispatch({ type: 'SET', entity, payload: { name, data, ...meta, updatedAt: NOW() } });
  }, []);

  const patchPreset = useCallback((entity, patch) => {
    dispatch({ type: 'PATCH', entity, patch });
  }, []);

  const getPreset = useCallback((entity) => state[entity] || null, [state]);

  // Deduped async load (you provide services.list / services.getCurrent etc.)
  const loadPreset = useCallback(async (entity, { pageId, userId, services, ttlMs = defaultTtlMs, force = false }) => {
    const current = state[entity];
    if (!force && current && !isStale(current)) return current;

    if (inflight.current.get(entity)) return inflight.current.get(entity);

    dispatch({ type: 'LOAD_START', entity });
    const p = (async () => {
      try {
        const row = await services.getCurrent({ pageId, userId }); // or compose from list
        const normalized = row?.preset
          ? { name: row.name, data: row.preset, id: row.id, pageId, userId }
          : { name: 'Domyślny', data: { version: 1, columns: [], tableSettings: {} }, pageId, userId };
        dispatch({ type: 'LOAD_OK', entity, payload: normalized, ttlMs });
        return normalized;
      } catch (error) {
        dispatch({ type: 'LOAD_ERR', entity, error });
        throw error;
      } finally {
        inflight.current.delete(entity);
      }
    })();

    inflight.current.set(entity, p);
    return p;
  }, [state, defaultTtlMs]);

  // Debounced save
  const savePreset = useCallback((entity, services, delayMs = 300) => {
    const entry = state[entity]; if (!entry) return;

    clearTimeout(debouncers.current.get(entity));
    const t = setTimeout(async () => {
      try {
        const { id, pageId, userId, name, data } = state[entity] || {};
        await services.save({ id, pageId, userId, name, preset: data });
        dispatch({ type: 'SAVE_OK', entity });
      } catch (error) {
        dispatch({ type: 'LOAD_ERR', entity, error }); // surface error
      }
    }, delayMs);

    debouncers.current.set(entity, t);
  }, [state]);

  const value = useMemo(() => ({
    setPreset, patchPreset, getPreset, loadPreset, savePreset, state,
  }), [setPreset, patchPreset, getPreset, loadPreset, savePreset, state]);

  return <PresetsContext.Provider value={value}>{children}</PresetsContext.Provider>;
};

export const usePresetsContext = () => {
  const ctx = useContext(PresetsContext);
  if (!ctx) throw new Error('PresetsProvider missing');
  return ctx;
};

/** Feature-friendly hook for a single entity */
export const useEntityPreset = (entity) => {
  const ctx = usePresetsContext();
  const current = ctx.getPreset(entity);

  return {
    current,
    name: current?.name || null,
    data: current?.data || null,
    loading: current?.loading || false,
    error: current?.error || null,
    dirty: current?.dirty || false,
    // actions
    set: (name, data, meta) => ctx.setPreset(entity, name, data, meta),
    patch: (partial) => ctx.patchPreset(entity, { data: { ...(current?.data || {}), ...partial }, dirty: true }),
    load: (args) => ctx.loadPreset(entity, args),
    save: (services, delay) => ctx.savePreset(entity, services, delay),
  };
};
