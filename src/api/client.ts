import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // optional: clear token on unauthorized
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export type ApiError = {
  message?: string;
};


