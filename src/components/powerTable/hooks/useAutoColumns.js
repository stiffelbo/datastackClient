/**
 * useAutoColumns - automatyczne generowanie schematu kolumn na podstawie danych
*/

const detectType = (value) => {
  if (typeof value === 'number' && !isNaN(value)) return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string' && !isNaN(Number(value))) return 'number';
  if (!isNaN(Date.parse(value))) return 'date';
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
    .split(/[_\s-]+/)            // rozdziel po _, spacji, myślniku
    .filter(Boolean)             // usuń puste
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const useAutoColumns = (data = []) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const sample = data[0];

  return Object.entries(sample).map(([key, value]) => {
    const type = detectType(value);
    const width = detectWidth(value);
    return {
      field: key,
      fieldGroup: '',
      headerName: prettifyHeader(key),
      type,
      width,
      editable: false,
      hidden: false,
      align: type === 'number' ? 'right' : 'left',
      sortable: true,
      filters: null,
      aggregationFn: null,
      formatterKey : null,
      groupBy: false,
      groupIndex: null,
      source: 'auto',
    };
  });
};

export default useAutoColumns;
