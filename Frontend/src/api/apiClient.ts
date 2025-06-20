/**
 * @file apiClient.ts
 * @brief Archivo que exporta una función factoría para crear clientes HTTP (Axios) con autenticación JWT.
 * @details
 * Este módulo es el núcleo de la comunicación con el backend. En lugar de exportar una única
 * instancia de Axios, exporta una función `createAuthApiClient`. Esta función es una "fábrica"
 * que genera instancias de Axios pre-configuradas para un microservicio específico,
 * equipadas con interceptores para manejar la autenticación JWT de forma automática.
 */

import axios from 'axios';
import type { RefreshTokenResponse, User } from '../types/models';
/**
/**
 * @brief Crea y configura una instancia de Axios con interceptores para manejar la autenticación JWT.
 * @details
 * Esta función factoría toma una URL base y devuelve una instancia de Axios.
 * Dicha instancia tiene dos interceptores configurados:
 *    1.Interceptor de Petición (Request): Se ejecuta antes de cada petición para inyectar
 * automáticamente el 'access token' en la cabecera 'Authorization'.
 *    2.Interceptor de Respuesta (Response): Se ejecuta al recibir una respuesta. Si detecta
 * un error 401 (Unauthorized), intenta renovar el 'access token' usando el 'refresh token'
 * y reintenta la petición original de forma transparente.
 * 
 * @param {string} baseURL La URL base del microservicio al que esta instancia se conectará.
 * @returns {import('axios').AxiosInstance} Una instancia de Axios configurada y lista para usar.
 */
const createAuthApiClient = (baseURL: string) => { 
  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      const publicUrls = ['/login/', '/signup/', '/refresh_token/'];

      if (token && !publicUrls.some(url => config.url?.includes(url))) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const refreshUrl = `${import.meta.env.VITE_API_USUARIOS_URL}/refresh_token/`;

      if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== refreshUrl) {        
        
        originalRequest._retry = true;
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          removeTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const refreshResponse = await axios.post<RefreshTokenResponse>(
            refreshUrl,
            { refresh: refreshToken, }
          );

          const newAccessToken = refreshResponse.data.access;
          const newRefreshToken = refreshResponse.data.refresh || refreshToken;
          setTokens(newAccessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);

        } catch (refreshError) {
          removeTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance; 
};

export default createAuthApiClient;

/**
 * @brief Guarda el par de tokens en el almacenamiento local.
 * @param {string} accessToken El token de acceso JWT.
 * @param {string} refreshToken El token de refresco JWT.
 */
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * @brief Elimina todos los datos de la sesión del almacenamiento local.
 */
export const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const getAccessToken = (): string | null => localStorage.getItem('accessToken');
export const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};