import axios, { AxiosInstance } from 'axios';
import { getToken, renewToken, clearSession } from '@store/helpers';

const service: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

service.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || '';

    // Si es un 403 de lógica de negocio (no de auth), no intentar renovar token
    const isBusinessForbidden = status === 403 && (
      message.includes('plan') ||
      message.includes('límite') ||
      message.includes('permiso') ||
      message.includes('No tiene')
    );
    if (isBusinessForbidden) {
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await renewToken();
        const token = getToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return service(originalRequest);
        }
      } catch (renewError) {
        // Solo limpiar sesión si no estamos en una ruta pública
        const publicRoutes = ['/login', '/home', '/plans'];
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (!publicRoutes.includes(currentPath)) {
          clearSession();
        }
        return Promise.reject(renewError);
      }
    }

    if (originalRequest._retry && (status === 401 || status === 403)) {
      // Solo limpiar sesión si no estamos en una ruta pública
      const publicRoutes = ['/login', '/home', '/plans'];
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (!publicRoutes.includes(currentPath)) {
        clearSession();
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default service;
