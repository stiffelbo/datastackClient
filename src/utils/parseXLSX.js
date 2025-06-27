import * as XLSX from 'xlsx';

/**
 * Parsuje plik XLSX (np. z Clockify) i zwraca tablicę obiektów
 * @param {File} file - Plik XLSX z inputa
 * @returns {Promise<Array<Object>>}
 */
export const parseXLSX = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            cellDates: true,
        });

        resolve(json);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
