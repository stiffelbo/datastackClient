import http from '../../http';

export const getStructures = async () => {
  return http.get('structures/get.php');
};