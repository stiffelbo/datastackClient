import { useMemo } from 'react';

/* -------------------------------------------------------------------------- */
/* 🔹 TYPE DETECTORS                                                          */
/* -------------------------------------------------------------------------- */

const detectType = (value) => {
  if (value === null || value === undefined) return 'string';
  if (typeof value === 'number' && !isNaN(value)) return 'number';
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'string') {
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') return 'number';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  }
  if (value instanceof Date) return 'date';
  return 'string';
};

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

export const prettifyHeader = (str) => {
  if (!str) return '';
  return String(str)
    .trim()
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/* -------------------------------------------------------------------------- */
/* 🔹 TYPE → INPUT / DISPLAY MAP                                              */
/* -------------------------------------------------------------------------- */

const inferInput = (type) => {
  switch (type) {
    case 'number':
      return 'number';
    case 'bool':
    case 'boolean':
      return 'bool';
    case 'date':
      return 'date';
    case 'fk':
      return 'select';
    default:
      return 'text';
  }
};

const inferDisplayType = (type) => {
  switch (type) {
    case 'bool':
    case 'boolean':
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
    case 'boolean':
      return 'center';
    case 'number':
      return 'right';
    default:
      return 'left';
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 HELPERS                                                                 */
/* -------------------------------------------------------------------------- */

const buildColumn = ({ key, value, devCol = {} }) => {
  const type = devCol?.type ?? detectType(value);
  const input = devCol?.input ?? inferInput(type);
  const width = devCol?.width ?? detectWidth(value);
  const aggregationFn = devCol?.aggregationFn ?? devCol?.aggregation ?? null;

  return {
    /* 📘 Identyfikacja */
    field: key,
    fieldGroup: devCol?.fieldGroup ?? '',
    headerName: devCol?.headerName ?? prettifyHeader(key),

    /* 📗 Typy danych i renderowania */
    type,
    input,
    displayType: devCol?.displayType ?? inferDisplayType(type),

    /* 📙 Edycja / Walidacja */
    editable: devCol?.editable ?? false,
    validationFn: devCol?.validationFn ?? null,
    options: devCol?.options ?? [],
    optionsMap: devCol?.optionsMap ?? {},

    /* 📒 Formatowanie i wygląd */
    styleFn: devCol?.styleFn ?? null,
    formatterKey: devCol?.formatterKey ?? null,
    renderCell: devCol?.renderCell ?? null,
    align: devCol?.align ?? inferAlign(type),
    hidden: devCol?.hidden ?? false,
    sortable: devCol?.sortable ?? true,
    width,

    /* 📕 Grupowanie i agregacje */
    aggregationFn,
    groupBy: devCol?.groupBy ?? false,
    groupIndex: devCol?.groupIndex ?? null,

    /* 📔 Dodatkowe */
    filters: devCol?.filters ?? null,
    source: devCol?.source ?? (Object.keys(devCol || {}).length ? 'dev+auto' : 'auto'),

    /* meta opcjonalnie przepuszczamy jeśli dev ma */
    ...(devCol?.meta ? { meta: devCol.meta } : {}),
  };
};

/* -------------------------------------------------------------------------- */
/* 🔹 HOOK                                                                    */
/* -------------------------------------------------------------------------- */

const useAutoColumns = ({ data = [], dev = {}, strictSchema = false }) => {
  return useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    const sample = safeData[0] && typeof safeData[0] === 'object' ? safeData[0] : null;
    const devKeys = dev && typeof dev === 'object' ? Object.keys(dev) : [];

    if (strictSchema) {
      if (devKeys.length === 0) return [];

      return devKeys.map((key) => {
        const value = sample?.[key];
        const devCol = dev[key] || {};
        return buildColumn({ key, value, devCol });
      });
    }

    if (!sample) return [];

    return Object.entries(sample).map(([key, value]) => {
      const devCol = dev[key] || {};
      return buildColumn({ key, value, devCol });
    });
  }, [data, dev, strictSchema]);
};

export default useAutoColumns;

/* -------------------------------------------------------------------------- */
/* 🔹 FABRYKA KOLUMN AKCJI                                                    */
/* -------------------------------------------------------------------------- */

export const createActionColumns = ({ isDeleteCol, isSelectCol, isSelectedItemsCol }) => {
  const columns = [];

  const makeColumn = (name, width = 26) => {
    return {
      field: `__action_${name}`,
      fieldGroup: 'actions',
      headerName: name || '',
      order: 0,
      type: 'action',
      align: 'center',
      width,
      sortable: false,
      filterable: false,
      editable: false,
      groupBy: false,
      hidden: false,
      meta: {
        type: name,
      },
    };
  };

  if (isDeleteCol) columns.push(makeColumn('delete'));
  if (isSelectCol) columns.push(makeColumn('select'));
  if (isSelectedItemsCol) columns.push(makeColumn('multiSelect'));

  return columns;
};