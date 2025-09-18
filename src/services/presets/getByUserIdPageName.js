import http from '../../http';
/**
 * Pobranie danych presetów dla danej strony
 * User jest zczytywany z tokenu logowania
 * @param {string} pageName - Name
 */
export const getByUserIdPageName = async (pageName) => {
  return http.get(`presets/getByUserIdPageName.php?pageName=${pageName}`);
};