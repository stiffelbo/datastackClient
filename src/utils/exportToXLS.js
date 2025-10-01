import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';


/**
 * Eksportuje dane do Excela zgodnie ze schematem kolumn
 * @param {Array} data - dane (tablica obiektów)
 * @param {Array} columns - schema kolumn (field, headerName, order)
 * @param {string} filename - nazwa pliku
 * @param {string} sheetName - nazwa arkusza
 */
export const exportToXLSWithSchema = (
  data = [],
  columns = [],
  filename = 'export.xlsx',
  sheetName = 'Sheet1'
) => {
  if (!Array.isArray(data) || data.length === 0) {
    toast.warning('Brak danych do przetworzenia dla pliku: ' + sheetName);
    return;
  }

  // sortowanie kolumn po "order"
  const visibleColumns = columns
    .filter(col => !col.hidden)
    .sort((a, b) => a.order - b.order);

  const headers = visibleColumns.map(col => col.headerName);
  const fields = visibleColumns.map(col => col.field);

  // przemodelowanie danych pod kolejność pól + konwersja liczb
  const mappedData = data.map(row =>
    fields.map(field => {
      let value = row[field] ?? '';

      // konwersja liczbowych stringów
      if (typeof value === 'string' && /^\d+([.,]\d+)?$/.test(value)) {
        value = parseFloat(value.replace(',', '.'));
      }

      return value;
    })
  );

  // budujemy arkusz
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...mappedData]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename);
};


// Function to convert array of objects to XLS file
export const exportToXLS = (data = [], filename = 'datastackXls.xlsx', sheetName = 'Sheet1') => {
  if (!Array.isArray(data) || data.length === 0) {
    toast.warning('Brak danych do przetworzenia dla pliku: ' + sheetName);
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert numeric data from comma-separated to dot-separated format
  data.forEach(row => {
    for (let key in row) {
      if (typeof row[key] === 'string' && /^\d+([.,]\d+)?$/.test(row[key])) {
        row[key] = parseFloat(row[key].replace(',', '.'));
      }
    }
  });

  // Convert data array to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write the workbook to a file
  XLSX.writeFile(workbook, filename);
};


/**
 * Recursively flattens grouped data to rows where each group is a column
 * @param {object} data - The nested grouped data
 * @param {string[]} groupKeys - Array of group field names in order
 * @param {string[]} sumFields - Array of sum field names
 * @param {string[]} avgFields - Array of average field names
 * @param {string[][]} rows - Accumulator for flattened rows
 * @param {string[]} currentPath - Path of group values
 */
const flattenGroups = (data, groupKeys = [], sumFields, avgFields, rows, currentPath = []) => {
  Object.entries(data).forEach(([groupKey, group]) => {
    const newPath = [...currentPath, groupKey];

    if (group.groups) {
      flattenGroups(group.groups, groupKeys, sumFields, avgFields, rows, newPath);
    } else {
      const row = {};

      // 🔁 Use generic group column names like "Grupa 0", "Grupa 1", etc.
      groupKeys.forEach((_, idx) => {
        if (idx < newPath.length) {
          row[`Grupa ${idx}`] = newPath[idx];
        }
      });

      // ✅ Add sum fields
      group.sums?.forEach(({ label, value }) => {
        row[label] = value;
      });

      // ✅ Add averages
      group.averages?.forEach(({ label, value }) => {
        row[label] = value;
      });

      rows.push(row);
    }
  });
};




/**
 * Exports grouped data to Excel file
 * @param {object} groupedData - Nested data from Grouper
 * @param {string[]} groupFields - Group field names
 * @param {string[]} sumFields - Sum field names
 * @param {string[]} avgFields - Average field names
 * @param {string} filename - Output filename
 */
export const exportGroupedToXLS = (
  groupedData,
  groupFields = [],
  sumFields = [],
  avgFields = [],
  filename = 'GrupowaneDane.xlsx'
) => {
  if (!groupedData || typeof groupedData !== 'object') {
    toast.warning('Brak danych do wyeksportowania.');
    return;
  }

  console.log('Export grouped to excel', groupedData, groupFields, sumFields, avgFields);
  const rows = [];
  flattenGroups(groupedData, groupFields, sumFields, avgFields, rows);


  if (rows.length === 0) {
    toast.warning('Brak danych do wyeksportowania.');
    return;
  }

  // Create a new workbook and sheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dane Grupowane');
  XLSX.writeFile(workbook, filename);
};

