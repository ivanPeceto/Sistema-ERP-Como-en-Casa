/**
 * @file auth_service.ts
 * @brief Servicio para gestionar la autenticación de usuarios (login, registro, tokens).
 * @details
 * Este archivo encapsula toda la lógica de comunicación con el microservicio de usuarios.
 * Sigue el patrón de "capa de servicio", abstrayendo las llamadas a la API de los componentes
 * de React. Utiliza la factoría `createAuthApiClient` para generar una instancia de Axios
 * configurada específicamente para el endpoint de usuarios.
 */

import createAuthApiClient from '../api/apiClient'; 
import type { User, AuthResponse } from '../types/models.ts'; 

/**
 * @brief URL base del microservicio de usuarios.
 * @details Se obtiene de las variables de entorno de Vite, inyectadas por Docker Compose.
 */
const USERS_API_BASE_URL = import.meta.env.VITE_API_USUARIOS_URL;

/**
 * @brief Instancia de cliente API exclusiva para el servicio de usuarios.
 * @details Se crea llamando a la factoría con la URL base de este servicio.
 * Todas las funciones en este archivo utilizarán esta instancia.
 */
const apiClient = createAuthApiClient(USERS_API_BASE_URL);

/**
 * @brief Realiza la petición de login al backend.
 * @details Envía las credenciales al endpoint `/login/`. Si la respuesta es exitosa,
 * persiste la sesión del usuario guardando los tokens y los datos del usuario en localStorage.
 * @param {string} email El correo electrónico del usuario.
 * @param {string} password La contraseña del usuario.
 * @returns {Promise<AuthResponse>} Una promesa que se resuelve con los datos de la sesión (tokens y usuario).
 * @throws {Error} Lanza un error (gestionado por Axios) si la petición falla.
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

/**
 * @brief Cierra la sesión del usuario en el lado del cliente.
 * @details Llama a la función `removeTokens` para limpiar toda la información de la sesión
 * del `localStorage`. La redirección es manejada por el `AuthContext`.
 */
export const logout = () => {
  removeTokens();
};

/**
 * @brief Realiza la petición de registro de un nuevo usuario.
 * @details Envía los datos del nuevo usuario al endpoint `/signup/`. Si el registro
 * es exitoso, el backend devuelve tokens, y esta función los guarda para iniciar sesión
 * automáticamente para el nuevo usuario.
 * @param {string} nombre El nombre del nuevo usuario.
 * @param {string} email El correo electrónico del nuevo usuario.
 * @param {string} password La contraseña para el nuevo usuario.
 * @returns {Promise<AuthResponse>} Una promesa que se resuelve con los datos de la sesión del nuevo usuario.
 * @throws {Error} Lanza un error si la petición falla.
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