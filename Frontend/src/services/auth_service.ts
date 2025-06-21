/**
 * @file auth_service.ts
 * @brief Servicio de autenticación de usuarios
 * @details
 * Este módulo implementa el servicio de autenticación que maneja:
 * - Inicio de sesión de usuarios existentes
 * - Registro de nuevos usuarios
 * - Gestión de tokens de autenticación
 * - Cierre de sesión
 * 
 * Sigue el patrón de diseño de capa de servicios, aislando la lógica de autenticación
 * de los componentes de la interfaz de usuario. Utiliza la factoría `createAuthApiClient`
 * para crear una instancia de Axios configurada específicamente para el endpoint de usuarios.
 * 
 * @see apiClient.ts Para más información sobre el cliente HTTP subyacente
 */

import createAuthApiClient from '../api/apiClient'; 
import type { AuthResponse } from '../types/models.ts'; 
import { setTokens, removeTokens } from '../api/apiClient';

/**
 * @defgroup AuthService Servicio de Autenticación
 * @brief Funcionalidades para la gestión de autenticación de usuarios
 */

/**
 * @var USERS_API_BASE_URL
 * @brief URL base del microservicio de usuarios
 * 
 * @details
 * Se obtiene de las variables de entorno de Vite, las cuales son inyectadas
 * durante el proceso de construcción. En producción, estas variables son
 * proporcionadas por Docker Compose.
 */
const USERS_API_BASE_URL = import.meta.env.VITE_API_USUARIOS_URL;

/**
 * @var userAPIClient
 * @brief Instancia de cliente HTTP configurada para el servicio de usuarios
 * 
 * @details
 * Esta instancia de Axios está preconfigurada con:
 * - URL base del servicio de usuarios
 * - Interceptores para manejo de autenticación
 * - Cabeceras por defecto
 * 
 * Todas las peticiones de autenticación utilizan esta instancia.
 */
const userAPIClient = createAuthApiClient(USERS_API_BASE_URL);

/**
 * @brief Autentica a un usuario en el sistema
 * @param email Correo electrónico del usuario
 * @param password Contraseña del usuario
 * @return {Promise<AuthResponse>} Promesa que resuelve con los datos de la sesión
 * 
 * @details
 * Realiza una petición POST al endpoint `/login/` del servicio de usuarios con las
 * credenciales proporcionadas. En caso de éxito:
 * 1. Almacena el token de acceso y refresh en localStorage
 * 2. Guarda los datos del usuario en localStorage
 * 3. Retorna los datos de la sesión
 * 
 * @throws {AxiosError} Si las credenciales son incorrectas o hay un error de red
 * 
 * @example
 * try {
 *   const session = await login('usuario@ejemplo.com', 'contraseña');
 *   console.log('Usuario autenticado:', session.user);
 * } catch (error) {
 *   console.error('Error de autenticación:', error);
 * }
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await userAPIClient.post<AuthResponse>('/login/', {
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
 * @brief Cierra la sesión del usuario actual
 * 
 * @details
 * Realiza las siguientes acciones para cerrar la sesión:
 * 1. Elimina los tokens de autenticación (access y refresh)
 * 2. Elimina los datos del usuario del localStorage
 * 
 * @note Esta función no realiza una petición al servidor, solo limpia el estado local.
 * La redirección posterior al cierre de sesión debe manejarse en el componente o contexto
 * que llame a esta función.
 * 
 * @see AuthContext Para el manejo del estado de autenticación
 */
export const logout = (): void => {
  removeTokens();
};

/**
 * @brief Registra un nuevo usuario en el sistema
 * @param email Correo electrónico del nuevo usuario
 * @param password Contraseña para la nueva cuenta
 * @param nombre Nombre completo del usuario
 * @return {Promise<AuthResponse>} Promesa que resuelve con los datos de la sesión
 * 
 * @details
 * Realiza una petición POST al endpoint `/signup/` con los datos del nuevo usuario.
 * Si el registro es exitoso:
 * 1. Inicia sesión automáticamente al usuario
 * 2. Almacena los tokens de autenticación
 * 3. Guarda los datos del usuario en localStorage
 * 
 * @throws {AxiosError} Si el correo ya está registrado o hay un error de validación
 */
export const register = async (email: string, password: string, nombre: string): Promise<AuthResponse> => {
  const response = await userAPIClient.post<AuthResponse>('/signup/', {
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

