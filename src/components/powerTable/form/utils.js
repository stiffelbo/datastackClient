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
  // stworzymy mapę schema by szybciej patrzeć typy po nazwie
  const schemaMap = {};
  (Array.isArray(schema) ? schema : []).forEach(f => {
    if (f && f.name) schemaMap[f.name] = f;
  });

  const isNumericField = (field) => {
    if (!field) return false;
    const t = (field.type || '').toString().toLowerCase();
    if (t === 'number') return true;
    // obsłuż różne warianty typów z backendu/schematu
    return /int|decimal|float|numeric|double/.test(t);
  };

  const out = {};
  Object.keys(formState || {}).forEach(key => {
    const val = formState[key];

    // 1) undefined => pomijamy (użytkownik nie zmienił)
    if (typeof val === 'undefined') return;

    const field = schemaMap[key];

    // 2) jeśli pole jest liczbowe i wartość to pusty string / tylko spacje => pomijamy
    if (isNumericField(field)) {
      if (typeof val === 'string' && val.trim() === '') {
        return; // pomiń — nie wysyłamy pustego stringa dla numerów
      }
      // jeśli chcesz dodatkowo znormalizować '12,34' -> 12.34 to zrób to tutaj przed przypisaniem
      // np. out[key] = toNum(val);
    }

    // 3) dla pozostałych przypadków: do out trafia wszystko poza undefined
    out[key] = val;
  });

  return out;
};


// --- helpers ---
export const createInitialStateFromSchema = (data = {}, schema = []) => {
  const initial = {};
  schema.forEach((f) => {
    if (!f || !f.name) return;
    if (data && Object.prototype.hasOwnProperty.call(data, f.name)) {
      initial[f.name] = data[f.name];
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
      case 'boolean':
        initial[f.name] = !!f.defaultValue;
        break;
      case 'number':
        initial[f.name] = f.defaultValue ?? undefined;
        break;
      case 'date':
        initial[f.name] = f.defaultValue ?? undefined;
        break;
      case 'object':
      default:
        initial[f.name] = f.defaultValue ?? undefined;
    }
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
  if(!opts.length) return [];
  return opts.map((o) => {
    if (o === null || typeof o === 'undefined') return { value: o, label: String(o ?? ''), title: null, disabled: false };
    if (typeof o === 'object') {
      return {
        value: o.value ?? o.id ?? '',
        label: o.label ?? o.val ?? String(o.value ?? o.id ?? ''),
        title: o.title ?? null,
        disabled: !!o.disabled,
      };
    }
    return { value: o, label: String(o), title: null, disabled: false };
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
