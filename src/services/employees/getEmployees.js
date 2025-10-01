import http from '../../http';

export const getEmployees = async () => {
  return http.get('employees/get.php');
};