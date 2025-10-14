/**
 * useAutoColumns - automatyczne generowanie schematu kolumn PowerTable na podstawie danych
 * 
 * Tworzy pełny schemat z właściwościami:
 * field, headerName, type, inputType, options, validationFn,
 * editable, hidden, styleFn, align, sortable, width, filters,
 * aggregationFn, formatterKey, renderCell, groupBy, groupIndex, source
 */

import { useMemo } from 'react';

/* -------------------------------------------------------------------------- */
/* 🔹 TYPE DETECTORS                                                          */
/* -------------------------------------------------------------------------- */

/** Detekcja typu danych */
const detectType = (value) => {
  if (value === null || value === undefined) return 'string';
  if (typeof value === 'number' && !isNaN(value)) return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') {
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') return 'number';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  }
  if (value instanceof Date) return 'date';
  return 'string';
};

/** Detekcja preferowanej szerokości kolumny */
const detectWidth = (value) => {
  if (value === null || value === undefined) return 90;
  const str = String(value);
  const length = str.length;
  if (length <= 4) return 80;
  if (length <= 8) return 110;
  if (length <= 15) return 160;
  if (length <= 25) return 200;
  if (length <= 40) return 260;
  return 320;
};

/** Upiększanie nazw kolumn */
export const prettifyHeader = (str) => {
  if (!str) return '';
  return String(str)
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
};

/* -------------------------------------------------------------------------- */
/* 🔹 TYPE → INPUT / DISPLAY MAP                                              */
/* -------------------------------------------------------------------------- */

/** Automatyczne dopasowanie typu inputa do typu danych */
const inferInputType = (type) => {
  switch (type) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'checkbox';
    case 'date':
      return 'date';
    default:
      return 'text';
  }
};

/** Automatyczne dopasowanie typu wyświetlania (displayType) */
const inferDisplayType = (type) => {
  switch (type) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'numeric';
    case 'date':
      return 'date';
    default:
      return 'text';
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 HOOK                                                                    */
/* -------------------------------------------------------------------------- */

const useAutoColumns = (data = []) => {
  return useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const sample = data[0];
    if (!sample || typeof sample !== 'object') return [];

    return Object.entries(sample).map(([key, value]) => {
      const type = detectType(value);
      const width = detectWidth(value);

      return {
        /* 📘 Identyfikacja */
        field: key,
        fieldGroup: '',
        headerName: prettifyHeader(key),

        /* 📗 Typy danych i renderowania */
        type,
        inputType: inferInputType(type),
        displayType: inferDisplayType(type),

        /* 📙 Edycja / Walidacja */
        editable: false, // lub (params) => boolean
        validationFn: null, // (val, params) => true | false | 'error message'
        options: [], // dla selectów / lookupów

        /* 📒 Formatowanie i wygląd */
        styleFn: null, // (val, params) => sx
        formatterKey: null, // np. 'currencyPL'
        renderCell: null, // niestandardowy renderer: params => <Component />
        align: type === 'number' ? 'right' : 'left',
        hidden: false,
        sortable: true,
        width,

        /* 📕 Grupowanie i agregacje */
        aggregationFn: null, // 'sum' | 'avg' | fn
        groupBy: false,
        groupIndex: null,

        /* 📔 Dodatkowe */
        filters: null,
        source: 'auto',
      };
    });
  }, [data]);
};

export default useAutoColumns;

/* -------------------------------------------------------------------------- */
/* 🔹 FABRYKA KOLUMN AKCJI                                                   */
/* -------------------------------------------------------------------------- */
/**
 * Tworzy kolumny akcji (action columns) z listy akcji
 * @param {Array} actions - lista akcji np. [{ type:'delete', label:'Usuń', onAction }]
 * @param {Function} exec - opcjonalny executor akcji
 */
export const createActionColumns = (actions = [], exec, COLUMN_ACTIONS = []) => {
  if (!Array.isArray(actions) || !actions.length) return [];

  return actions.filter(i => COLUMN_ACTIONS.includes(i.type)).map((a, idx) => ({
    field: `__action_${a.type}`,
    fieldGroup: 'actions',
    headerName: a.label || '',
    order: idx,
    type: 'action',
    align: 'center',
    width: 60,
    sortable: false,
    filterable: false,
    editable: false,
    groupBy: false,
    hidden: false,
    meta: a, // dane o akcji (ikona, label, confirm, itp.)
    onAction: (params) => exec?.(a.type, params) || a.handler?.(params),
  }));
};

