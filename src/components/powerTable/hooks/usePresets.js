// ===============================================================
// usePresets.js – zarządzanie presetami + dirty/staging (bez UI)
// ===============================================================
// Rola: jedyne miejsce odpowiedzialne za pobieranie/zapis presetów,
// wybór aktywnego, staging zmian (dirty) i zapisywanie/odrzucanie.

import { useCallback, useMemo, useState } from 'react';

// ======================================================
// 🔁 Eksport i import presetów do/z pliku JSON
// ======================================================

export function exportPresetToFile(env, activeName) {
  try {
    const presetData = env.presets?.[activeName];
    if (!presetData) throw new Error('Brak danych do eksportu');

    const blob = new Blob([JSON.stringify(presetData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Błąd eksportu presetu:', err);
  }
}

export async function importPresetFromFile(file, saveAs) {
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    if (!json.columns || !Array.isArray(json.columns)) {
      throw new Error('Nieprawidłowy format pliku presetName.json');
    }
    return { name: saveAs || file.name.replace(/\.json$/i, ''), data: json };
  } catch (err) {
    console.error('Błąd importu presetu:', err);
    throw err;
  }
}


// === CENTRALNY ZESTAW KLUCZY DO ŚLEDZENIA (łatwo rozszerzyć) ===
// Klucze zgodne ze strukturą kolumny — do porównywania i zapisu w presetach
const DEFAULT_TRACKED_KEYS = [
  'field',           // obowiązkowe, unikalny identyfikator
  'fieldGroup',      // grupowanie logiczne kolumn
  'headerName',      // etykieta nagłówka
  'type',            // 'string' | 'number' | 'date' | 'boolean'
  'inputType',       // 'text' | 'number' | 'checkbox' | 'select' | 'date'
  'displayType',     // 'text' | 'numeric' | 'boolean' | 'chip' | 'currency'
  'width',           // szerokość kolumny
  'hidden',          // bool – ukryta/pokazana
  'align',           // 'left' | 'center' | 'right'
  'sortable',        // czy można sortować
  'filterable',      // czy można filtrować
  'filters',         // definicje filtrów
  'aggregationFn',   // funkcja agregacji lub jej nazwa ('sum', 'avg', itd.)
  'formatterKey',    // klucz formatowania (np. 'number2', 'PLN', 'percent')
  'formatterOptions',// dodatkowe opcje do formattera
  'styleFn',         // funkcja warunkowa stylowania (zapisz tylko referencję)
  'groupBy',         // czy kolumna grupująca
  'groupIndex',      // kolejność grupowania
  'order',           // pozycja w kolejności kolumn
];



const toNum = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const toBool = (v) => !!v;
const toTrimmed = (v) => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
};
const toEnum = (v, allowed) => (allowed.includes(v) ? v : undefined);

const stableVal = (v) => {
  if (v === undefined) return null; // null i undefined traktujemy jako jedno
  if (typeof v === 'object' && v !== null) {
    try {
      // sortowanie kluczy dla stabilności
      return JSON.stringify(v, Object.keys(v).sort());
    } catch {
      return String(v);
    }
  }
  return v;
};

// Specjalna normalizacja wybranych pól
const NORMALIZE = {
  headerName: (v) => {
    if (v === null || v === undefined) return '';   // zamiast undefined
    return v;
  },
  type: (v) => toEnum(v, ['string', 'number', 'date', 'boolean']),
  align: (v) => toEnum(v, ['left', 'center', 'right']),

  width: (v) => toNum(v),
  order: (v) => toNum(v),
  groupIndex: (v) => toNum(v),

  hidden: (v) => toBool(v),
  sortable: (v) => toBool(v),
  filterable: (v) => toBool(v),
  filters: (v) => Array.isArray(v) ? v.map(f => ({ ...f })) : null,
  groupBy: (v) => toBool(v),
  isSelected: (v) => toBool(v),

  aggregationFn: (v) => (
    typeof v === 'function'
      ? '__fn__'
      : (v ?? undefined)
  ),
  formatterKey: (v) => {
    if (v === null || v === undefined) return null;   // zamiast undefined
    const s = String(v).trim();
    return s; // pozwól nawet na pusty string
  },

  expresion: (v) => toTrimmed(v),
};

// ===========================================================
// normalizeOne – zawsze zwraca pełen zestaw pól z tracked keys
// ===========================================================
const normalizeOne = (col, tracked = DEFAULT_TRACKED_KEYS) => {
  const out = {};

  for (const key of tracked) {
    let val = col?.[key];

    if (Object.prototype.hasOwnProperty.call(NORMALIZE, key)) {
      val = NORMALIZE[key](val);
    }

    switch (key) {
      // stringowe
      case 'headerName':
      case 'formatterKey':
      case 'expresion':
        out[key] = val != null ? String(val) : '';
        break;

      // boolowskie
      case 'hidden':
      case 'sortable':
      case 'filterable':
      case 'groupBy':
      case 'isSelected':
        out[key] = !!val;
        break;

      // liczbowe
      case 'width':
      case 'order':
      case 'groupIndex':
        out[key] = Number.isFinite(val) ? Number(val) : null;
        break;

      // filters → zawsze tablica albo null
      case 'filters':
        out[key] = Array.isArray(val) ? val.map(f => ({ ...f })) : null;
        break;

      // domyślne
      default:
        out[key] = val != null ? val : null;
        break;
    }
  }

  return out;
};

// ===========================================================
// normalizeOverrides – poprawka dla order i sortowania
// ===========================================================

export const normalizeOverrides = (overrides = [], tracked = DEFAULT_TRACKED_KEYS) =>
  [...overrides]
    .map((o, idx) => normalizeOne({ ...o, order: o.order ?? idx }, tracked))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));


// Porównanie dwóch zbiorów override’ów
export const equalOverrides = (a = [], b = [], tracked = DEFAULT_TRACKED_KEYS) => {
  const aa = normalizeOverrides(a, tracked);
  const bb = normalizeOverrides(b, tracked);

  if (aa.length !== bb.length) return false;

  for (let i = 0; i < aa.length; i++) {
    const x = aa[i], y = bb[i];
    for (const key of tracked) {
      if (stableVal(x[key]) !== stableVal(y[key])) {
        return false;
      }
    }
  }
  return true;
};

// Szczegółowy diff (dodane/usunięte/zmodyfikowane)
export const diffOverrides = (prev = [], next = [], tracked = DEFAULT_TRACKED_KEYS) => {
  const a = normalizeOverrides(prev, tracked);
  const b = normalizeOverrides(next, tracked);

  const mapA = new Map(a.map(x => [x.field, x]));
  const mapB = new Map(b.map(x => [x.field, x]));

  const added = [];
  const removed = [];
  const changed = [];

  for (const [field, vA] of mapA) {
    if (!mapB.has(field)) {
      removed.push(field);
      continue;
    }

    const vB = mapB.get(field);
    const changes = {};

    for (const key of tracked) {
      const xv = stableVal(vA[key]);
      const yv = stableVal(vB[key]);
      if (xv !== yv) {
        changes[key] = { from: vA[key], to: vB[key] };
      }
    }

    if (Object.keys(changes).length) {
      changed.push({ field, changes });
    }
  }

  for (const [field] of mapB) {
    if (!mapA.has(field)) {
      added.push(field);
    }
  }

  return { added, removed, changed };
};



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

function usePresets({ entityName, storageNS = 'powerTable' }) {
  const [env, setEnv] = useState(() => loadEnvelope(storageNS, entityName) || createEnvelope('default'));
  const [staged, setStaged] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [diff, setDiff] = useState(null);

  const activeName = env.activePreset;
  const persistedActive = env.presets[activeName] || { columns: [] };
  const effective = staged ?? persistedActive;

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
      saveEnvelope(storageNS, entityName, next);
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
      saveEnvelope(storageNS, entityName, next);
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
    saveEnvelope(storageNS, entityName, next);
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
        presets: Object.keys(rest).length ? rest : createEnvelope('default').presets,
        activePreset: fallback,
      };
      saveEnvelope(storageNS, entityName, next);
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
      saveEnvelope(storageNS, entityName, next);
      return next;
    });
  };

  const reset = () => {
    const fresh = createEnvelope('default');
    setEnv(fresh);
    saveEnvelope(storageNS, entityName, fresh);
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

      // jeśli aktualny preset był "default", też go aktywuj od nowa
      if (prev.activePreset === 'default') {
        next.activePreset = 'default';
      }

      saveEnvelope(storageNS, entityName, next);
      return next;
    });

    setStaged(null);
    setDirty(false);
    setDiff(null);
  }, [entityName, storageNS]);

  return {
    env,
    activeName,
    effective,
    persistedActive,
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
    reinitialize
  };
}


export default usePresets;

