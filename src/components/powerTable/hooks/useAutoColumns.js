/**
 * useAutoColumns - automatyczne generowanie schematu kolumn PowerTable na podstawie danych
 * 
 * Tworzy pełny schemat z właściwościami:
 * field, headerName, type, input, options, validationFn,
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
  if (typeof value === 'bool') return 'bool';
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
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
};

/* -------------------------------------------------------------------------- */
/* 🔹 TYPE → INPUT / DISPLAY MAP                                              */
/* -------------------------------------------------------------------------- */

/** Automatyczne dopasowanie typu inputa do typu danych */
const inferinput = (type) => {
  switch (type) {
    case 'number':
      return 'number';
    case 'bool':
      return 'bool';
    case 'date':
      return 'date';
    case 'fk':
      return 'select';
    default:
      return 'text';
  }
};

/** Automatyczne dopasowanie typu wyświetlania (displayType) */
const inferDisplayType = (type) => {
  switch (type) {
    case 'bool':
      return 'bool';
    case 'number':
      return 'numeric';
    case 'date':
      return 'date';
    case 'fk':
      return 'select';
    default:
      return 'text';
  }
};

const inferAlign = (type) => {
  switch (type) {
    case 'bool':
      return 'center';
    case 'number':
      return 'right';
    default:
      return 'left';
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 HOOK                                                                    */
/* -------------------------------------------------------------------------- */

const useAutoColumns = ({data = [], dev = {}}) => {
  //console.log(dev);
  return useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const sample = data[0];
    if (!sample || typeof sample !== 'object') return [];

    return Object.entries(sample).map(([key, value]) => {

      const type = dev[key]?.type ? dev[key].type : detectType(value);
      const input = dev[key]?.input ? dev[key].input : inferinput(value);
      const width = dev[key]?.width ? dev[key].width : detectWidth(value);
      const aggregationFn = dev[key]?.aggregation ? dev[key].aggregation : null
      return {
        /* 📘 Identyfikacja */
        field: key,
        fieldGroup: '',
        headerName: prettifyHeader(key),

        /* 📗 Typy danych i renderowania */
        type,
        input,
        displayType: inferDisplayType(type),

        /* 📙 Edycja / Walidacja */
        editable: false, // lub (params) => bool
        validationFn: null, // (val, params) => true | false | 'error message'
        options: [], // dla selectów / lookupów
        optionsMap: {}, // dla selectów / lookupów

        /* 📒 Formatowanie i wygląd */
        styleFn: null, // (val, params) => sx
        formatterKey: null, // np. 'currencyPL'
        renderCell: null, // niestandardowy renderer: params => <Component />
        align: inferAlign(type),
        hidden: false,
        sortable: true,
        width,

        /* 📕 Grupowanie i agregacje */
        aggregationFn, // 'sum' | 'avg' | fn
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

export const createSelectionColumns = ({isDeleteCol, isSelectCol, isSelectedItemsCol}) => {
  
  const columns = [];
  const makeColumn = (name) => {
    return {
      field: `__action_${name}`,
      fieldGroup: 'actions',
      headerName: name || '',
      order: 0,
      type: 'action',
      align: 'center',
      width: 45,
      sortable: false,
      filterable: false,
      editable: false,
      groupBy: false,
      hidden: false,
      meta : {
        type: name,
      }
    }
  }
  
  if(isDeleteCol) columns.push(makeColumn('delete'));
  if(isSelectCol) columns.push(makeColumn('select'));
  if(isSelectedItemsCol) columns.push(makeColumn('multiSelect'));
  return columns;
};

