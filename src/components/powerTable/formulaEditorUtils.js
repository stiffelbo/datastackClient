// formulaAutocomplete.js

/** Prosty test: czy nazwa nada się do $name bez klamerek */
const SAFE_REF = /^[A-Za-z_][\w.]*$/;

/** Usuwa polskie znaki i normalizuje do porównań */
const deburr = (s = '') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L');

/** Z normalizowanej listy kolumn buduje tablicę sugestii */
export function normalizeDict(dict) {
  // dict może być: { [field]: {type, label?} } lub Array<{name,type,label?}>
  if (Array.isArray(dict)) {
    return dict.map(d => ({
      name: d.name || d.field,
      type: d.type || 'string',
      label: d.label || d.headerName || d.name || d.field,
      _needle: deburr((d.name || d.field || '') + ' ' + (d.label || d.headerName || '')),
    }));
  }
  const out = [];
  for (const k in dict || {}) {
    const v = dict[k] || {};
    const type = v.type || 'string';
    const label = v.label || v.headerName || k;
    out.push({ name: k, type, label, _needle: deburr(`${k} ${label}`) });
  }
  return out;
}

/** Znajduje kontekst referencji pola pod kursorem: $name lub ${name} */
export function getRefContext(value, cursor) {
  // Szukamy granic tokenu od kursora wstecz, aż do separatora lub początku
  const isSep = ch => /[\s,;:+\-*/%&|^=<>()[\]{}]/.test(ch);
  let i = Math.max(0, (cursor ?? value.length) - 1);
  while (i >= 0 && !isSep(value[i])) i--;
  const start = i + 1;
  if (value[start] !== '$') return null;

  const token = value.slice(start, cursor);
  let inBraces = false;
  let query = '';
  if (token.startsWith('${')) {
    inBraces = true;
    query = token.slice(2); // bez ${
  } else {
    query = token.slice(1); // bez $
  }
  // Jeżeli użytkownik zamknął już '}', to nie podpowiadamy
  if (inBraces && query.includes('}')) return null;

  return { start, end: cursor, query, inBraces };
}

/**
 * Główna funkcja: zwraca sugestie pól na podstawie '$' pod kursorem.
 * @param {string} value - pełny tekst formuły
 * @param {Object|Array} dict - słownik pól (patrz normalizeDict)
 * @param {number} cursor - pozycja kursora (domyślnie koniec)
 * @param {number} max - maks. liczba sugestii (domyślnie 20)
 * @returns {null | {
 *   active: true,
 *   range: {start:number, end:number},
 *   query: string,
 *   suggestions: Array<{ name:string, type:string, label:string, insertText:string, score:number }>
 * }}
 */
export function formulaAutocomplete(value, dict, cursor, max = 20) {
  const ctx = getRefContext(value, cursor);
  if (!ctx) return null;

  const list = normalizeDict(dict);
  const q = deburr(ctx.query.trim().toLowerCase());

  // ranking: prefix > contains; dodatkowo preferuj trafienia w name > label
  const scored = list
    .map(item => {
      const name = deburr(item.name.toLowerCase());
      const needle = item._needle.toLowerCase();

      let score = 0;
      if (!q) score = 1; // po samym '$' pokaż wszystko
      else if (name.startsWith(q)) score = 100 - name.length; // mocny prefiks po nazwie
      else if (needle.startsWith(q)) score = 80 - needle.length;
      else if (name.includes(q)) score = 60 - name.indexOf(q);
      else if (needle.includes(q)) score = 40 - needle.indexOf(q);
      else score = -1;

      return score < 0 ? null : { ...item, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, max)
    .map(s => ({
      name: s.name,
      type: s.type,
      label: s.label,
      score: s.score,
      insertText: SAFE_REF.test(s.name) ? `$${s.name}` : `\${${s.name}}`,
    }));

  return {
    active: true,
    range: { start: ctx.start, end: ctx.end },
    query: ctx.query,
    suggestions: scored,
  };
}

/**
 * Wstawia wybraną sugestię do tekstu formuły.
 * @param {string} value
 * @param {{start:number,end:number}} range - fragment do zastąpienia (z `$` do kursora)
 * @param {string} fieldName - nazwa pola do wstawienia
 * @returns {{ text:string, caret:number }}
 */
export function applyAutocomplete(value, range, fieldName) {
  const insert = SAFE_REF.test(fieldName) ? `$${fieldName}` : `\${${fieldName}}`;
  const text = value.slice(0, range.start) + insert + value.slice(range.end);
  const caret = range.start + insert.length;
  return { text, caret };
}

/**
 * Helper: zbuduj słownik z useColumns.columns + customFields
 * @param {Array<{field:string,type?:string,headerName?:string}>} columns
 * @param {Array<{field:string,type?:string,headerName?:string}>} customFields
 * @returns {Array<{name:string,type:string,label:string}>}
 */
export function buildFieldsDict(columns = [], customFields = []) {
  const norm = (arr, badge) =>
    (arr || []).map(c => ({
      name: c.field,
      type: c.type || 'string',
      label: c.headerName ? `${c.headerName}${badge ? ` (${badge})` : ''}` : `${c.field}${badge ? ` (${badge})` : ''}`,
    }));
  return [...norm(columns, ''), ...norm(customFields, 'custom')];
}
