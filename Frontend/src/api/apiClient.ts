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
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from '../services/auth_service';
import type { RefreshTokenResponse } from '../types/models';
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
      if (token) {
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

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.warn("No refresh token disponible. Redirigiendo a login.");
          removeTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const refreshResponse = await axios.post<RefreshTokenResponse>(
            `${import.meta.env.VITE_API_USUARIOS_URL}/refresh_token/`,
            { refresh: refreshToken, }
          );

          const newAccessToken = refreshResponse.data.access;
          const newRefreshToken = refreshResponse.data.refresh || refreshToken;
          setTokens(newAccessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);

        } catch (refreshError) {
          console.error("Error al refrescar el token. Sesión expirada o refresh token inválido:", refreshError);
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