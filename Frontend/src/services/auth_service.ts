/**
 * @file auth_service.ts
 * @brief Servicio para gestionar la autenticación de usuarios (login, registro, tokens).
 */

import createAuthApiClient from '../api/apiClient'; // CAMBIO: Importamos la fábrica
import type { User, AuthResponse } from '../types/models.ts'; // Tipos centralizados

// CAMBIO: Definimos la URL base específica para este servicio
const USERS_API_BASE_URL = import.meta.env.VITE_API_USUARIOS_URL;

// CAMBIO: Creamos una instancia de API exclusiva para este servicio
const apiClient = createAuthApiClient(USERS_API_BASE_URL);

/**
 * Realiza la petición de login al backend.
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/login/', {
    email,
    password,
  });
  
  if (response.data.access && response.data.refresh) {
    setTokens(response.data.access, response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

export const logout = () => {
  removeTokens();
};

/**
 * Realiza la petición de registro de un nuevo usuario.
 */
export const register = async (nombre: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/signup/', {
    nombre,
    email,
    password,
  });

  if (response.data.access && response.data.refresh) {
    setTokens(response.data.access, response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
};

// --- Funciones de manejo de tokens en localStorage ---

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

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