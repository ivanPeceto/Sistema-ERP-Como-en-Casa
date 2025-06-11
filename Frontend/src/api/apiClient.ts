// Frontend/src/api/apiClient.ts

import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, removeTokens, type RefreshTokenResponse } from '../services/auth_service';
// import { jwtDecode } from 'jwt-decode';

/**
 * @brief Crea una instancia de Axios configurada con interceptores para JWT.
 * @details
 * Esta función factoría permite crear instancias de Axios para cada microservicio,
 * asegurando que todas las peticiones lleven el token de acceso y manejen el refresh automáticamente.
 * @param baseURL La URL base del microservicio al que esta instancia se conectará.
 * @returns Una instancia de Axios con interceptores de autenticación.
 */
const createAuthApiClient = (baseURL: string) => { 
  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor de Petición (Request Interceptor)
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

  // Interceptor de Respuesta (Response Interceptor)
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

  return instance; // Devuelve la instancia de Axios configurada
};

// ¡Esta es la exportación correcta de la FUNCIÓN factoría!
export default createAuthApiClient;