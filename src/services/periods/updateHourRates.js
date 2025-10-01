import http from '../../http';

export const updateHourRates = async () => {
  return http.get('periods/updateHourRates.php');
};