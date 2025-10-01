// utils/filterEngine.js

// 🔧 Parser liczbowy odporny na "1 234,56", "1,234.56", NBSP itp.
const toNumberLike = (val) => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number' && Number.isFinite(val)) return val;

  if (typeof val === 'string') {
    // usuń spacje i twarde spacje
    let s = val.replace(/[\s\u00A0\u202F]/g, '').trim();

    const hasComma = s.includes(',');
    const hasDot = s.includes('.');

    if (hasComma && hasDot) {
      // ostatni separator uznajemy za dziesiętny
      const lastComma = s.lastIndexOf(',');
      const lastDot = s.lastIndexOf('.');
      if (lastComma > lastDot) {
        // "1.234,56" -> "1234.56"
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        // "1,234.56" -> "1234.56"
        s = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      // "1234,56" -> "1234.56"
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // "1,234" -> "1234"
      s = s.replace(/,/g, '');
    }

    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export const evaluateFilter = (value, filter) => {
  switch (filter.type) {

    case 'textContains': {
        if (!filter.value) return true; // pusty filtr => no-op

        const needle = String(filter.value).trim();
        const isNeg = needle.startsWith('!');  // 👈 wykrycie negacji
        const searchFor = isNeg ? needle.slice(1) : needle;

        const vStr = String(value ?? '');

        const match = filter.caseSensitive
            ? vStr.includes(searchFor)
            : vStr.toLowerCase().includes(searchFor.toLowerCase());

        return isNeg ? !match : match;
    }

    case 'includeValues':
      // pusta lista => no-op
      if (!Array.isArray(filter.values) || filter.values.length === 0) return true;
      return filter.values.includes(value);

    case 'excludeValues':
      if (!Array.isArray(filter.values) || filter.values.length === 0) return true;
      return !filter.values.includes(value);

    case 'numberRange': {
      const min = filter.value ?? null;
      const max = filter.value2 ?? null;

      // 👇 jeśli nie ustawiono żadnej granicy — filtr jest no-op
      if (min === null && max === null) return true;

      const num = toNumberLike(value);
      if (num === null) return false; // przy ustawionej granicy brak liczby odpada

      if (min !== null && num < min) return false;
      if (max !== null && num > max) return false;
      return true;
    }

    case 'dateRange': {
      const from = filter.value ? new Date(filter.value).getTime() : null;
      const to   = filter.value2 ? new Date(filter.value2).getTime() : null;

      // brak obu granic => no-op
      if (from === null && to === null) return true;

      if (!value) return false;
      const ts = new Date(value).getTime();
      if (!ts) return false;

      if (from !== null && ts < from) return false;
      if (to   !== null && ts > to)   return false;
      return true;
    }

    case 'equals':
      // brak value => no-op
      if (filter.value === undefined) return true;
      return value === filter.value;

    case 'isEmpty':
      return (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      );

    case 'isNotEmpty':
      return !(
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      );

    default:
      return true;
  }
};

export const applyFilters = (data, columns, globalSearch = '') => {
  return data.filter((row) => {
    // global search
    if (globalSearch) {
      const slug = Object.values(row).join(' ').toLowerCase();
      if (!slug.includes(globalSearch.toLowerCase())) return false;
    }

    // field filters
    for (const col of columns) {
      const filters = col.filters || [];
      if (!filters.length) continue;

      const val = row[col.field];

      const textFilters = filters.filter(f => f.type === 'textContains');
      const otherFilters = filters.filter(f => f.type !== 'textContains');

      // najpierw OR dla tekstów
      if (textFilters.length) {
        const ok = textFilters.some(f => evaluateFilter(val, f));
        if (!ok) return false;
      }

      // potem AND dla pozostałych
      for (const f of otherFilters) {
        if (!evaluateFilter(val, f)) return false;
      }
    }
    return true;
  });
};

