export {
  createViewConfig,
  normalizeViewConfig,
} from './viewConfigUtils';

// ======================================================
// 🔁 Eksport i import presetów do/z pliku JSON
// ======================================================

export function exportPresetToFile(env, activeName) {
  try {
    const presetData = env.presets?.[activeName];
    if (!presetData) throw new Error('Brak danych do eksportu');

    const blob = new Blob([JSON.stringify(presetData, null, 2)], {
      type: 'application/json',
    });

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

    return {
      name: saveAs || file.name.replace(/\.json$/i, ''),
      data: json,
    };
  } catch (err) {
    console.error('Błąd importu presetu:', err);
    throw err;
  }
}

export const DEFAULT_TRACKED_KEYS = [
  'field',
  'fieldGroup',
  'headerName',
  'type',
  'input',
  'displayType',
  'width',
  'hidden',
  'align',
  'sortable',
  'filterable',
  'filters',
  'aggregationFn',
  'formatterKey',
  'formatterOptions',
  'styleFn',
  'groupBy',
  'groupIndex',
  'order',
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
  if (v === undefined) return null;

  if (typeof v === 'object' && v !== null) {
    try {
      return JSON.stringify(v, Object.keys(v).sort());
    } catch {
      return String(v);
    }
  }

  return v;
};

const NORMALIZE = {
  headerName: (v) => {
    if (v === null || v === undefined) return '';
    return v;
  },

  type: (v) => toEnum(v, ['string', 'number', 'date', 'bool', 'action', 'fk']),
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
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s;
  },

  expresion: (v) => toTrimmed(v),
};

const normalizeOne = (col, tracked = DEFAULT_TRACKED_KEYS) => {
  const out = {};

  for (const key of tracked) {
    let val = col?.[key];

    if (Object.prototype.hasOwnProperty.call(NORMALIZE, key)) {
      val = NORMALIZE[key](val);
    }

    switch (key) {
      case 'headerName':
      case 'formatterKey':
      case 'expresion':
        out[key] = val != null ? String(val) : '';
        break;

      case 'hidden':
      case 'sortable':
      case 'filterable':
      case 'groupBy':
      case 'isSelected':
        out[key] = !!val;
        break;

      case 'width':
      case 'order':
      case 'groupIndex':
        out[key] = Number.isFinite(val) ? Number(val) : null;
        break;

      case 'filters':
        out[key] = Array.isArray(val) ? val.map(f => ({ ...f })) : null;
        break;

      default:
        out[key] = val != null ? val : null;
        break;
    }
  }

  return out;
};

export const normalizeOverrides = (overrides = [], tracked = DEFAULT_TRACKED_KEYS) =>
  [...overrides]
    .map((o, idx) => normalizeOne({ ...o, order: o.order ?? idx }, tracked))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const equalOverrides = (a = [], b = [], tracked = DEFAULT_TRACKED_KEYS) => {
  const aa = normalizeOverrides(a, tracked);
  const bb = normalizeOverrides(b, tracked);

  if (aa.length !== bb.length) return false;

  for (let i = 0; i < aa.length; i++) {
    const x = aa[i];
    const y = bb[i];

    for (const key of tracked) {
      if (stableVal(x[key]) !== stableVal(y[key])) {
        return false;
      }
    }
  }

  return true;
};

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
        changes[key] = {
          from: vA[key],
          to: vB[key],
        };
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