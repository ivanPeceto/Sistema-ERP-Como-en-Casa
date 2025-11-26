/**
 * @file user_service.ts
 * @brief Servicio para las operaciones CRUD del microservicio de Usuarios.
 * @details
 * Este archivo centraliza toda la lógica de comunicación con la API del microservicio
 * de usuarios. Proporciona funciones específicas para cada operación (crear, leer,
 * actualizar, eliminar), utilizando una instancia de Axios dedicada y configurada
 * a través de la factoría `createAuthApiClient`.
 */

import createAuthApiClient from '../api/apiClient';
import type { User, UserForm } from '../types/models.ts';

/**
 * @brief URL base del microservicio de usuarios.
 * @details Se obtiene de las variables de entorno de Vite, definidas en `.env`
 * y cargadas en el entorno de Docker.
 */
const USUARIOS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * @brief Instancia de cliente API exclusiva para el servicio de usuarios.
 * @details Se crea llamando a la factoría con la URL base de este servicio.
 * Todas las funciones en este archivo utilizarán esta instancia.
 */
const userAPIClient = createAuthApiClient(USUARIOS_API_BASE_URL);

/**
 * @brief Obtiene la lista completa de usuarios desde el backend.
 * @details Realiza una petición GET al endpoint `/usuarios/listar/`.
 * @returns {Promise<User[]>} Lista de usuarios.
 * @throws {Error} Si la petición falla.
 */
export const getUsuarios = async (): Promise<User[]> => {
    const response = await userAPIClient.get<User[]>('/api/usuarios/listar/');
    return response.data;
};

/**
 * @brief Envía los datos de un nuevo usuario al backend.
 * @details Realiza una petición POST al endpoint `/usuarios/crear/`.
 * @param {Omit<User, 'id'>} usuarioData Datos del usuario a crear.
 * @returns {Promise<User>} Usuario recién creado.
 * @throws {Error} Si la petición falla.
 */
export const createUsuario = async (usuarioData: UserForm): Promise<User> => {
    const response = await userAPIClient.post<User>('/api/usuarios/crear/', usuarioData);
    return response.data;
};

/**
 * @brief Actualiza un usuario existente.
 * @details Realiza una petición PUT al endpoint `/usuarios/editar/`.
 * @param {number} id ID del usuario.
 * @param {Omit<User, 'id'>} usuarioData Nuevos datos.
 * @returns {Promise<any>} Respuesta del backend.
 * @throws {Error} Si la petición falla.
 */
export const updateUsuario = async (id: number, usuarioData: UserForm): Promise<any> => {
    const response = await userAPIClient.put(`/api/usuarios/editar/?id=${id}`, usuarioData);
    return response.data;
};

/**
 * @brief Elimina un usuario existente en el backend.
 * @details Realiza una petición POST al endpoint `/usuarios/eliminar/`.
 * @param {number} id ID del usuario.
 * @returns {Promise<any>} Respuesta del backend.
 * @throws {Error} Si la petición falla.
 */
export const deleteUsuario = async (id: number): Promise<any> => {
    const response = await userAPIClient.post(`/api/usuarios/eliminar/?id=${id}`);
    return response.data;
};
