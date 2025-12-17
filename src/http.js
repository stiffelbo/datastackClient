import axios from 'axios';
import { toast } from 'react-toastify';

const isLocalhost = window.location.hostname === 'localhost';

const apiEndpointBase = isLocalhost
  ? 'http://localhost/datastackServer/api'
  : 'http://192.168.1.135/datastack/api';

const http = axios.create({
  baseURL: apiEndpointBase,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  response => {
    const meta = response?.data?.meta;

    if (meta?.message) {
      const level = meta.level || 'info';

      switch (level) {
        case 'info':
          toast.info(meta.message);
          break;
        case 'warning':
          toast.warn(meta.message);
          break;
        case 'success':
        default:
          toast.success(meta.message);
      }
    }

    return response;
  },
  error => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Błąd serwera lub brak połączenia';

    toast.error(message);
    console.error('[HTTP ERROR]', error);
    return Promise.reject(error);
  }
);

const wrap = {
  get: (url, config) => http.get(url, config).then(res => res.data),
  post: (url, data, config) => http.post(url, data, config).then(res => res.data),
  put: (url, data, config) => http.put(url, data, config).then(res => res.data),
  delete: (url, config) => http.delete(url, config).then(res => res.data),
};

export default wrap;
