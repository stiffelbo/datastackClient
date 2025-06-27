import http from '../../http';
/**
 * Upload danych Clockify do backendu
 * @param {Array<Object>} rows - Wiersze z pliku XLSX
 * @param {number} userId - ID zalogowanego użytkownika
 */
export const uploadClockifyData = async (rows) => {
  return http.post('clockify/upload.php', rows);
};