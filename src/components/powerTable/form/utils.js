/**
 * Zwraca tylko pola które faktycznie mają być wysłane w bulk update:
 * - pomija klucze o wartości undefined (niezmienione)
 * - pomija pola liczbowe, które mają wartość '' lub whitespace (użytkownik nie wpisał nic)
 *
 * @param {Object} formState - aktualny stan formularza (może zawierać undefined dla niezmienionych)
 * @param {Array} schema - tablica pól schema [{ name, type, ... }]
 * @returns {Object} out - obiekt z polami do wysłania
 */
export const bulkFormState = (formState = {}, schema = []) => {
  const schemaMap = {};
  (Array.isArray(schema) ? schema : []).forEach(f => {
    if (f && f.name) schemaMap[f.name] = f;
  });

  const isNumericField = (field) => {
    if (!field) return false;
    const t = (field.type || '').toString().toLowerCase();
    if (t === 'number') return true;
    return /int|decimal|float|numeric|double/.test(t);
  };

  const out = {};

  Object.keys(formState || {}).forEach((key) => {
    const val = formState[key];
    const field = schemaMap[key];

    // brak zmiany
    if (typeof val === 'undefined') return;

    // number: pusty string traktujemy jako brak zmiany
    if (isNumericField(field) && typeof val === 'string' && val.trim() === '') {
      return;
    }

    out[key] = val;
  });

  return out;
};


// --- helpers ---
export const createInitialStateFromSchema = (data = {}, schema = []) => {
  const initial = {};

  schema.forEach((f) => {
    if (!f || !f.name) return;

    const hasOwn = Object.prototype.hasOwnProperty.call(data, f.name);
    const incoming = hasOwn ? data[f.name] : undefined;

    if (incoming !== undefined) {
      initial[f.name] = incoming;
      return;
    }

    if (f.defaultValue !== undefined) {
      initial[f.name] = f.defaultValue;
      return;
    }

    switch (f.type) {
      case 'select-multiple':
        initial[f.name] = [];
        break;

      case 'switch':
      case 'bool':
      case 'boolean':
        initial[f.name] = false;
        break;

      case 'number':
        initial[f.name] = '';
        break;

      case 'date':
      case 'datetime':
        initial[f.name] = '';
        break;

      case 'object':
        initial[f.name] = null;
        break;

      case 'select':
      case 'select-object':
      case 'text':
      case 'email':
      case 'textarea':
      case 'password':
      default:
        initial[f.name] = '';
        break;
    }
  });

  return initial;
};

export const createInitialBulkStateFromSchema = (schema = []) => {
  const initial = {};

  schema.forEach((f) => {
    if (!f || !f.name) return;
    initial[f.name] = undefined;
  });

  return initial;
};

export const applyCompute = (state, schemaRef = []) => {
  const s = { ...state };
  for (const field of schemaRef) {
    if (field && typeof field.compute === 'function' && field.name) {
      try {
        const computed = field.compute(s);
        if (typeof computed !== 'undefined') s[field.name] = computed;
      } catch (err) {
        // ignore compute errors
        // console.warn('compute error', field.name, err);
      }
    }
  }
  return s;
};

// helper: normalizuj selectOptions do postaci { value, label, title, disabled }
export const normalizeOptions = (opts = []) => {
  if (!Array.isArray(opts)) return [];
  if (!opts.length) return [];
  return opts.map((o) => {
    if (o === null || typeof o === 'undefined') return { value: o, label: String(o ?? ''), title: null, disabled: false };
    if (typeof o === 'object') {
      return {
        value: o.value ?? o.id ?? '',
        label: o.label ?? o.val ?? String(o.value ?? o.id ?? ''),
        title: o.title ?? null,
        disabled: !!o.disabled,
        group: o.group ?? ''
      };
    }
    return { value: o, label: String(o), title: null, disabled: false, group: '' };
  });
};


export const formatNumberForDisplay = (v) => {
  if (v === null || v === '') return 'Wyczyść';
  // spróbuj zamienić przecinek -> kropka i usunąć separatory
  const s = String(v).trim().replace(/\s+/g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n.toLocaleString('pl-PL') : String(v);
};

export const formatFieldValue = (field = {}, value) => {
  const t = field.type || '';
  if (typeof value === 'undefined') return '(brak)';
  if (value === null || value === '') return 'Wyczyść';

  switch (t) {
    case 'select':
    case 'select-single':
    case 'select-object': {
      const opts = normalizeOptions(field.selectOptions || []);
      const found = opts.find(o => String(o.value) === String(value));
      return found ? found.label : String(value);
    }
    case 'select-multiple': {
      const opts = normalizeOptions(field.selectOptions || []);
      if (!Array.isArray(value)) return String(value);
      return value.map(v => {
        const f = opts.find(o => String(o.value) === String(v));
        return f ? f.label : String(v);
      }).join(', ');
    }
    case 'boolean':
    case 'switch':
      return value === true || String(value) === '1' || String(value).toLowerCase() === 'true' ? 'Tak' : 'Nie';
    case 'number':
      return formatNumberForDisplay(value);
    case 'file':
      return (value && value.name) ? value.name : String(value);
    case 'date':
      return String(value); // możesz sformatować ISO -> lokalne jeśli chcesz
    default:
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
  }
};

export const prepareFormData = (state) => {
  const formData = new FormData();

  Object.keys(state).forEach((k) => {
    const v = state[k];

    if (v instanceof File || v instanceof Blob) {
      formData.append(k, v);
      return;
    }

    if (Array.isArray(v)) {
      v.forEach((it) => {
        if (it instanceof File || it instanceof Blob) {
          formData.append(`${k}[]`, it);
        } else if (it instanceof Date) {
          formData.append(`${k}[]`, it.toISOString());
        } else if (typeof it === 'object' && it !== null) {
          formData.append(`${k}[]`, JSON.stringify(it));
        } else {
          formData.append(`${k}[]`, it != null ? String(it) : '');
        }
      });
      return;
    }

    if (v instanceof Date) {
      formData.append(k, v.toISOString());
      return;
    }

    if (typeof v === 'boolean') {
      formData.append(k, v ? '1' : '0');
      return;
    }

    if (typeof v === 'object' && v !== null) {
      formData.append(k, JSON.stringify(v));
      return;
    }

    formData.append(k, v != null ? String(v) : '');
  });

  return formData;
};

export const pad2 = (n) => String(n).padStart(2, "0");

export const normalizeDateInputValue = (val) => {
  if (!val) return "";

  if (val instanceof Date && !isNaN(val)) {
    return `${val.getFullYear()}-${pad2(val.getMonth() + 1)}-${pad2(val.getDate())}`;
  }

  const s = String(val).trim();

  // YYYY-MM-DD
  const dateOnly = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;

  // YYYY-MM-DD HH:mm:ss / YYYY-MM-DDTHH:mm:ss
  const dateTime = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T]/);
  if (dateTime) return `${dateTime[1]}-${dateTime[2]}-${dateTime[3]}`;

  const d = new Date(s);
  if (!isNaN(d)) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  return "";
};

export const normalizeDateTimeLocalInputValue = (val) => {
  if (!val) return "";

  if (val instanceof Date && !isNaN(val)) {
    return (
      `${val.getFullYear()}-${pad2(val.getMonth() + 1)}-${pad2(val.getDate())}` +
      `T${pad2(val.getHours())}:${pad2(val.getMinutes())}`
    );
  }

  const s = String(val).trim();

  // YYYY-MM-DDTHH:mm / YYYY-MM-DDTHH:mm:ss
  const isoLocal = s.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?/
  );
  if (isoLocal) {
    return `${isoLocal[1]}-${isoLocal[2]}-${isoLocal[3]}T${isoLocal[4]}:${isoLocal[5]}`;
  }

  // YYYY-MM-DD HH:mm / YYYY-MM-DD HH:mm:ss
  const sqlDateTime = s.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::\d{2})?/
  );
  if (sqlDateTime) {
    return `${sqlDateTime[1]}-${sqlDateTime[2]}-${sqlDateTime[3]}T${sqlDateTime[4]}:${sqlDateTime[5]}`;
  }

  const d = new Date(s);
  if (!isNaN(d)) {
    return (
      `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` +
      `T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    );
  }

  return "";
};