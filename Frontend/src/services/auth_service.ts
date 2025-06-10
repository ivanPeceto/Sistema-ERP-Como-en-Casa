// Frontend/src/services/authService.ts
import apiClient from '../api/apiClient';

// Interfaces para tipar las respuestas y los datos del usuario
export interface User {
  id: number;
  email: string;
  nombre: string;
  is_superuser: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Realiza la petición de login al backend.
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/login/', {
    email,
    password,
  });
  
  if (response.data.access && response.data.refresh) {
    // Si el login es exitoso, guarda los tokens y datos del usuario
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Realiza el logout eliminando los datos de la sesión.
 */
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // Aquí podrías añadir una llamada a una API de 'blacklist' de tokens si la implementas
};

/**
 * Obtiene el token de acceso guardado.
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Obtiene el token de refresco guardado.
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Obtiene los datos del usuario guardados.
 */
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};