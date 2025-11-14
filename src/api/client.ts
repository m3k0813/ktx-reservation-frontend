import axios from 'axios';

const USER_SERVICE_URL = (import.meta as any).env?.VITE_USER_SERVICE_URL || 'http://localhost:8081';
const TRAIN_SERVICE_URL = (import.meta as any).env?.VITE_TRAIN_SERVICE_URL || 'http://localhost:8082';
const SEATS_SERVICE_URL = (import.meta as any).env?.VITE_SEATS_SERVICE_URL || 'http://localhost:8083';
const RESERVATION_SERVICE_URL = (import.meta as any).env?.VITE_RESERVATION_SERVICE_URL || 'http://localhost:8084';

const addAuthInterceptor = (instance: any) => {
  instance.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error?.response?.status === 401) {
      }
      return Promise.reject(error);
    }
  );
};

export const userApi = axios.create({
  baseURL: USER_SERVICE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
addAuthInterceptor(userApi);

export const trainApi = axios.create({
  baseURL: TRAIN_SERVICE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
addAuthInterceptor(trainApi);

export const seatsApi = axios.create({
  baseURL: SEATS_SERVICE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
addAuthInterceptor(seatsApi);

export const reservationApi = axios.create({
  baseURL: RESERVATION_SERVICE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
addAuthInterceptor(reservationApi);

export const api = userApi;

export type ApiError = {
  message?: string;
};


