// ===============================================================
// usePresets.js – zarządzanie presetami + dirty/staging (bez UI)
// ===============================================================
// Rola: jedyne miejsce odpowiedzialne za pobieranie/zapis presetów,
// wybór aktywnego, staging zmian (dirty) i zapisywanie/odrzucanie.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** @typedef {{ field:string, visible?:boolean, width?:number, order?:number, groupBy?:boolean, aggregationFn?:any, sort?:{field:string,direction:'asc'|'desc'}|null }} ColumnOverride */
/** @typedef {{ columns: ColumnOverride[] }} PresetData */
/** @typedef {{ version:number, updatedAt:string, activePreset:string, presets: Record<string, PresetData> }} Envelope */

const KEY = (ns, entity) => `${ns || 'powerTable'}__columns__${entity}`;
const nowISO = () => new Date().toISOString();

const createEnvelope = (active = 'default') => ({
  version: 1,
  updatedAt: nowISO(),
  activePreset: active,
  presets: { [active]: { columns: [] } },
});

const loadEnvelope = (ns, entity) => {
  try {
    const raw = localStorage.getItem(KEY(ns, entity));
    if (!raw) return null;
    const env = JSON.parse(raw);
    if (!env.version) env.version = 1;
    if (!env.activePreset) env.activePreset = 'default';
    if (!env.presets) env.presets = { [env.activePreset]: { columns: [] } };
    return env;
  } catch { return null; }
};

const saveEnvelope = (ns, entity, env) => {
  const toSave = { ...env, updatedAt: nowISO() };
  localStorage.setItem(KEY(ns, entity), JSON.stringify(toSave));
};

const shallowEqualOverrides = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const aa = a[i], bb = b[i];
    if (!aa || !bb) return false;
    const keys = new Set([...Object.keys(aa), ...Object.keys(bb)]);
    for (const k of keys) {
      if (JSON.stringify(aa[k]) !== JSON.stringify(bb[k])) return false;
    }
  }
  return true;
};

function usePresets({ entityName, storageNS = 'powerTable' }) {
  // persisted envelope
  const [env, setEnv] = useState(() => loadEnvelope(storageNS, entityName) || createEnvelope('default'));

  // staging (niedopuszczone jeszcze do zapisu w env)
  const [staged, setStaged] = useState(/** @type {PresetData|null} */(null));
  const [dirty, setDirty] = useState(false);

  // aktywne dane (staged > persisted)
  const activeName = env.activePreset;
  const persistedActive = env.presets[activeName] || { columns: [] };
  const effective = staged ?? persistedActive;

  // API do stage’owania zmian z useColumns
  const stage = useCallback((nextOverrides /**: ColumnOverride[] */) => {
    const next = { columns: nextOverrides || [] };
    setStaged(next);
    const isDirty = !shallowEqualOverrides(next.columns, (env.presets[env.activePreset] || { columns: [] }).columns);
    setDirty(isDirty);
  }, [env]);

  // zapisz do obecnego presetu
  // ZAMIANA: save – teraz przyjmuje opcjonalny snapshot override’ów
  const save = useCallback((overrides /*?: ColumnOverride[] */) => {
    setEnv(prev => {
      const base = prev.presets[prev.activePreset] || { columns: [] };
      const toWrite = overrides
        ? { columns: overrides }
        : (staged ?? base);

      const next = {
        ...prev,
        presets: {
          ...prev.presets,
          [prev.activePreset]: toWrite,
        },
      };

      saveEnvelope(storageNS, entityName, next);
      return next;
    });
    setDirty(false);
    setStaged(null);
  }, [entityName, staged, storageNS]);

  // ZAMIANA: saveAs – teraz przyjmuje nazwę i opcjonalny snapshot override’ów
  const saveAs = useCallback((name, overrides /*?: ColumnOverride[] */) => {
    setEnv(prev => {
      const snapshot = overrides
        ? { columns: overrides }
        : (staged ?? (prev.presets[prev.activePreset] || { columns: [] }));

      const next = {
        ...prev,
        presets: {
          ...prev.presets,
          [name]: snapshot,
        },
        activePreset: name,
      };

      saveEnvelope(storageNS, entityName, next);
      return next;
    });
    setDirty(false);
    setStaged(null);
  }, [entityName, staged, storageNS]);


  const discard = useCallback(() => { setStaged(null); setDirty(false); }, []);

  const setActive = useCallback((name) => {
    setEnv(prev => {
      const next = { ...prev, activePreset: name };
      saveEnvelope(storageNS, entityName, next);
      return next;
    });
    setStaged(null);
    setDirty(false);
  }, [entityName, storageNS]);

  const remove = useCallback((name) => {
    setEnv(prev => {
      if (!prev.presets[name]) return prev;
      const { [name]: _, ...rest } = prev.presets;
      const fallback = prev.activePreset === name ? (Object.keys(rest)[0] || 'default') : prev.activePreset;
      const next = { ...prev, presets: Object.keys(rest).length ? rest : createEnvelope('default').presets, activePreset: fallback };
      saveEnvelope(storageNS, entityName, next);
      return next;
    });
    if (env.activePreset === name) { setStaged(null); setDirty(false); }
  }, [entityName, env.activePreset, storageNS]);

  const rename = useCallback((oldName, newName) => {
    setEnv(prev => {
      const data = prev.presets[oldName];
      if (!data || oldName === newName) return prev;
      const { [oldName]: __, ...rest } = prev.presets;
      const next = { ...prev, presets: { ...rest, [newName]: data }, activePreset: prev.activePreset === oldName ? newName : prev.activePreset };
      saveEnvelope(storageNS, entityName, next);
      return next;
    });
  }, [entityName, storageNS]);

  const reset = useCallback(() => {
    setEnv(createEnvelope('default'));
    saveEnvelope(storageNS, entityName, createEnvelope('default'));
    setStaged(null); setDirty(false);
  }, [entityName, storageNS]);

  const list = useMemo(() => Object.keys(env.presets), [env.presets]);

  return {
    // odczyt
    activeName,
    effective,            // {columns: [...] } – to podajesz do useColumns
    persistedActive,      // pomocniczo gdy chcesz porównać
    list,
    dirty,

    // zapis / zarządzanie
    stage,                // (overrides[]) – informacja z useColumns
    save,
    saveAs,               // (name)
    discard,
    setActive,            // (name)
    remove,               // (name)
    rename,               // (old, new)
    reset,
  };
}

export default usePresets;

