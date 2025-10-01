import http from '../../http';

export const getPeriods = async () => {
  return http.get('periods/getAll.php');
};