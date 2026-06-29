// ===============================================================
// usePresets.js – zarządzanie presetami + dirty/staging (bez UI)
// ===============================================================
// Rola: jedyne miejsce odpowiedzialne za pobieranie/zapis presetów,
// wybór aktywnego, staging zmian (dirty) i zapisywanie/odrzucanie.

import { useCallback, useMemo, useState } from 'react';

import {
  normalizeOverrides,
  equalOverrides,
  diffOverrides,
  createViewConfig,
  normalizeViewConfig,
} from './presetUtils';


/** @typedef {{ field:string, visible?:boolean, width?:number, order?:number, groupBy?:boolean, aggregationFn?:any, sort?:{field:string,direction:'asc'|'desc'}|null }} ColumnOverride */
/** @typedef {{ columns: ColumnOverride[] }} PresetData */
/** @typedef {{ version:number, updatedAt:string, activePreset:string, presets: Record<string, PresetData> }} Envelope */

const KEY = (ns, entity) => `${ns || 'powerTable'}__columns__${entity}`;
const nowISO = () => new Date().toISOString();

const createEnvelope = (active = 'default', defaults = {}) => ({
  version: 1,
  updatedAt: nowISO(),
  activePreset: active,
  viewConfig: createViewConfig(defaults),
  presets: { [active]: { columns: [] } },
});

const loadEnvelope = (ns, entity, defaults = {}) => {
  try {
    const raw = localStorage.getItem(KEY(ns, entity));
    if (!raw) return null;

    const env = JSON.parse(raw);

    if (!env.version) env.version = 1;
    if (!env.activePreset) env.activePreset = 'default';
    if (!env.presets) env.presets = { [env.activePreset]: { columns: [] } };

    env.viewConfig = normalizeViewConfig(env.viewConfig, defaults);

    return env;
  } catch {
    return null;
  }
};

const saveEnvelope = (ns, entity, env) => {
  const toSave = { ...env, updatedAt: nowISO() };
  localStorage.setItem(KEY(ns, entity), JSON.stringify(toSave));
};

function usePresets({
  entityName,
  storageNS = 'powerTable',
  enablePresets = true,
  treeConfig = {},
  tableConfig = {},
}) {

  const defaults = useMemo(
    () => ({ treeConfig, tableConfig }),
    [treeConfig, tableConfig]
  );

  const [env, setEnv] = useState(() => {
    if (!enablePresets) {
      return createEnvelope('default', defaults);
    }

    return (
      loadEnvelope(storageNS, entityName, defaults) ||
      createEnvelope('default', defaults)
    );
  });

  const [staged, setStaged] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [diff, setDiff] = useState(null);

  const activeName = env.activePreset;
  const persistedActive = env.presets[activeName] || { columns: [] };
  const effective = staged ?? persistedActive;

  const viewConfig = normalizeViewConfig(env.viewConfig, defaults);

  // 🚀 stage – bez useCallback, zawsze bierze aktualne dane
  const stage = (nextOverrides) => {
    const nextColumns = normalizeOverrides(nextOverrides || []);
    setStaged({ columns: nextColumns });

    const persistedCols = (env.presets[env.activePreset] || { columns: [] }).columns;
    setDirty(!equalOverrides(nextColumns, persistedCols));
    setDiff(diffOverrides(persistedCols, nextColumns));
  };

  // 🚀 save – bierze staged lub argument
  const save = (overrides) => {
    setEnv(prev => {
      const base = prev.presets[prev.activePreset] || { columns: [] };
      const toWrite = overrides
        ? { columns: normalizeOverrides(overrides) }
        : (staged ?? base);

      const next = {
        ...prev,
        presets: {
          ...prev.presets,
          [prev.activePreset]: toWrite,
        },
      };
      // 🔹 zapisujemy do LS tylko gdy presety są włączone
      if (enablePresets) {
        saveEnvelope(storageNS, entityName, next);
      }
      return next;
    });
    setDirty(false);
    setStaged(null);
    setDiff(null);
  };

  // 🚀 saveAs – to samo
  const saveAs = (name, overrides) => {
    setEnv(prev => {
      const snapshot = overrides
        ? { columns: normalizeOverrides(overrides) }
        : (staged ?? (prev.presets[prev.activePreset] || { columns: [] }));

      const next = {
        ...prev,
        presets: {
          ...prev.presets,
          [name]: snapshot,
        },
        activePreset: name,
      };
      // 🔹 zapisujemy do LS tylko gdy presety są włączone
      if (enablePresets) {
        saveEnvelope(storageNS, entityName, next);
      }
      return next;
    });
    setDirty(false);
    setStaged(null);
    setDiff(null);
  };

  const discard = () => { setStaged(null); setDirty(false); };

  const setActive = (name) => {
    const next = { ...env, activePreset: name };
    setEnv(next);
    if (enablePresets) {
      saveEnvelope(storageNS, entityName, next);
    }
    setStaged(null);
    setDirty(false);
  };

  const remove = (name) => {
    setEnv(prev => {
      if (!prev.presets[name]) return prev;
      const { [name]: _, ...rest } = prev.presets;
      const fallback = prev.activePreset === name ? (Object.keys(rest)[0] || 'default') : prev.activePreset;
      const next = {
        ...prev,
        presets: Object.keys(rest).length
          ? rest
          : createEnvelope('default', defaults).presets,
        activePreset: fallback,
      };
      if (enablePresets) {
        saveEnvelope(storageNS, entityName, next);
      }
      return next;
    });
    if (env.activePreset === name) { setStaged(null); setDirty(false); }
  };

  const rename = (oldName, newName) => {
    setEnv(prev => {
      const data = prev.presets[oldName];
      if (!data || oldName === newName) return prev;
      const { [oldName]: __, ...rest } = prev.presets;
      const next = {
        ...prev,
        presets: { ...rest, [newName]: data },
        activePreset: prev.activePreset === oldName ? newName : prev.activePreset,
      };
      if (enablePresets) {
        saveEnvelope(storageNS, entityName, next);
      }
      return next;
    });
  };

  const reset = () => {
    const fresh = createEnvelope('default', defaults);
    setEnv(fresh);
    if (enablePresets) {
      saveEnvelope(storageNS, entityName, fresh);
    }
    setStaged(null);
    setDirty(false);
  };

  const list = useMemo(() => Object.keys(env.presets), [env.presets]);

  const getEnv = () => env;

  const reinitialize = useCallback(() => {
    setEnv(prev => {
      // skopiuj poprzednie presety
      const next = { ...prev };

      // odtwórz tylko preset "default"
      next.presets = {
        ...prev.presets,
        default: { columns: [] },
      };

      next.viewConfig = createViewConfig(defaults);

      // jeśli aktualny preset był "default", też go aktywuj od nowa
      if (prev.activePreset === 'default') {
        next.activePreset = 'default';
      }
      if (enablePresets) {
        saveEnvelope(storageNS, entityName, next);
      }
      return next;
    });

    setStaged(null);
    setDirty(false);
    setDiff(null);
  }, [entityName, storageNS]);

  //Table Config

  const setViewConfig = (nextViewConfig) => {
    setEnv(prev => {
      const next = {
        ...prev,
        viewConfig: normalizeViewConfig(nextViewConfig, defaults),
      };

      if (enablePresets) {
        saveEnvelope(storageNS, entityName, next);
      }

      return next;
    });
  };

  const setDefaultViewConfig = () => {
    setViewConfig(createViewConfig(defaults));
  };

  return {
    env,
    activeName,
    effective,
    persistedActive,

    viewConfig,
    tableConfig: viewConfig.table,
    treeConfig: viewConfig.tree,
    setViewConfig,
    setDefaultViewConfig,

    list,
    dirty,
    diff,
    stage,
    save,
    saveAs,
    discard,
    setActive,
    remove,
    rename,
    reset,
    getEnv,
    reinitialize,
  };
}


export default usePresets;