import http from '../../http';
/**
 * Upload danych Salaries do backendu
 * @param {Array<Object>} rows - Wiersze z pliku XLSX
 * @param {number} periodID - ID użytkownika użytkownika
 */
export const uploadSalariesData = async (rows, periodID) => {
  return http.post('salaries/upload.php', {rows, periodID});
};