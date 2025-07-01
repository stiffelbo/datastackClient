/**
 * useAutoColumns - automatyczne generowanie schematu kolumn na podstawie danych
 * 
 * @param {Object[]} data - Tablica rekordów (np. [{ id: 1, name: 'x' }])
 * @returns {ColumnDefinition[]} - Proponowany schemat kolumn
 */

const detectType = (value) => {
  if (value === null || value === undefined) return 'string';
  if (typeof value === 'boolean') return 'boolean';
  if (!isNaN(Date.parse(value))) return 'date';
  if (typeof value === 'number') return 'number';
  return 'string';
};

const detectWidth = (value) => {
  if (value === null || value === undefined) return 90;

  const str = String(value);
  const length = str.length;

  if (length <= 4) return 60;
  if (length <= 8) return 90;
  if (length <= 15) return 120;
  if (length <= 25) return 150;
  if (length <= 40) return 200;
  return 260;
};


const useAutoColumns = (data = []) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const sample = data[0];

  return Object.entries(sample).map(([key, value]) => {
    const type = detectType(value);
    const width = detectWidth(value);
    return {
      field: key,
      headerName: key,
      type,
      width,
      editable: false,
      align: type === 'number' ? 'right' : 'left',
      sortable: true,
      filterable: true,
      aggregationFn: null,
    };
  });
};

export default useAutoColumns;
