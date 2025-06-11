/*
 * @file auth_service.ts
 * @description Servicio de autenticación que maneja las operaciones de login, logout y gestión de tokens.
 * Proporciona funciones para autenticar usuarios y mantener el estado de sesión.
 */

import axios from 'axios';

/*
 * Interfaces de autenticación
 */

/**
 * Define la estructura de un usuario autenticado en el sistema.
 * Incluye información básica del usuario y su rol de superusuario.
 */
export interface User {
  id: number;
  email: string;
  nombre: string;
  is_superuser: boolean;
}

/**
 * Define la estructura de la respuesta de autenticación.
 * Incluye tokens de acceso y refresh, así como los datos del usuario.
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Define la estructura de la respuesta para el refresh token.
 * Incluye nuevos tokens de acceso y refresh.
 */
export interface RefreshTokenResponse {
  access: string;
  refresh: string;
}

/*
 * Funciones de gestión de tokens
 */

/**
 * Guarda los tokens de acceso y refresh en localStorage.
 * @param accessToken Token de acceso JWT
 * @param refreshToken Token de refresh
 */
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Elimina los tokens y datos de usuario del localStorage.
 * Se utiliza durante el logout.
 */
export const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/*
 * Funciones de acceso a datos de sesión
 */

/**
 * Obtiene el token de acceso actual.
 * @returns Token de acceso o null si no existe
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Obtiene el token de refresh actual.
 * @returns Token de refresh o null si no existe
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Obtiene los datos del usuario actual.
 * @returns Objeto User o null si no hay usuario
 */
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/*
 * Funciones de autenticación
 */

/**
 * Realiza la petición de login al backend.
 * Utiliza axios directamente para evitar interceptores en el login inicial.
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @returns Promesa que resuelve a la respuesta de autenticación
 * @throws Error si la autenticación falla
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${import.meta.env.VITE_API_USUARIOS_URL}/login/`, {
      email,
      password,
    });

    if (response.data.access && response.data.refresh) {
      setTokens(response.data.access, response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

/**
 * Realiza el logout eliminando los datos de la sesión.
 * Limpia localStorage y los tokens de autenticación.
 */
export const logout = () => {
  removeTokens();
};