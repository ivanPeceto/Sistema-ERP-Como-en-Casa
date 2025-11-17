/**
 * @file role_service.ts
 * @brief Servicio para gestionar las operaciones CRUD de roles.
 * @details
 * Este archivo encapsula toda la comunicación con los endpoints de roles
 * del microservicio de productos. Proporciona un conjunto de funciones asíncronas
 * para crear, leer, actualizar y eliminar roles, abstrayendo la lógica de las
 * llamadas API de los componentes de la interfaz de usuario.
 */

import createAuthApiClient from '../api/apiClient';
import { type Rol } from '../types/models';

/**
 * @brief URL base del microservicio que gestiona productos/roles.
 * @details Se obtiene de las variables de entorno de Vite. Es fundamental que la variable
 * `VITE_API_PRODUCTOS_URL` esté definida en el archivo `.env` para que el servicio
 * pueda comunicarse con el backend.
 */
const PRODUCTOS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * @brief Instancia de cliente API exclusiva para el servicio de productos/roles.
 * @details Se crea llamando a la factoría con la URL base de este servicio.
 * Todas las funciones en este archivo utilizarán esta instancia.
 */
const roleAPIClient = createAuthApiClient(PRODUCTOS_API_BASE_URL);

/**
 * @brief Obtiene la lista completa de roles desde el backend.
 * @details Realiza una petición GET al endpoint `/rol/listar/`.
 * @returns {Promise<Rol[]>} Una promesa que se resuelve con un array de objetos Rol.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const getRoles = async (): Promise<Rol[]> => {
  try {
    const response = await roleAPIClient.get<Rol[]>('/api/usuarios/rol/listar/');
    return response.data;
  } catch (error) {
    console.error('Error en getRoles:', error);
    throw error;
  }
};

/**
 * @brief Envía los datos de un nuevo rol al backend para su creación.
 * @details Realiza una petición POST al endpoint `/rol/crear/`.
 * @param {Omit<Rol, 'id'>} rolData Un objeto con los datos del rol a crear.
 * Se utiliza `Omit` para excluir el `id`, ya que es generado por el backend.
 * @returns {Promise<Rol>} Una promesa que se resuelve con el objeto del rol recién creado (incluyendo su nuevo `id`).
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const createRol = async (rolData: Omit<Rol, 'id'>): Promise<Rol> => {
  try {
    const response = await roleAPIClient.post<Rol>('/api/usuarios/rol/crear/', rolData);
    return response.data;
  } catch (error) {
    console.error('Error en createRol:', error);
    throw error;
  }
};

/**
 * @brief Envía datos actualizados de un rol existente al backend.
 * @details Realiza una petición PUT al endpoint `/rol/editar/`, identificando el
 * rol a actualizar mediante un query param `id`.
 * @param {number} id El ID del rol a actualizar.
 * @param {Omit<Rol, 'id'>} rolData Un objeto con los nuevos datos para el rol.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend tras la actualización.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const updateRol = async (id: number, rolData: Omit<Rol, 'id'>): Promise<any> => {
  try {
    const response = await roleAPIClient.put(`/api/usuarios/rol/editar/?id=${id}`, rolData);
    return response.data;
  } catch (error) {
    console.error('Error en updateRol:', error);
    throw error;
  }
};

/**
 * @brief Solicita la eliminación de un rol existente en el backend.
 * @details Realiza una petición POST al endpoint `/rol/eliminar/`, identificando el
 * rol a eliminar mediante un query param `id`.
 * @param {number} id El ID del rol a eliminar.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend tras la eliminación.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const deleteRol = async (id: number): Promise<any> => {
  try {
    const response = await roleAPIClient.post(`/api/usuarios/rol/eliminar/?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteRol:', error);
    throw error;
  }
};
