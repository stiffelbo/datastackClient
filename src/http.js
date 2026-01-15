import axios from 'axios';
import { toast } from 'react-toastify';

const isLocalhost = window.location.hostname === 'localhost';

const apiEndpointBase = isLocalhost
  ? 'http://localhost/datastackServer/api'
  : 'http://192.168.1.135/datastack/api';

const isFormData = (v) =>
  typeof FormData !== 'undefined' && v instanceof FormData;

const http = axios.create({
  baseURL: apiEndpointBase,
  withCredentials: true,
  // UWAGA: nie ustawiamy globalnie Content-Type
  // bo to zabija multipart/form-data przy FormData
});

// --- Request interceptor: dobierz Content-Type zależnie od payloadu
http.interceptors.request.use(
  (config) => {
    const data = config?.data;

    config.headers = config.headers || {};

    if (isFormData(data)) {
      // dla FormData: NIE ustawiaj Content-Type (axios sam doda boundary)
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];

      // upewnij się, że nic nie serializuje FormData
      config.transformRequest = [(d) => d];
    } else {
      // domyślnie JSON
      // (tylko jeśli ktoś nie nadpisał w config)
      if (!config.headers['Content-Type'] && !config.headers['content-type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => {
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
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Błąd serwera lub brak połączenia';

    toast.error(message);
    console.error('[HTTP ERROR]', error);
    return Promise.reject(error);
  },
);

const wrap = {
  get: (url, config) => http.get(url, config).then((res) => res.data),
  post: (url, data, config) => http.post(url, data, config).then((res) => res.data),
  put: (url, data, config) => http.put(url, data, config).then((res) => res.data),
  delete: (url, config) => http.delete(url, config).then((res) => res.data),

  // pomocniczo: jawny upload (opcjonalnie, ale wygodne semantycznie)
  upload: (url, formData, config) => {
    if (!isFormData(formData)) {
      throw new Error('wrap.upload wymaga FormData');
    }
    return http.post(url, formData, config).then((res) => res.data);
  },
};

export default wrap;
